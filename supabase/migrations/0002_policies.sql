-- ============================================================================
-- NIST Compass — 0002 Row Level Security policies
-- Tenant isolation is enforced here, at the database, via org membership.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so they can read memberships under RLS)
-- ---------------------------------------------------------------------------
create or replace function is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$;

create or replace function can_write_org(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.role in ('owner','admin','member')
  );
$$;

-- ===========================================================================
-- Framework catalog: readable by any authenticated user, never tenant-writable
-- ===========================================================================
alter table framework_functions     enable row level security;
alter table framework_categories    enable row level security;
alter table framework_subcategories enable row level security;

create policy fw_functions_read on framework_functions
  for select to authenticated using (true);
create policy fw_categories_read on framework_categories
  for select to authenticated using (true);
create policy fw_subcategories_read on framework_subcategories
  for select to authenticated using (true);

-- ===========================================================================
-- Organizations
-- ===========================================================================
alter table organizations enable row level security;

-- A user can read orgs they are a member of, OR an org they just created
-- (the creator clause lets onboarding read the row back via INSERT ... RETURNING
-- before the owner membership row exists).
create policy org_select on organizations
  for select using (created_by = auth.uid() or is_org_member(id));

-- Any authenticated user may create an org, but only as its creator. The
-- `created_by` column defaults to auth.uid(), so the app inserts only `name`.
create policy org_insert on organizations
  for insert to authenticated with check (created_by = auth.uid());

create policy org_update on organizations
  for update using (can_write_org(id)) with check (can_write_org(id));

-- ===========================================================================
-- Profiles: a user can read profiles of co-members; can edit only their own
-- ===========================================================================
alter table profiles enable row level security;

create policy profile_select_self on profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from memberships m1
      join memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

create policy profile_update_self on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- A user may create their own profile row (self-healing onboarding when the
-- signup trigger has not populated it).
create policy profile_insert_self on profiles
  for insert to authenticated with check (id = auth.uid());

-- ===========================================================================
-- Memberships
-- ===========================================================================
alter table memberships enable row level security;

-- See your own memberships and those of orgs you administer.
create policy membership_select on memberships
  for select using (
    user_id = auth.uid() or is_org_member(org_id)
  );

-- Bootstrap: a user may insert their OWN owner membership (used at org creation).
-- Admins/owners may add others.
create policy membership_insert on memberships
  for insert to authenticated with check (
    user_id = auth.uid()
    or exists (
      select 1 from memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy membership_update on memberships
  for update using (
    exists (
      select 1 from memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy membership_delete on memberships
  for delete using (
    exists (
      select 1 from memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- ===========================================================================
-- Generic tenant tables: member can read, writer can write
-- ===========================================================================
-- gaps
alter table gaps enable row level security;
create policy gaps_select on gaps for select using (is_org_member(org_id));
create policy gaps_insert on gaps for insert with check (can_write_org(org_id));
create policy gaps_update on gaps for update using (can_write_org(org_id)) with check (can_write_org(org_id));
create policy gaps_delete on gaps for delete using (can_write_org(org_id));

-- evidence
alter table evidence enable row level security;
create policy evidence_select on evidence for select using (is_org_member(org_id));
create policy evidence_insert on evidence for insert with check (can_write_org(org_id));
create policy evidence_delete on evidence for delete using (can_write_org(org_id));

-- gap_comments
alter table gap_comments enable row level security;
create policy comments_select on gap_comments for select using (is_org_member(org_id));
create policy comments_insert on gap_comments for insert with check (can_write_org(org_id));
create policy comments_delete on gap_comments for delete using (
  author_id = auth.uid() or can_write_org(org_id)
);

-- calendar_activities
alter table calendar_activities enable row level security;
create policy activities_select on calendar_activities for select using (is_org_member(org_id));
create policy activities_insert on calendar_activities for insert with check (can_write_org(org_id));
create policy activities_update on calendar_activities for update using (can_write_org(org_id)) with check (can_write_org(org_id));
create policy activities_delete on calendar_activities for delete using (can_write_org(org_id));

-- calendar_occurrences
alter table calendar_occurrences enable row level security;
create policy occurrences_select on calendar_occurrences for select using (is_org_member(org_id));
create policy occurrences_insert on calendar_occurrences for insert with check (can_write_org(org_id));
create policy occurrences_update on calendar_occurrences for update using (can_write_org(org_id)) with check (can_write_org(org_id));
create policy occurrences_delete on calendar_occurrences for delete using (can_write_org(org_id));

-- ===========================================================================
-- Storage: private "evidence" bucket, access gated by org membership.
-- Object path convention: <org_id>/<gap_id>/<uuid-filename>
-- The first path segment is the org_id; we check membership against it.
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

create policy evidence_objects_read on storage.objects
  for select to authenticated using (
    bucket_id = 'evidence'
    and is_org_member((split_part(name, '/', 1))::uuid)
  );

create policy evidence_objects_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'evidence'
    and can_write_org((split_part(name, '/', 1))::uuid)
  );

create policy evidence_objects_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'evidence'
    and can_write_org((split_part(name, '/', 1))::uuid)
  );
