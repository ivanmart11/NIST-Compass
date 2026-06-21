# 06 — Folder Structure

Next.js App Router with route groups separating public auth pages from the
authenticated app shell. Path alias `@/*` → `src/*`.

```
nist-compass/
├── docs/                          # Architecture & design docs (this set)
│   ├── 01-system-architecture.md
│   ├── 02-database-schema.md
│   ├── 03-wireframes.md
│   ├── 04-user-flows.md
│   ├── 05-development-roadmap.md
│   ├── 06-folder-structure.md
│   └── 07-api-design.md
│
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema.sql         # tables, indexes, triggers, views
│   │   └── 0002_policies.sql       # RLS enable + policies + storage policies
│   └── seed.sql                    # NIST CSF 2.0 catalog (functions/cats/subcats)
│
├── public/                         # static assets
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root layout (fonts, <html>)
│   │   ├── globals.css             # Tailwind layers
│   │   ├── page.tsx                # marketing/sign-in landing
│   │   │
│   │   ├── (auth)/                 # public route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── auth/callback/route.ts   # OAuth/magic-link exchange
│   │   │
│   │   ├── (app)/                  # authenticated route group (guarded)
│   │   │   ├── layout.tsx          # app shell: sidebar + topbar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── framework/page.tsx
│   │   │   ├── gaps/
│   │   │   │   ├── page.tsx        # register list
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx   # detail/edit
│   │   │   │   └── actions.ts      # server actions (create/update/delete)
│   │   │   ├── calendar/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   ├── evidence/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts      # signed URL + metadata insert
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/
│   │   │       └── members/page.tsx
│   │   │
│   │   └── api/                    # REST route handlers
│   │       ├── reports/[type]/route.ts   # CSV/JSON exports
│   │       └── evidence/sign/route.ts    # signed upload URL
│   │
│   ├── components/
│   │   ├── ui/                     # primitives: Button, Card, Badge, Input...
│   │   ├── layout/                 # Sidebar, TopBar, OrgSwitcher
│   │   ├── dashboard/              # StatCard, StatusBreakdown, DeadlineList
│   │   ├── gaps/                   # GapTable, GapForm, GapFilters, EvidenceList
│   │   ├── framework/              # FunctionTabs, CategoryAccordion
│   │   └── calendar/               # ActivityForm, OccurrenceList
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # browser client
│   │   │   ├── server.ts           # server component/action client (cookies)
│   │   │   └── middleware.ts       # session refresh helper
│   │   ├── auth.ts                 # getUser / getActiveOrg / requireUser
│   │   ├── constants.ts            # status/risk/category enums + labels
│   │   ├── validations.ts          # zod schemas for forms/API
│   │   └── utils.ts                # cn(), date + format helpers
│   │
│   └── types/
│       └── db.ts                   # hand-written / generated DB types
│
├── middleware.ts                   # session refresh + route guard
├── .env.example
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## Conventions

- **Route groups** `(auth)` and `(app)` separate concerns without affecting
  URLs. The `(app)` layout enforces authentication once for all child routes.
- **Server Actions** live in a colocated `actions.ts` per feature folder — the
  default path for mutations.
- **Route Handlers** under `app/api` are reserved for things that need a real
  HTTP endpoint (exports, signed URLs, future webhooks/integrations).
- **`components/ui`** holds dumb, reusable primitives; feature folders hold
  composed, domain-aware components.
- **`lib/supabase`** is the only place that constructs Supabase clients — never
  instantiate clients ad hoc in components.
- **Validation** is centralized in `lib/validations.ts` (zod) and shared
  between server actions and API handlers.
