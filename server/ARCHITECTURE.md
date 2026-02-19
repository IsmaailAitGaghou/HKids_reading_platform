# HKids Backend Architecture

## High-Level Diagram

```mermaid
flowchart LR
  ADMIN[Admin Back-office] -->|CMS + Platform Analytics| API[Express API]
  PARENT[Parent Portal] -->|Children + Policies + Child Analytics| API
  CHILD[Child Reader] -->|Filtered Library + Reading Sessions| API

  API --> DB[(MongoDB)]
  API --> MEDIA[Cloudinary]
  API --> DOCS[Swagger /docs]

  subgraph Core Domain Modules
    AUTH[Auth / Roles]
    CMS[Books + Categories + Age Groups]
    FAMILY[Children + Policies]
    READER[Kids Library + Reading Tracking]
    ANALYTICS[Parent/Admin Analytics]
  end

  API --- AUTH
  API --- CMS
  API --- FAMILY
  API --- READER
  API --- ANALYTICS
```

## Role Separation

- `ADMIN`: content management and global analytics
- `PARENT`: child profiles, permissions, limits, child analytics
- `CHILD`: restricted reading only (policy enforced server-side)

## Policy Enforcement Model

Child access is controlled by `ChildPolicy`:

- `allowedCategoryIds[]`
- `allowedAgeGroupIds[]`
- `dailyLimitMinutes`
- optional reading schedule window (`start`, `end`)

Server validates policy in `kids` endpoints before exposing books/pages or starting sessions.

## Analytics Sources

- `ReadingSession` stores session start/end, minutes, pages read, progress events.
- Parent analytics aggregates by child and date range.
- Admin analytics aggregates platform usage and top books.
