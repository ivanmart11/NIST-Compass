# 02 — Database Schema

PostgreSQL (Supabase). All business tables are multi-tenant via `org_id` and
protected by Row Level Security. The canonical, runnable definition lives in
[`supabase/migrations`](../supabase/migrations); this document is the narrative
reference.

## Entity-relationship overview

```
organizations ─1─┬─N memberships ─N─1─ profiles ─1─1─ auth.users
                 │
                 ├─N gaps ─────────┬─N evidence
                 │                 └─N gap_comments
                 │
                 ├─N calendar_activities ─1─N calendar_occurrences
                 │
                 └─N (framework is global, not per-org)

framework_functions ─1─N framework_categories ─1─N framework_subcategories
                                                          ▲
                                                          │ (optional FK)
                                                        gaps.subcategory_id
```

## Reference / framework tables (global, read-only to tenants)

The NIST CSF 2.0 catalog is shared across all tenants and seeded once.

### `framework_functions`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `code` | text unique | `GV`, `ID`, `PR`, `DE`, `RS`, `RC` |
| `name` | text | e.g. "Govern" |
| `description` | text | |
| `sort_order` | int | Display order |

### `framework_categories`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `function_id` | uuid FK → framework_functions | |
| `code` | text unique | e.g. `GV.OC` |
| `name` | text | "Organizational Context" |
| `description` | text | |
| `sort_order` | int | |

### `framework_subcategories`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `category_id` | uuid FK → framework_categories | |
| `code` | text unique | e.g. `GV.OC-01` |
| `description` | text | The subcategory outcome statement |
| `sort_order` | int | |

## Tenant tables

### `organizations`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `name` | text | |
| `created_at` | timestamptz | |

### `profiles`
One row per `auth.users` row. Created by trigger on signup.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK → auth.users.id | |
| `full_name` | text | |
| `email` | text | mirror for convenience |
| `created_at` | timestamptz | |

### `memberships`
Join table; a user's role within an organization.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `org_id` | uuid FK → organizations | |
| `user_id` | uuid FK → profiles | |
| `role` | text | `owner` \| `admin` \| `member` \| `viewer` |
| `created_at` | timestamptz | |
| | | unique(`org_id`, `user_id`) |

Roles:
- `owner` / `admin` — full read/write, manage members.
- `member` — read/write gaps, evidence, calendar.
- `viewer` — read-only (auditors, executives).

### `gaps`
The heart of the product — a tracked compliance gap.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `org_id` | uuid FK → organizations | |
| `subcategory_id` | uuid FK → framework_subcategories | nullable; links a gap to a NIST outcome |
| `title` | text | |
| `description` | text | |
| `current_state` | text | |
| `desired_state` | text | |
| `risk_level` | text | `low` \| `medium` \| `high` \| `critical` |
| `status` | text | `not_started` \| `in_progress` \| `blocked` \| `complete` |
| `priority` | text | `low` \| `medium` \| `high` |
| `owner_id` | uuid FK → profiles | nullable |
| `due_date` | date | nullable |
| `notes` | text | |
| `created_by` | uuid FK → profiles | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | maintained by trigger |
| `closed_at` | timestamptz | set when status → complete |

Derived/index notes: index on (`org_id`, `status`), (`org_id`, `due_date`),
(`org_id`, `owner_id`).

### `evidence`
A pointer to a file in Supabase Storage, attached to a gap.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `org_id` | uuid FK → organizations | |
| `gap_id` | uuid FK → gaps | |
| `file_name` | text | original filename |
| `storage_path` | text | `org_id/gap_id/uuid-filename` |
| `mime_type` | text | |
| `size_bytes` | bigint | |
| `description` | text | optional caption |
| `uploaded_by` | uuid FK → profiles | |
| `created_at` | timestamptz | |

### `gap_comments` (lightweight activity/notes)
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `org_id` | uuid FK → organizations | |
| `gap_id` | uuid FK → gaps | |
| `author_id` | uuid FK → profiles | |
| `body` | text | |
| `created_at` | timestamptz | |

### `calendar_activities`
A recurring compliance activity definition (e.g. "Quarterly User Access
Review").
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `org_id` | uuid FK → organizations | |
| `title` | text | |
| `description` | text | |
| `category` | text | `access_review` \| `termination_review` \| `policy_review` \| `vendor_review` \| `controls_review` \| `other` |
| `frequency` | text | `monthly` \| `quarterly` \| `semiannual` \| `annual` \| `one_time` |
| `owner_id` | uuid FK → profiles | nullable |
| `start_date` | date | first occurrence anchor |
| `active` | boolean | default true |
| `created_at` | timestamptz | |

### `calendar_occurrences`
A concrete dated instance of an activity (generated from the definition).
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `org_id` | uuid FK → organizations | |
| `activity_id` | uuid FK → calendar_activities | |
| `due_date` | date | |
| `status` | text | `pending` \| `complete` \| `skipped` |
| `completed_at` | timestamptz | nullable |
| `completed_by` | uuid FK → profiles | nullable |
| | | unique(`activity_id`, `due_date`) |

## Reporting views

Thin SQL views keep reporting logic out of the app.

- **`v_dashboard_stats`** — per-org counts: open gaps, closed gaps, overdue
  gaps, gaps by risk/status.
- **`v_open_gaps`** — open gaps joined to owner name + NIST subcategory code.
- **`v_overdue_items`** — gaps and calendar occurrences past due, unified.
- **`v_upcoming_deadlines`** — gaps + occurrences due in the next 30 days.

All views select through the underlying tables, so RLS automatically scopes
them to the caller's organizations.

## Row Level Security (summary)

Every tenant table enables RLS. The core predicate is membership:

```sql
-- read: user is a member of the row's org
org_id in (select org_id from memberships where user_id = auth.uid())

-- write: member is not a viewer
exists (
  select 1 from memberships m
  where m.org_id = <table>.org_id
    and m.user_id = auth.uid()
    and m.role in ('owner','admin','member')
)
```

Framework tables are world-readable (to authenticated users) and not writable
by tenants.

See [`supabase/migrations/0002_policies.sql`](../supabase/migrations/0002_policies.sql)
for the full policy set.

## Conventions

- UUID primary keys (`gen_random_uuid()`).
- `timestamptz` everywhere, UTC.
- `updated_at` maintained by a shared trigger function.
- Enumerated values enforced with `CHECK` constraints (simple, no enum-type
  migration churn).
