"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { activityInputSchema } from "@/lib/validations";
import { FREQUENCY_MONTHS, type Frequency } from "@/lib/constants";

/** Generate up to 4 upcoming occurrence dates from a start anchor + frequency. */
function occurrenceDates(start: string, frequency: Frequency): string[] {
  const months = FREQUENCY_MONTHS[frequency];
  const base = new Date(start + "T00:00:00");
  if (months === null) return [start];

  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Walk forward from the anchor; keep the next 4 occurrences that are >= today
  // (plus the anchor itself if it is in the future).
  const cursor = new Date(base);
  let guard = 0;
  while (dates.length < 4 && guard < 240) {
    if (cursor >= today || dates.length === 0) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setMonth(cursor.getMonth() + months);
    guard++;
    if (cursor < today && dates.length === 1) {
      // anchor was in the past; drop it and keep advancing to future dates
      dates.length = 0;
    }
  }
  return dates;
}

export async function createActivity(formData: FormData) {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  const input = activityInputSchema.parse({
    title: String(formData.get("title") ?? ""),
    description: emptyToNull(formData.get("description")),
    category: String(formData.get("category") ?? "other"),
    frequency: String(formData.get("frequency") ?? "quarterly"),
    owner_id: emptyToNull(formData.get("owner_id")),
    start_date: String(formData.get("start_date") ?? new Date().toISOString().slice(0, 10)),
  });

  const { data: activity, error } = await supabase
    .from("calendar_activities")
    .insert({ ...input, org_id: orgId })
    .select("id")
    .single();
  if (error || !activity) throw new Error(error?.message ?? "Could not create activity.");

  const dates = occurrenceDates(input.start_date, input.frequency as Frequency);
  if (dates.length > 0) {
    await supabase.from("calendar_occurrences").insert(
      dates.map((due_date) => ({
        org_id: orgId,
        activity_id: activity.id,
        due_date,
      }))
    );
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function completeOccurrence(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("calendar_occurrences")
    .update({
      status: "complete",
      completed_at: new Date().toISOString(),
      completed_by: user?.id,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function reopenOccurrence(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("calendar_occurrences")
    .update({ status: "pending", completed_at: null, completed_by: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = v == null ? "" : String(v).trim();
  return s === "" ? null : s;
}
