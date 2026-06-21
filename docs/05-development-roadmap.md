# 05 — Development Roadmap

Optimized for shipping a usable MVP fast, then layering value. Estimates assume
1–2 developers.

## Guiding principle

> Working software first. Each milestone is independently shippable and demoable.

## Milestone 0 — Foundation (½ week) ✅ scaffolded in this repo

- [x] Next.js App Router + TypeScript + Tailwind
- [x] Supabase clients (browser/server) via `@supabase/ssr`
- [x] Database schema + RLS migrations
- [x] NIST CSF 2.0 seed data
- [x] App shell (sidebar, top bar), routing skeleton
- [x] Docs: architecture, schema, API, flows

## Milestone 1 — Auth & tenancy (½ week)

- [ ] Sign up / sign in / sign out (email + password, magic link)
- [ ] Profile + organization + owner membership on signup
- [ ] Middleware session refresh + route protection
- [ ] Org switcher (active-org cookie)
- **Demo:** a new user can create an org and land on an empty dashboard.

## Milestone 2 — Framework library (½ week)

- [ ] Browse Functions → Categories → Subcategories from seed data
- [ ] Search subcategories
- [ ] "Create gap from subcategory" deep link
- **Demo:** browse all of NIST CSF 2.0 and jump into gap creation.

## Milestone 3 — Gap register (1 week) ← core value

- [ ] Gap CRUD (server actions)
- [ ] List with filters (status, risk, owner) + search + pagination
- [ ] Gap detail/edit with ownership fields (owner, due, priority, notes)
- [ ] Status workflow + `closed_at` handling
- **Demo:** full lifecycle of a gap from open to complete.

## Milestone 4 — Evidence repository (½ week)

- [ ] Private storage bucket + access policies
- [ ] Signed-URL direct upload from gap detail
- [ ] Evidence list per gap + global evidence view
- [ ] Download via signed URL, delete
- **Demo:** attach a PDF/screenshot to a gap and retrieve it.

## Milestone 5 — Compliance calendar (1 week)

- [ ] Activity definitions (category + frequency + owner)
- [ ] Occurrence generation from frequency
- [ ] List + month views, mark complete/skip
- [ ] Overdue + upcoming feed into the dashboard
- **Demo:** schedule a quarterly access review and check off an occurrence.

## Milestone 6 — Dashboard & reporting (½ week)

- [ ] Dashboard cards + status/risk breakdowns (reporting views)
- [ ] Upcoming deadlines + overdue widgets
- [ ] Open Gap / Overdue / Executive Summary reports
- [ ] CSV export
- **Demo:** executive opens the dashboard and exports an open-gap report.

## Milestone 7 — Polish & launch (½ week)

- [ ] Empty states, loading/skeletons, toasts, error boundaries
- [ ] Mobile responsive pass
- [ ] Member invites + role enforcement review
- [ ] Seed/demo data toggle for trials
- [ ] Production Supabase + Vercel, custom domain
- **Ship V1.** 🚀

**MVP total: ~5–6 weeks** for the full V1 feature set.

---

## Post-MVP

### V1.1 — Hardening
- PDF report export
- Email reminders for due/overdue items (Supabase scheduled functions)
- Audit log of changes
- Bulk gap import (CSV)

### V2 — More frameworks (per brief roadmap)
- ISO 27001 control set
- SOC 2 Trust Services Criteria mapping
- SOX control tracking
- Framework cross-mapping (one gap → multiple framework refs)

### V3 — Optional AI assistant (per brief, strictly bounded)
- Explain NIST controls in plain language
- Suggest remediation ideas
- Assist with framework mapping
- **Guardrails:** never analyzes uploaded evidence, never stores confidential
  data, customer data never leaves the platform boundary.

## Sequencing rationale

Auth/tenancy and the framework library are prerequisites for the gap register —
the product's core. Evidence and calendar are independent value adds that can be
parallelized. Dashboard/reporting comes last because it reads from data the
earlier milestones produce.
