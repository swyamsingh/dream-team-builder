# Torre API (Working Notes)

## Genome Bio Endpoint
`GET https://torre.ai/api/genome/bios/:username`

Captured example for `torrenegra`.

### Sample Request
```
GET /api/genome/bios/torrenegra HTTP/2
Host: torre.ai
Accept: application/json
Accept-Encoding: gzip, deflate, br
User-Agent: curl/8.x (prototype capture)
```

### Response (truncated)
Headers:
```
HTTP/2 200
content-type: application/json
content-encoding: gzip
server: nginx/1.22.0
strict-transport-security: max-age=31536000; includeSubDomains
```
Body size (compressed ~110 KB). Tail snippet shows nested strengths, experiences, publications, education arrays.

### High-level Schema (partial)
```jsonc
{
  "person": {
    "id": "number|string",
    "name": "string",
    "professionalHeadline": "string",
    "username": "string",
    "picture": "url",
    "summaryOfBio": "string",
    "weight": "number"
  },
  "strengths": [
    {
      "id": "string",
      "code": "number",
      "name": "string",
      "proficiency": "novice|proficient|expert|...",
      "weight": "number",
      "recommendations": "number",
      "relatedExperiences": ["id"],
      "pin": true
    }
  ],
  "experiences": [ { /* awards|jobs|projects|education etc */ } ],
  "publications": [ { /* publication objects */ } ],
  "education": [ { /* education objects */ } ],
  "languages": [ { "code": "en", "language": "English", "fluency": "fully-fluent" } ],
  "preferences": { /* job preferences incl. compensation */ }
}
```

## People Search (Streaming) `_searchStream`
`POST https://torre.ai/api/entities/_searchStream`

### Status (Updated)
OpenAPI spec for service discovered at `https://arda.torre.co/v3/api-docs/` (Swagger UI hosted under `https://arda.torre.co/webjars/swagger-ui/`).

Relevant paths:
```
POST /entities/_search        (non-streaming aggregate JSON)
POST /entities/_searchStream  (streaming NDJSON)
```

Shared request schema: `SearchPeopleSchema`:
```jsonc
{
  "query": "string",          // free-text search term
  "torreGgId": "string?",     // optional group context
  "identityType": "person" | "organization" | "all",
  "limit": number,             // max results to return/stream
  "meta": boolean?,            // include meta information (observed in spec)
  "excluding": string[]?,
  "excludedPeople": string[]?,
  "excludeContacts": boolean?
}
```

### Working Requests
Non‑streaming example:
```bash
POST https://arda.torre.co/entities/_search
{"query":"alexander","identityType":"person","limit":2}
```
Returns JSON object:
```jsonc
{
  "results": [ { /* person */ }, { /* person */ } ]
}
```

Streaming example:
```bash
POST https://arda.torre.co/entities/_searchStream
Content-Type: application/json
{"query":"alexander","identityType":"person","limit":2}
```
Response headers (abridged):
```
HTTP/2 200
content-type: application/x-ndjson
```
Body: newline / whitespace separated JSON objects (NDJSON). Each line/object = one entity.

### Observed NDJSON Sample (2 records, wrapped for readability)
```jsonc
{"ardaId":18163,"ggId":"13","name":"Alexander Torrenegra", ... ,"contact":false}
{"ardaId":75045748,"ggId":"2200534","name":"WILMAN ALEXANDER CASTRO VARGAS", ... ,"contact":false}
```

Note: In raw stream, objects may be separated by spaces instead of strict `\n`; robust parser should treat any `}\s*{` boundary or newline as a record delimiter.

### Error Pattern (Earlier Guesses)
Previous malformed attempts used unsupported nested structures (`{"query":{"name":"..."}}`) leading to HTTP 400 with uniform small error JSON (length 138). Correct contract requires `query` to be a plain string.

### Implementation Plan
1. Server route `/api/people` will accept `q` and optional `limit` query params.
2. For streaming: issue fetch to `_searchStream` and parse incrementally via `ReadableStream` -> text decoder -> delimiter splitting.
3. Provide fallback to non‑streaming `_search` if streaming fails (graceful degradation for environments without streaming support).
4. Apply Zod validation to sanitize upstream query params and each record.
5. Enhance UI to show progressively loaded results + skill aggregation (computed incrementally from streamed records). 

### Parser Edge Cases
- Partial JSON chunk boundaries mid-object.
- Trailing whitespace after final object.
- Potential empty stream (no matches) => no objects (handle gracefully).
- Large result sets: enforce `limit` to avoid unbounded memory.
- Non‑JSON noise (unlikely) -> try/catch per candidate record.

### Planned Wrapper Interface
```ts
interface TorreSearchPerson {
  id: string; // or numeric
  name: string;
  username: string;
  professionalHeadline?: string;
  picture?: string;
  strengths?: { name: string; proficiency: string }[];
}

async function* searchPeopleStream(query: string): AsyncGenerator<TorreSearchPerson, void, void> {
  // POST real payload once known
}
```

---
These notes will be updated once the live payload is captured from the browser.
