import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createOrganization } from "./actions";
import { Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { org?: string };
}) {
  // Server-side guard: must be signed in to onboard.
  await requireUser();

  // If they already belong to an org, skip onboarding.
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1)
    .maybeSingle();
  if (existing) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-gray-800">
          Set up your organization
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          This is the workspace your team will share.
        </p>
        <form action={createOrganization} className="card space-y-4 p-6">
          <div>
            <label className="label">Organization name</label>
            <input
              name="org_name"
              className="input"
              defaultValue={searchParams.org ?? ""}
              placeholder="Acme Health"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </main>
  );
}
