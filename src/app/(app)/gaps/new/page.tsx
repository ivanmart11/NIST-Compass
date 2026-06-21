import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg, getOrgMembers } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { GapForm } from "@/components/gaps/GapForm";
import { createGap } from "../actions";
import type { FrameworkSubcategory } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function NewGapPage({
  searchParams,
}: {
  searchParams: { subcategory?: string };
}) {
  const { orgId } = await getActiveOrg();
  const members = await getOrgMembers(orgId);

  let subcategory: FrameworkSubcategory | null = null;
  if (searchParams.subcategory) {
    const supabase = createClient();
    const { data } = await supabase
      .from("framework_subcategories")
      .select("*")
      .eq("id", searchParams.subcategory)
      .maybeSingle();
    subcategory = (data as FrameworkSubcategory | null) ?? null;
  }

  return (
    <div>
      <PageHeader
        title="New Gap"
        description={
          subcategory
            ? `Linked to ${subcategory.code}`
            : "Track a new compliance gap."
        }
      />
      <Link href="/gaps" className="mb-4 inline-block text-sm text-brand-600">
        ‹ Back to gaps
      </Link>
      <GapForm
        action={createGap}
        members={members}
        subcategory={subcategory}
        subcategoryId={searchParams.subcategory ?? null}
        submitLabel="Create gap"
      />
    </div>
  );
}
