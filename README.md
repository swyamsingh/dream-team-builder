# Torre Talent Radar

Focused streaming talent discovery & lightweight shortlist app built on Torre public endpoints.

## Current Features
- Real-time streaming search (people or organizations) via `entities/_searchStream` (proxied).
- Incremental result rendering with save/un-save to local shortlists (localStorage persistence).
- Profile drawer: fetches genome/bio (`genome/bios/:username`) showing headline & strengths.
- Lists section with counts (default list for now).

## Roadmap
- Facet filters: location, remote, compensation range.
- Multiple named lists CRUD + export/import JSON.
- Skeleton loading states & accessibility polish (focus trap, ARIA live regions).
- Optional jobs tab & team optimizer integration.

## Tech Stack
- Next.js 14 (App Router, Edge runtime for proxy routes)
- TypeScript, React 18
- Tailwind CSS with semantic design tokens
- Server-Sent Events (EventSource) for streaming results

## Getting Started
```bash
npm install
npm run dev
```
Visit http://localhost:3000 and start streaming.

## API Surface (Internal)
- `GET /api/people?stream=true&q=QUERY&type=person|organization` – NDJSON stream
- `GET /api/profile/:username` – genome proxy (60s public cache)

## Torre Upstream Endpoints
- `POST https://torre.ai/api/entities/_searchStream`
- `GET  https://torre.ai/api/genome/bios/:username`

## Disclaimer
Not affiliated with Torre. For demo/educational use only.