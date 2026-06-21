-- ============================================================================
-- NIST Compass — 0001 schema
-- Tables, indexes, triggers, and reporting views.
-- Run against a Supabase Postgres database (pgcrypto provides gen_random_uuid).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared trigger: maintain updated_at
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- Reference / framework catalog (global, read-only to tenants)
-- ===========================================================================
create table framework_functions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,           -- GV, ID, PR, DE, RS, RC
  name        text not null,
  description text,
  sort_order  int  not null default 0
);

create table framework_categories (
  id          uuid primary key default gen_random_uuid(),
  function_id uuid not null references framework_functions(id) on delete cascade,
  code        text not null unique,           -- e.g. GV.OC
  name        text not null,
  description text,
  sort_order  int  not null default 0
);
create index idx_categories_function on framework_categories(function_id);

create table framework_subcategories (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references framework_categories(id) on delete cascade,
  code        text not null unique,           -- e.g. GV.OC-01
  description text not null,
  sort_order  int  not null default 0
);
create index idx_subcategories_category on framework_subcategories(category_id);

-- ===========================================================================
-- Tenancy
-- ===========================================================================
create table organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- One profile per auth.users row (populated by trigger below).
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  created_at timestamptz not null default now()
);

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       text not null default 'member'
             check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create index idx_memberships_user on memberships(user_id);
create index idx_memberships_org  on memberships(org_id);

-- Create a profile automatically when a new auth user signs up.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===========================================================================
-- Gaps
-- ===========================================================================
create table gaps (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  subcategory_id  uuid references framework_subcategories(id) on delete set null,
  title           text not null,
  description     text,
  current_state   text,
  desired_state   text,
  risk_level      text not null default 'medium'
                  check (risk_level in ('low','medium','high','critical')),
  status          text not null default 'not_started'
                  check (status in ('not_started','in_progress','blocked','complete')),
  priority        text not null default 'medium'
                  check (priority in ('low','medium','high')),
  owner_id        uuid references profiles(id) on delete set null,
  due_date        date,
  notes           text,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  closed_at       timestamptz
);
create index idx_gaps_org_status   on gaps(org_id, status);
create index idx_gaps_org_due       on gaps(org_id, due_date);
create index idx_gaps_org_owner      on gaps(org_id, owner_id);
create index idx_gaps_subcategory     on gaps(subcategory_id);

create trigger trg_gaps_updated
  before update on gaps
  for each row execute function set_updated_at();

-- Stamp/clear closed_at as status crosses the complete boundary.
create or replace function sync_gap_closed_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'complete' and (old.status is distinct from 'complete') then
    new.closed_at = now();
  elsif new.status <> 'complete' then
    new.closed_at = null;
  end if;
  return new;
end;
$$;

create trigger trg_gaps_closed_at
  before insert or update on gaps
  for each row execute function sync_gap_closed_at();

-- ===========================================================================
-- Evidence
-- ===========================================================================
create table evidence (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  gap_id       uuid not null references gaps(id) on delete cascade,
  file_name    text not null,
  storage_path text not null,
  mime_type    text,
  size_bytes   bigint,
  description  text,
  uploaded_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index idx_evidence_gap on evidence(gap_id);
create index idx_evidence_org on evidence(org_id);

-- ===========================================================================
-- Gap comments (lightweight activity)
-- ===========================================================================
create table gap_comments (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  gap_id     uuid not null references gaps(id) on delete cascade,
  author_id  uuid references profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index idx_gap_comments_gap on gap_comments(gap_id);

-- ===========================================================================
-- Compliance calendar
-- ===========================================================================
create table calendar_activities (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  title       text not null,
  description text,
  category    text not null default 'other'
              check (category in ('access_review','termination_review','policy_review',
                                  'vendor_review','controls_review','other')),
  frequency   text not null default 'quarterly'
              check (frequency in ('monthly','quarterly','semiannual','annual','one_time')),
  owner_id    uuid references profiles(id) on delete set null,
  start_date  date not null default current_date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index idx_activities_org on calendar_activities(org_id);

create table calendar_occurrences (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  activity_id  uuid not null references calendar_activities(id) on delete cascade,
  due_date     date not null,
  status       text not null default 'pending'
               check (status in ('pending','complete','skipped')),
  completed_at timestamptz,
  completed_by uuid references profiles(id) on delete set null,
  note         text,
  unique (activity_id, due_date)
);
create index idx_occurrences_org_due on calendar_occurrences(org_id, due_date);
create index idx_occurrences_activity on calendar_occurrences(activity_id);

-- ===========================================================================
-- Reporting views (inherit RLS from underlying tables)
-- ===========================================================================
create or replace view v_dashboard_stats as
select
  org_id,
  count(*) filter (where status <> 'complete')                              as open_gaps,
  count(*) filter (where status = 'complete')                              as closed_gaps,
  count(*) filter (where status <> 'complete'
                   and due_date is not null and due_date < current_date)    as overdue_gaps,
  count(*) filter (where status <> 'complete'
                   and due_date is not null
                   and due_date between current_date and current_date + 30) as due_soon_gaps,
  count(*) filter (where status = 'not_started')                           as not_started,
  count(*) filter (where status = 'in_progress')                          as in_progress,
  count(*) filter (where status = 'blocked')                              as blocked,
  count(*) filter (where status <> 'complete' and risk_level = 'critical') as risk_critical,
  count(*) filter (where status <> 'complete' and risk_level = 'high')     as risk_high,
  count(*) filter (where status <> 'complete' and risk_level = 'medium')   as risk_medium,
  count(*) filter (where status <> 'complete' and risk_level = 'low')      as risk_low
from gaps
group by org_id;

create or replace view v_open_gaps as
select
  g.id, g.org_id, g.title, g.risk_level, g.status, g.priority, g.due_date,
  p.full_name as owner_name,
  s.code      as subcategory_code
from gaps g
left join profiles p on p.id = g.owner_id
left join framework_subcategories s on s.id = g.subcategory_id
where g.status <> 'complete';

create or replace view v_overdue_items as
select 'gap'::text as kind, g.id, g.org_id, g.title, g.due_date,
       p.full_name as owner_name
from gaps g
left join profiles p on p.id = g.owner_id
where g.status <> 'complete' and g.due_date is not null and g.due_date < current_date
union all
select 'calendar'::text as kind, o.id, o.org_id, a.title, o.due_date,
       p.full_name as owner_name
from calendar_occurrences o
join calendar_activities a on a.id = o.activity_id
left join profiles p on p.id = a.owner_id
where o.status = 'pending' and o.due_date < current_date;

create or replace view v_upcoming_deadlines as
select 'gap'::text as kind, g.id, g.org_id, g.title, g.due_date,
       p.full_name as owner_name
from gaps g
left join profiles p on p.id = g.owner_id
where g.status <> 'complete' and g.due_date is not null
  and g.due_date between current_date and current_date + 30
union all
select 'calendar'::text as kind, o.id, o.org_id, a.title, o.due_date,
       p.full_name as owner_name
from calendar_occurrences o
join calendar_activities a on a.id = o.activity_id
left join profiles p on p.id = a.owner_id
where o.status = 'pending'
  and o.due_date between current_date and current_date + 30;
