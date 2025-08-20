````markdown
# Data Flow & Events

## Streaming People Search
```mermaid
sequenceDiagram
  participant User
  participant UI as SearchShell
  participant API as /api/people
  participant Torre as _searchStream

  User->>UI: Click Stream
  UI->>API: GET /api/people?stream=true&q=...
  API->>Torre: POST _searchStream
  Torre-->>API: NDJSON objects
  loop per object
    API-->>UI: SSE data:{"result": entity}
    UI->>UI: append result & maybe prefetch genome
  end
  API-->>UI: SSE data:[DONE]
  UI->>User: Updates status (stream ended)
```

## Genome Prefetch
```mermaid
flowchart LR
  R[Results Array] -->|top 6 usernames| Q[Prefetch Queue]
  Q -->|<=3 concurrent| F[fetch /api/profile/:u]
  F --> C[(Genome Cache)]
  C --> Drawer[Profile Drawer]
```

## Compare Strength Aggregation
```mermaid
flowchart TB
  subgraph ComparePanel
    P1[(Profile A strengths)] --> M{Map name->count}
    P2[(Profile B strengths)] --> M
    P3[(Profile C strengths)] --> M
    M --> Shared[Shared >1]
    M --> Unique[Unique ==1]
  end
```

## Event Summary
| Event | Source | Meaning |
|-------|--------|---------|
| result (SSE) | /api/people | One search entity mapped |
| [DONE] | /api/people | Upstream ended normally |
| [LIMIT_REACHED] | /api/people | Local limit satisfied early |
| toast push | UI actions | Feedback (pin/save/remove) |

````
