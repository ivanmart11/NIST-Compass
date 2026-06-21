"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { gapInputSchema } from "@/lib/validations";
import type { GapStatus } from "@/lib/constants";

function parseForm(formData: FormData) {
  const raw = {
    title: String(formData.get("title") ?? ""),
    description: emptyToNull(formData.get("description")),
    current_state: emptyToNull(formData.get("current_state")),
    desired_state: emptyToNull(formData.get("desired_state")),
    risk_level: String(formData.get("risk_level") ?? "medium"),
    status: String(formData.get("status") ?? "not_started"),
    priority: String(formData.get("priority") ?? "medium"),
    owner_id: emptyToNull(formData.get("owner_id")),
    due_date: emptyToNull(formData.get("due_date")),
    notes: emptyToNull(formData.get("notes")),
    subcategory_id: emptyToNull(formData.get("subcategory_id")),
  };
  return gapInputSchema.parse(raw);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = v == null ? "" : String(v).trim();
  return s === "" ? null : s;
}

export async function createGap(formData: FormData) {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const input = parseForm(formData);
  const { data, error } = await supabase
    .from("gaps")
    .insert({ ...input, org_id: orgId, created_by: user?.id })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/gaps");
  revalidatePath("/dashboard");
  redirect(`/gaps/${data.id}`);
}

export async function updateGap(id: string, formData: FormData) {
  const supabase = createClient();
  const input = parseForm(formData);
  const { error } = await supabase.from("gaps").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/gaps/${id}`);
  revalidatePath("/gaps");
  revalidatePath("/dashboard");
  redirect(`/gaps/${id}`);
}

export async function updateGapStatus(id: string, status: GapStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("gaps").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/gaps/${id}`);
  revalidatePath("/gaps");
  revalidatePath("/dashboard");
}

export async function deleteGap(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("gaps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/gaps");
  revalidatePath("/dashboard");
  redirect("/gaps");
}

export async function addComment(gapId: string, formData: FormData) {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const { error } = await supabase.from("gap_comments").insert({
    org_id: orgId,
    gap_id: gapId,
    author_id: user?.id,
    body,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/gaps/${gapId}`);
}
