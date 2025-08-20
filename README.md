# Dream Team Builder

Streamed talent discovery, shortlist management, and side‑by‑side profile comparison with lightweight visualization (radar, strength bars) powered by Torre public endpoints.

## Current Features
- Real‑time streaming search (people or organizations) with incremental rendering (SSE proxy).
- Local shortlist(s) with add/remove and persistence (localStorage).
- Profile drawer with overview, strengths (bars + radar), roles, education, languages.
- Compare panel (up to 3 profiles) highlighting shared vs unique strengths.
- Animated, dark themed UI (Framer Motion) with toasts & skeletons.
- Genome prefetch & caching for first results to reduce open latency.

## Roadmap / Next Ideas
- Result list virtualization (react-virtuoso) for very large streams.
- Drag & drop shortlist reordering (dnd-kit).
- Compare panel filters (show shared / unique only) & sort by frequency.
- Accessibility: improved keyboard nav for compare panel.
- Cleanup: remove unused dependencies & further bundle trimming.

## Tech Stack
- Next.js 14 (App Router; edge-compatible proxy routes)
- TypeScript + React 18
- Tailwind CSS design tokens
- Framer Motion for micro‑interactions
- Radix UI primitives (tabs, toast, scroll area)
- Server‑Sent Events (EventSource) for streaming results

## Getting Started
```bash
npm install
npm run dev
```
Visit http://localhost:3000 and start exploring.

## Internal API Routes
- `GET /api/people?stream=true&q=QUERY&type=person|organization` – SSE stream
- `GET /api/profile/:username` – genome proxy (60s cache)

## Torre Upstream Endpoints
- `POST https://torre.ai/api/entities/_searchStream`
- `GET  https://torre.ai/api/genome/bios/:username`

## Disclaimer
Not affiliated with Torre. Educational/demo use only.