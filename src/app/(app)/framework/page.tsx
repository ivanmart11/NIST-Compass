import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { FrameworkBrowser } from "@/components/framework/FrameworkBrowser";
import type {
  FrameworkFunction,
  FrameworkCategory,
  FrameworkSubcategory,
} from "@/types/db";

export const dynamic = "force-dynamic";

export default async function FrameworkPage() {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  const [fnRes, catRes, subRes, gapRes] = await Promise.all([
    supabase.from("framework_functions").select("*").order("sort_order"),
    supabase.from("framework_categories").select("*").order("sort_order"),
    supabase.from("framework_subcategories").select("*").order("sort_order"),
    supabase.from("gaps").select("subcategory_id").eq("org_id", orgId),
  ]);

  const functions = (fnRes.data as FrameworkFunction[] | null) ?? [];
  const categories = (catRes.data as FrameworkCategory[] | null) ?? [];
  const subcategories = (subRes.data as FrameworkSubcategory[] | null) ?? [];
  const coveredSubIds = new Set(
    ((gapRes.data as { subcategory_id: string | null }[] | null) ?? [])
      .map((g) => g.subcategory_id)
      .filter(Boolean) as string[]
  );

  return (
    <div>
      <PageHeader
        title="NIST CSF 2.0 Framework"
        description="Browse functions, categories, and subcategories. Create a gap from any subcategory."
      />
      {functions.length === 0 ? (
        <p className="card p-6 text-sm text-gray-500">
          The framework catalog has not been seeded yet. Run{" "}
          <code className="rounded bg-gray-100 px-1">supabase/seed.sql</code>.
        </p>
      ) : (
        <FrameworkBrowser
          functions={functions}
          categories={categories}
          subcategories={subcategories}
          coveredSubIds={Array.from(coveredSubIds)}
        />
      )}
    </div>
  );
}
