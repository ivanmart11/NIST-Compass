"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ org_name: z.string().trim().min(1).max(120) });

/**
 * Provisions an organization + owner membership for the signed-in user.
 * Runs server-side with the session cookies, so RLS sees `auth.uid()`.
 */
export async function createOrganization(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/onboarding");

  const parsed = schema.safeParse({ org_name: formData.get("org_name") });
  if (!parsed.success) {
    throw new Error("Organization name is required.");
  }

  // Already onboarded? Go straight to the dashboard.
  const { data: existing } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1)
    .maybeSingle();
  if (existing) redirect("/dashboard");

  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .insert({ name: parsed.data.org_name })
    .select("id")
    .single();
  if (orgErr || !org) {
    throw new Error(orgErr?.message ?? "Could not create organization.");
  }

  const { error: memErr } = await supabase.from("memberships").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });
  if (memErr) throw new Error(memErr.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
