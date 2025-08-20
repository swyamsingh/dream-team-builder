````markdown
# Architecture

This document outlines the high-level architecture of Dream Team Builder.

## Overview Diagram
```mermaid
flowchart TB
  subgraph Client (Browser)
    A[Search UI] --> B[Genome Cache]
    A --> C[Compare Panel]
    C --> B
  end
  A -->|SSE| P[/api/people?stream=true/]
  P -->|fetch| U[(Torre _searchStream)]
  A -->|on demand| G[/api/profile/:username/]
  G -->|fetch| H[(Torre genome/bios/:username)]
```

## Key Modules
| Module | Responsibility |
|--------|----------------|
| SearchShell | Manages query UI & streaming lifecycle |
| streamClient | Opens EventSource and routes results |
| GenomeCacheProvider | Background prefetch + in-memory cache |
| ProfileDrawer | Detailed candidate view (tabs) |
| CompareContext/Panel | Pin up to 3 profiles & compare strengths |
| Radar | Animated visualization of top strengths |
| Toast System | Lightweight notification queue |

## Data Flow
1. User starts stream; EventSource begins receiving SSE messages.
2. Each entity appended to results; first 6 trigger genome prefetch.
3. User opens a profile -> drawer resolves genome (cached or fetch).
4. Pinning adds username (and metadata) to compare context; panel fetches missing genomes lazily.
5. Compare panel computes shared/unique strengths on render (Map counting occurrences).

## Caching Strategy
| Layer | TTL | Notes |
|-------|-----|-------|
| Browser genome cache | Session | In-memory only; cleared on refresh |
| Upstream profile route | 60s (soft) | Response not explicitly cached yet client-side |

## Performance Techniques
- Streaming incremental render (fast TTI for first results).
- Prefetch limited concurrency (3) to avoid connection saturation.
- Stagger only first 12 results (bounded animation overhead).
- One-time radar animation (ref guard) to prevent repeated work.
- Avoid heavy PDF export libs (removed) to slim bundle.

## Security Considerations
- No auth (demo). If productionized: add rate-limits & sanitization.
- Upstream endpoints publicly accessible; no secrets stored.

## Future Improvements
- Virtualized result list
- Server-side caching layer for genome responses
- Robust error boundary & offline fallback

````
