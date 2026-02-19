# HKids Backend (Express + TypeScript)

Role-based backend for:

- `ADMIN`: full CMS + platform analytics
- `PARENT`: family portal (children, policies, limits, analytics)
- `CHILD`: distraction-free reader with enforced policy filters

## Core Modules

- `auth`: parent/admin login + optional child PIN login
- `age-groups`: admin CRUD + public listing
- `categories`: admin CRUD + public listing
- `books`: admin CMS (CRUD/review/publish/page reorder)
- `parent`: children CRUD, policy controls, analytics per child
- `kids`: filtered library, secure book access, reading session tracking
- `analytics`: admin overview, reading trends, top books
- `uploads`: admin image uploads via Cloudinary

## Main Route Groups

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/child/pin`
- `GET /api/v1/auth/me`

- `GET /api/v1/age-groups/public`
- `GET|POST|PATCH|DELETE /api/v1/age-groups/*` (ADMIN)

- `GET /api/v1/categories/public`
- `GET|POST|PATCH|DELETE /api/v1/categories/*` (ADMIN)

- `GET|POST|PATCH|DELETE /api/v1/books/*` (ADMIN)
- `PATCH /api/v1/books/:id/pages/reorder` (ADMIN)

- `GET|POST|PATCH|DELETE /api/v1/parent/children*` (PARENT)
- `GET|PATCH /api/v1/parent/children/:id/policy` (PARENT)
- `GET /api/v1/parent/children/:id/analytics` (PARENT)

- `GET /api/v1/kids/books` (CHILD)
- `GET /api/v1/kids/books/:id` (CHILD)
- `GET /api/v1/kids/books/:id/pages` (CHILD)
- `POST /api/v1/kids/reading/start|progress|end` (CHILD)

- `GET /api/v1/admin/analytics/overview` (ADMIN)
- `GET /api/v1/admin/analytics/reading` (ADMIN)
- `GET /api/v1/admin/analytics/books/top` (ADMIN)

## Setup

1. `npm install`
2. Copy `.env.example` to `.env`
3. Set at least:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `ADMIN_BOOTSTRAP_KEY`
4. `npm run dev`
5. Open docs at `http://localhost:4000/docs`

## Seed Demo Data

Run:

```bash
npm run seed
```

This clears current data and inserts demo records:

- Admin: `admin@hkids.local` / `Admin12345!`
- Parent: `parent@hkids.local` / `Parent12345!`
- Child PINs: `Leo=1234`, `Mia=2468`
