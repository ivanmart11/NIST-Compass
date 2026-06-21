# 04 — User Flows

The core journeys a user takes through NIST Compass V1.

## Personas (mapped from the brief)

- **Dana — GRC/Compliance Analyst** (primary operator). Lives in the gap
  register and calendar.
- **Sam — Security/IT Manager** (control owner). Assigned gaps, uploads
  evidence.
- **Lee — IT Director / Executive** (viewer). Reads the dashboard and reports.

## Flow 1 — Onboarding (new org)

```
Land on / ──► Sign up ──► enter name + org name + email + password
   │
   ▼
Supabase Auth creates user ──► trigger creates profile
   │
   ▼
Server action creates organization + owner membership
   │
   ▼
Redirect to /dashboard (empty state with "Start with the Framework" CTA)
```

Empty-state guidance nudges the first action: *"Browse the NIST CSF 2.0
framework and create your first gap."*

## Flow 2 — Identify a gap from the framework

```
/framework ──► pick Function (e.g. PROTECT)
   │
   ▼
expand Category (PR.AA) ──► find Subcategory (PR.AA-03)
   │
   ▼
click "+ Gap" ──► /gaps/new?subcategory=PR.AA-03 (pre-filled NIST link)
   │
   ▼
fill title, current/desired state, risk, owner, due date ──► Save
   │
   ▼
redirect to /gaps/:id  ·  dashboard "open" count +1
```

## Flow 3 — Create a gap directly

```
/gaps ──► [+ New Gap] ──► form (NIST link optional) ──► Save ──► /gaps/:id
```

## Flow 4 — Work a gap to closure (owner)

```
Owner opens /gaps/:id
   │
   ├─► set status In progress
   ├─► upload evidence (signed URL ► Supabase Storage ► evidence row)
   ├─► add comments / notes
   │
   ▼
set status Complete ──► closed_at stamped ──► dashboard closed +1, open −1
```

### Evidence upload sub-flow

```
[+ Upload] ──► pick file
   │
   ▼
client requests signed upload URL (server action, validates membership + size/type)
   │
   ▼
browser PUTs file directly to Supabase Storage (org_id/gap_id/uuid-name)
   │
   ▼
on success ──► server action inserts evidence row (metadata)
   │
   ▼
evidence list refreshes (revalidate)
```

Direct-to-storage upload keeps large files off the serverless function.

## Flow 5 — Manage the compliance calendar

```
/calendar ──► [+ New Activity]
   │
   ▼
define title, category, frequency (e.g. Quarterly), owner, start date ──► Save
   │
   ▼
system generates upcoming occurrences (dated instances)
   │
   ▼
when due, owner opens occurrence ──► [Mark complete]
   │
   ▼
completed_at stamped; next occurrence already scheduled by frequency
```

## Flow 6 — Run a report (analyst / exec)

```
/reports ──► choose report (Open Gaps / Overdue / Executive Summary)
   │
   ▼
view on screen (reads a SQL reporting view, RLS-scoped)
   │
   ▼
[Export ▾] ──► CSV download (GET /api/reports/:type?format=csv)
```

## Flow 7 — Invite a teammate (V1.1, scaffolded in V1)

```
/settings/members ──► [Invite] ──► email + role
   │
   ▼
Supabase invite email ──► invitee signs up ──► membership added to org
```

## Cross-cutting: auth & access guardrails

- Unauthenticated request to any `/app` route ──► redirect to `/` (sign in).
- `viewer` role ──► write controls hidden/disabled; server actions reject
  writes (RLS + role check), so the UI can't be bypassed.
- Org switcher in the top bar changes the "active org" cookie; all queries
  re-scope on next render.

## State transitions

**Gap status:**
```
not_started ──► in_progress ──► complete
      │              │   ▲
      └──────────────┴───┘
            (blocked is reachable from any non-complete state and back)
```

**Calendar occurrence status:**
```
pending ──► complete
   └──────► skipped (with required reason note)
```
