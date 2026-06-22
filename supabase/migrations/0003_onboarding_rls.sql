-- ============================================================================
-- NIST Compass — 0003 onboarding RLS fix
-- Run this against an EXISTING database (one created before created_by was
-- added). Fresh installs already get these from 0001 + 0002.
--
-- Problem: creating an organization during onboarding failed with
--   "new row violates row-level security policy for table organizations".
-- The org INSERT used `.select()` (INSERT ... RETURNING), which forces the
-- org_select policy to evaluate the new row. That policy required org
-- membership, which does not exist yet at creation time -> denied.
--
-- Fix: track who created the org and let the creator both insert and read it.
-- ============================================================================

-- 1) Track the creator. Defaults to the authenticated user at insert time.
alter table organizations
  add column if not exists created_by uuid default auth.uid();

-- 2) Insert: an authenticated user may create an org, only as its creator.
drop policy if exists org_insert on organizations;
create policy org_insert on organizations
  for insert to authenticated
  with check (created_by = auth.uid());

-- 3) Select: members can read their orgs; the creator can also read the org
--    they just created (needed for INSERT ... RETURNING during onboarding).
drop policy if exists org_select on organizations;
create policy org_select on organizations
  for select using (created_by = auth.uid() or is_org_member(id));

-- 4) Re-affirm the first-time membership bootstrap policy: a user may insert
--    their OWN membership (becoming owner of the org they just created), and
--    owners/admins may add others. (Idempotent — safe if already correct.)
drop policy if exists membership_insert on memberships;
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
