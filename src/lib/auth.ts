import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "./supabase/server";

const ACTIVE_ORG_COOKIE = "active_org";

export type Membership = {
  org_id: string;
  role: string;
  organizations: { id: string; name: string } | null;
};

/** Returns the signed-in user or redirects to /login. */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

/** All memberships (with org info) for the current user. */
export async function getMemberships(): Promise<Membership[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("memberships")
    .select("org_id, role, organizations(id, name)")
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as Membership[];
}

/**
 * Resolve the user's active organization. Uses the `active_org` cookie when
 * valid, otherwise falls back to the first membership. Redirects to onboarding
 * if the user has no organization yet.
 */
export async function getActiveOrg() {
  const memberships = await getMemberships();
  if (memberships.length === 0) redirect("/onboarding");

  const cookieStore = cookies();
  const preferred = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const active =
    memberships.find((m) => m.org_id === preferred) ?? memberships[0];

  return {
    orgId: active.org_id,
    role: active.role,
    name: active.organizations?.name ?? "Organization",
    memberships,
  };
}

export type OrgMember = {
  id: string;
  full_name: string | null;
  email: string | null;
};

/** Profiles of everyone who is a member of the given org. */
export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("memberships")
    .select("profiles(id, full_name, email)")
    .eq("org_id", orgId);
  const rows = (data ?? []) as unknown as { profiles: OrgMember | null }[];
  return rows.map((row) => row.profiles).filter(Boolean) as OrgMember[];
}

export const ACTIVE_ORG_COOKIE_NAME = ACTIVE_ORG_COOKIE;
