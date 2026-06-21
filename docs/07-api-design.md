# 07 — API Design

NIST Compass favors **Server Actions** for mutations (colocated, type-safe, no
boilerplate) and a small **REST surface** (`/api/*`) for things that need a real
HTTP endpoint: exports, signed uploads, and future integrations. Data **reads**
happen in Server Components straight from Postgres (RLS-scoped) — no API needed.

## Principles

- **RLS is the authorization layer.** Every call runs with the user's JWT;
  Postgres enforces tenant isolation. The API never trusts a client-supplied
  `org_id`.
- **Validate at the edge.** All inputs parsed with zod (`lib/validations.ts`)
  before touching the database.
- **Idempotent where possible**, predictable status codes, JSON errors of the
  shape `{ "error": { "code": string, "message": string } }`.

## A. Server Actions (primary mutation surface)

Signatures (TypeScript, server-only). All return `{ data }` or throw a typed
error surfaced to the form.

### Gaps — `app/(app)/gaps/actions.ts`
```ts
createGap(input: GapInput): Promise<{ id: string }>
updateGap(id: string, input: Partial<GapInput>): Promise<void>
updateGapStatus(id: string, status: GapStatus): Promise<void>   // stamps closed_at
deleteGap(id: string): Promise<void>
addGapComment(gapId: string, body: string): Promise<void>
```

### Evidence — `app/(app)/evidence/actions.ts`
```ts
// 1) get a signed upload URL (validates membership, size, mime)
createEvidenceUploadUrl(gapId: string, file: { name: string; size: number; type: string })
  : Promise<{ uploadUrl: string; storagePath: string }>
// 2) after the browser PUTs the file, persist metadata
recordEvidence(input: EvidenceInput): Promise<{ id: string }>
deleteEvidence(id: string): Promise<void>           // removes row + storage object
createEvidenceDownloadUrl(id: string): Promise<{ url: string }>  // short-lived signed URL
```

### Calendar — `app/(app)/calendar/actions.ts`
```ts
createActivity(input: ActivityInput): Promise<{ id: string }>   // also generates occurrences
updateActivity(id: string, input: Partial<ActivityInput>): Promise<void>
completeOccurrence(id: string): Promise<void>
skipOccurrence(id: string, reason: string): Promise<void>
```

### Org / membership — `app/(app)/settings/actions.ts`
```ts
createOrganization(name: string): Promise<{ id: string }>       // used at signup
inviteMember(email: string, role: Role): Promise<void>          // V1.1
updateMemberRole(membershipId: string, role: Role): Promise<void>
setActiveOrg(orgId: string): Promise<void>                      // sets cookie
```

## B. REST endpoints (`/api/*`)

### `GET /api/reports/:type`
Export a report. RLS scopes to the caller's active org.

| Param | In | Notes |
| --- | --- | --- |
| `type` | path | `open-gaps` \| `overdue` \| `executive-summary` |
| `format` | query | `csv` (default) \| `json` |

- **200** → `text/csv` (attachment) or `application/json`.
- **401** if unauthenticated, **400** for unknown `type`.

Example:
```
GET /api/reports/open-gaps?format=csv
→ 200  Content-Disposition: attachment; filename="open-gaps-2026-06-21.csv"
```

Response (json form):
```json
{
  "report": "open-gaps",
  "generated_at": "2026-06-21T12:00:00Z",
  "rows": [
    {
      "title": "Enable MFA org-wide",
      "subcategory": "PR.AA-03",
      "risk_level": "high",
      "status": "in_progress",
      "owner": "Sam Rivera",
      "due_date": "2026-07-12"
    }
  ]
}
```

### `POST /api/evidence/sign`
Issue a signed upload URL (alternative to the server action, for clients that
prefer fetch). Body validated with zod.

```json
// request
{ "gap_id": "uuid", "file_name": "mfa-policy.pdf", "size_bytes": 225001, "mime_type": "application/pdf" }
```
```json
// 200
{ "upload_url": "https://...supabase.../object/sign/...", "storage_path": "ORG/GAP/uuid-mfa-policy.pdf" }
```
- **413** if `size_bytes` exceeds the limit (default 25 MB).
- **415** for disallowed mime types.
- **403** if the caller is a `viewer` or not a member of the gap's org.

### `GET /api/health`
Liveness probe → `200 { "status": "ok" }`.

## C. Data reads (no endpoint)

Reads are Server Components querying Supabase directly. Representative queries:

```ts
// dashboard stats (reads the v_dashboard_stats view, RLS-scoped)
supabase.from('v_dashboard_stats').select('*').single()

// gap register with filters
supabase.from('gaps')
  .select('id,title,risk_level,status,due_date, owner:profiles(full_name), sub:framework_subcategories(code)')
  .eq('status', status)         // optional filters
  .order('due_date', { ascending: true })
  .range(from, to)              // pagination
```

## D. Validation schemas (shared)

`lib/validations.ts` (zod) — the single source of truth used by both actions and
API handlers:

```ts
GapInput        // title (1..200), description, current_state, desired_state,
                // risk_level enum, status enum, priority enum, owner_id?, due_date?, subcategory_id?
EvidenceInput   // gap_id, file_name, storage_path, mime_type, size_bytes (<= 25MB), description?
ActivityInput   // title, category enum, frequency enum, owner_id?, start_date
ReportType      // 'open-gaps' | 'overdue' | 'executive-summary'
```

## E. Error model

| Code | HTTP | Meaning |
| --- | --- | --- |
| `unauthenticated` | 401 | No / invalid session |
| `forbidden` | 403 | Authenticated but role/RLS denies the action |
| `not_found` | 404 | Row not visible to the caller (RLS) or missing |
| `invalid_input` | 400 | zod validation failed (includes field issues) |
| `payload_too_large` | 413 | Evidence file over the size cap |
| `unsupported_media_type` | 415 | Disallowed mime type |
| `rate_limited` | 429 | Too many requests (future) |

Errors always serialize as:
```json
{ "error": { "code": "invalid_input", "message": "title is required", "fields": { "title": "Required" } } }
```

## F. Conventions & future-proofing

- Versioning: when external integrations arrive (V2+), namespace under
  `/api/v1/*`. V1 internal endpoints stay unversioned.
- Pagination: `range`-based (Supabase) for internal reads; `?page`/`?limit` for
  any future public list endpoints.
- All timestamps ISO-8601 UTC. All enums lower_snake_case, matching DB CHECK
  constraints in [`02-database-schema.md`](./02-database-schema.md).
