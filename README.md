# NIST Compass

A lightweight **Governance, Risk, and Compliance (GRC)** platform for small and
mid-sized teams, centered on **NIST CSF 2.0**. Track compliance gaps, assign
owners, store evidence, manage a compliance calendar, and run reports — without
the cost and complexity of enterprise GRC suites.

> Not a replacement for ServiceNow GRC / Archer / AuditBoard. A simple,
> affordable way to actually *run* a compliance program.

## Features (V1 / MVP)

- **Dashboard** — open vs. closed gaps, overdue items, upcoming deadlines.
- **NIST CSF 2.0 library** — browse all 6 functions, 22 categories, and the full
  subcategory catalog; create a gap from any subcategory.
- **Gap register** — title, description, current/desired state, risk, status.
- **Ownership tracking** — owner, due date, priority, notes.
- **Evidence repository** — attach files/screenshots to gaps (Supabase Storage,
  private, signed URLs).
- **Compliance calendar** — recurring access/vendor/policy/control reviews.
- **Reports** — Open Gap, Overdue Items, Executive Summary (+ CSV export).

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Supabase (Postgres, Auth, Storage) |
| Auth | Supabase Auth (email/password + magic link) |
| Hosting | Vercel (frontend) + Supabase (managed backend) |

Multi-tenant from day one, with tenant isolation enforced by Postgres **Row
Level Security**.

## Documentation

The full design set lives in [`docs/`](./docs):

1. [System Architecture](./docs/01-system-architecture.md)
2. [Database Schema](./docs/02-database-schema.md)
3. [MVP Wireframes](./docs/03-wireframes.md)
4. [User Flows](./docs/04-user-flows.md)
5. [Development Roadmap](./docs/05-development-roadmap.md)
6. [Folder Structure](./docs/06-folder-structure.md)
7. [API Design](./docs/07-api-design.md)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

Then copy your keys into `.env.local`:

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY
```

### 3. Apply the database schema + seed

Run the SQL (Supabase SQL editor, or `psql`, or the Supabase CLI) in order:

```text
supabase/migrations/0001_schema.sql      # tables, indexes, triggers, views
supabase/migrations/0002_policies.sql     # RLS + storage policies + bucket
supabase/seed.sql                         # NIST CSF 2.0 catalog
```

### 4. Run

```bash
npm run dev          # http://localhost:3000
```

Sign up, name your organization, and start from the **Framework** tab.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | TypeScript, no emit |

## Project layout

See [`docs/06-folder-structure.md`](./docs/06-folder-structure.md). In short:
`src/app/(auth)` for public auth pages, `src/app/(app)` for the authenticated
shell, `src/lib/supabase` for the only place clients are constructed,
`supabase/` for schema + seed.

## Roadmap

- **V2** — ISO 27001, SOC 2 mapping, SOX controls, framework cross-mapping.
- **V3** — optional, strictly bounded AI assistant (explain controls, suggest
  remediation) that never analyzes uploaded evidence or moves customer data off
  platform.

See [`docs/05-development-roadmap.md`](./docs/05-development-roadmap.md).
