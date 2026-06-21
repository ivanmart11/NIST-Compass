# 01 — System Architecture

> NIST Compass — a lightweight GRC platform for SMBs, centered on NIST CSF 2.0.

## 1. Architectural goals

| Goal | How we achieve it |
| --- | --- |
| Ship fast | Single full-stack framework (Next.js App Router) + managed backend (Supabase). No bespoke infra. |
| Low operating cost | Serverless hosting (Vercel) + Supabase free/pro tier. Pay-as-you-grow. |
| Simple to learn | Opinionated, task-oriented UI. No workflow engine, no config sprawl. |
| Secure by default | Postgres Row Level Security (RLS) enforces tenant isolation at the database, not just the app. |
| Easy to operate | Managed Postgres, managed auth, managed object storage. No servers to patch. |

## 2. High-level diagram

```
                         ┌──────────────────────────────────────────┐
                         │                Browser                    │
                         │   Next.js (React) UI · Tailwind CSS       │
                         └───────────────┬──────────────────────────┘
                                         │  HTTPS
                         ┌───────────────▼──────────────────────────┐
                         │            Vercel Edge / Node              │
                         │  ┌────────────────────────────────────┐   │
                         │  │ Next.js App Router                  │   │
                         │  │  • Server Components (data reads)   │   │
                         │  │  • Server Actions (mutations)       │   │
                         │  │  • Route Handlers (/api/*)          │   │
                         │  │  • Middleware (session refresh)     │   │
                         │  └───────────────┬────────────────────┘   │
                         └──────────────────┼────────────────────────┘
                                            │  @supabase/ssr (JWT)
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
   ┌──────────▼──────────┐     ┌────────────▼───────────┐     ┌───────────▼──────────┐
   │  Supabase Auth      │     │   Supabase Postgres    │     │  Supabase Storage     │
   │  • email/password   │     │   • app tables          │     │  • evidence bucket    │
   │  • magic link       │     │   • RLS policies        │     │  • RLS-style policies │
   │  • JWT issuance     │     │   • views / functions   │     │  • signed URLs        │
   └─────────────────────┘     └────────────────────────┘     └──────────────────────┘
```

## 3. Component responsibilities

### Frontend (Next.js App Router + React + Tailwind)
- **Server Components** render dashboards, registers, and reports by reading
  directly from Postgres through the Supabase server client. No client-side
  data fetching needed for first paint.
- **Client Components** handle interactive widgets (forms, filters, file
  pickers, calendars).
- **Server Actions** perform mutations (create/update gaps, log evidence,
  schedule calendar activities). They run on the server with the user's JWT, so
  RLS still applies.
- **Route Handlers (`/api/*`)** expose a small, documented REST surface for
  things that benefit from a real HTTP endpoint: report exports, signed upload
  URLs, and future integrations.

### Authentication (Supabase Auth)
- Email/password + magic link for V1.
- JWT stored in HTTP-only cookies via `@supabase/ssr`.
- Middleware refreshes the session on every request so server components always
  have a valid token.

### Database (Supabase Postgres)
- Source of truth for all application data.
- **Multi-tenant** via an `organizations` table; every row carries `org_id`.
- **RLS** guarantees a user only sees rows for organizations they belong to.
- Reporting handled by SQL **views** so the app layer stays thin.

### File storage (Supabase Storage)
- A private `evidence` bucket.
- Files are namespaced by `org_id/gap_id/filename`.
- Access via short-lived **signed URLs** generated server-side.
- Storage access policies mirror the table RLS (org membership required).

## 4. Multi-tenancy model

NIST Compass is multi-tenant from day one — cheap to build now, expensive to
retrofit later.

```
auth.users (Supabase)
    │  1—1
profiles ─────────────┐
    │  N—1            │
memberships ──N——1── organizations ──1——N── gaps, calendar_activities, evidence...
```

- A **user** has one `profile`.
- A user belongs to one or more `organizations` through `memberships`
  (with a role: `owner`, `admin`, `member`, `viewer`).
- All business tables reference `org_id`. RLS checks
  "does the current user have a membership in this row's org?".

For the MVP, most customers are a single organization, but the model supports
MSPs managing several client orgs without a schema change.

## 5. Request lifecycle (example: closing a gap)

1. User clicks **Mark Complete** on a gap (Client Component).
2. A **Server Action** `updateGapStatus(gapId, 'complete')` runs on Vercel.
3. The action uses the Supabase **server client** (carrying the user's JWT).
4. Postgres evaluates the `UPDATE` against the `gaps` RLS policy — allowed only
   if the user has a membership in the gap's org with a writable role.
5. The row updates; `revalidatePath('/gaps')` refreshes the cached view.
6. The dashboard's "Open vs Closed" counts (a SQL view) reflect the change on
   next render.

## 6. Security posture

- **Defense in depth:** even if an app bug leaks a query, RLS blocks
  cross-tenant reads/writes at the database.
- **No service-role key in the browser.** The anon key + RLS is the default
  path. The service-role key is used only in trusted server code (e.g. signed
  URLs).
- **Least-privilege storage:** evidence is private; access is always brokered
  by signed URLs with short TTLs.
- **Aligned with the product philosophy:** the platform stores *compliance
  operations* data (gaps, owners, tasks, evidence pointers), not sensitive
  security architecture.

## 7. Environments

| Environment | Frontend | Backend |
| --- | --- | --- |
| Local dev | `next dev` on `localhost:3000` | Supabase project (dev) or local Supabase CLI |
| Preview | Vercel preview deploy per PR | Supabase project (dev) |
| Production | Vercel production | Supabase project (prod) |

Secrets (`SUPABASE_SERVICE_ROLE_KEY`, etc.) live in Vercel/Supabase environment
settings, never in the repo.

## 8. Why this stack (and what we deliberately skip)

**Chosen:** Next.js + Supabase + Vercel gives one language (TypeScript), one
deploy target, managed auth/db/storage, and generous free tiers — the fastest
credible path to working software at low cost.

**Deliberately skipped for V1** (per product philosophy): AI features, workflow
engines, enterprise SSO/SCIM, multi-framework mapping, and complex
integrations. Each is parked in the roadmap, not the MVP.
