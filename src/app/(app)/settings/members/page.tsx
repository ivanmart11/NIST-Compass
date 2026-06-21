import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { PageHeader, Card, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

type MemberRow = {
  role: string;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export default async function MembersPage() {
  const { orgId, name, role } = await getActiveOrg();
  const supabase = createClient();

  const { data } = await supabase
    .from("memberships")
    .select("role, created_at, profiles(full_name, email)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  const members = (data as unknown as MemberRow[] | null) ?? [];

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Members"
        description={`People with access to ${name}.`}
      />

      <Card className="p-0">
        <ul className="divide-y divide-gray-100">
          {members.map((m, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-gray-900">
                  {m.profiles?.full_name ?? "Unnamed user"}
                </p>
                <p className="text-sm text-gray-500">{m.profiles?.email}</p>
              </div>
              <Badge className="bg-brand-50 text-brand-700 capitalize">
                {m.role}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      {(role === "owner" || role === "admin") && (
        <p className="mt-4 text-sm text-gray-500">
          Member invitations arrive in V1.1. For now, teammates can sign up and
          be added to this organization.
        </p>
      )}
    </div>
  );
}
