// Streaming Torre search service using manual NDJSON parsing (more reliable
// across Node/Web fetch implementations than streamparser in this context).

export interface TorreSearchParams {
  query: string;
  identityType?: 'person' | 'organization' | 'all';
  limit?: number;
  meta?: boolean;
  torreGrams?: any; // unknown structure, pass through
}

export interface TorreSearchResult {
  ardaId: number;
  name: string;
  username: string;
  professionalHeadline?: string;
  imageUrl?: string | null;
  [k: string]: any;
}

/**
 * streamTorreSearch
 * Calls Torre streaming endpoint and yields each parsed object as it arrives.
 */
export async function streamTorreSearch(params: TorreSearchParams, onResult: (r: TorreSearchResult) => void) {
  const body = {
    query: params.query,
    identityType: params.identityType || 'person',
    limit: params.limit || 10,
    meta: params.meta,
    torreGrams: params.torreGrams
  };

  const res = await fetch('https://torre.ai/api/entities/_searchStream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok || !res.body) {
    throw new Error(`Upstream error ${res.status}`);
  }

  // Manual incremental NDJSON parsing. Torre stream appears to send a series of
  // JSON objects without guaranteed newlines; we normalize `}{` boundaries.
  const reader = (res.body as any).getReader?.();
  if (!reader) throw new Error('ReadableStream reader unavailable');
  const decoder = new TextDecoder();
  let buffer = '';
  let emitted = 0;
  const target = body.limit || 10;

  while (emitted < target) {
    const { done, value } = await reader.read();
    if (done) {
      extractObjects(true);
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    extractObjects(false);
  }

  function extractObjects(flush: boolean) {
    let i = 0;
    let depth = 0;
    let start = -1;
    while (i < buffer.length) {
      const ch = buffer[i];
      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const jsonStr = buffer.slice(start, i + 1);
          try {
            const obj = JSON.parse(jsonStr) as TorreSearchResult;
            onResult(obj);
            emitted++;
            if (emitted >= target) {
              // Truncate buffer to remaining part after current object
              buffer = buffer.slice(i + 1);
              return;
            }
          } catch {
            // keep accumulating if parse fails
          }
          // Remove processed data from buffer
          buffer = buffer.slice(i + 1);
          i = -1; // reset index relative to new buffer
          start = -1;
        }
      }
      i++;
    }
    if (flush && depth === 0) {
      buffer = ''; // nothing left parseable
    }
  }
}
