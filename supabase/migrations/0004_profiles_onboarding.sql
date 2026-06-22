-- ============================================================================
-- NIST Compass — 0004 profiles onboarding fix
-- Run this against an EXISTING database. Fresh installs already get the
-- trigger (0001) and the insert policy (0002).
--
-- Problem: creating the owner membership during onboarding failed with
--   insert or update on table "memberships" violates foreign key constraint
--   "memberships_user_id_fkey"
-- because memberships.user_id -> profiles(id) and the user had no profile row
-- (the handle_new_user trigger did not run for that account).
--
-- Fix: ensure every auth user has a profile (backfill + reliable trigger),
-- and allow a user to create their own profile so onboarding can self-heal.
-- ============================================================================

-- 1) (Re)create the signup trigger that mirrors auth.users -> profiles.
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

-- 2) Allow a user to insert their own profile row (used by self-healing
--    onboarding). Reads/updates are already covered by existing policies.
drop policy if exists profile_insert_self on profiles;
create policy profile_insert_self on profiles
  for insert to authenticated with check (id = auth.uid());

-- 3) Backfill: create a profile for every existing auth user missing one.
insert into public.profiles (id, full_name, email)
select u.id, u.raw_user_meta_data->>'full_name', u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
