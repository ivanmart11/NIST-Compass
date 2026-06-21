"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { evidenceInputSchema } from "@/lib/validations";
import { EVIDENCE_MAX_BYTES } from "@/lib/constants";

const BUCKET = "evidence";

/**
 * Returns a signed URL the browser can PUT the file to directly, plus the
 * storage path to persist afterwards. Path: <org_id>/<gap_id>/<rand>-<name>.
 */
export async function createEvidenceUploadUrl(input: {
  gap_id: string;
  file_name: string;
  size_bytes: number;
  mime_type?: string;
}) {
  const parsed = evidenceInputSchema
    .pick({ gap_id: true, file_name: true, size_bytes: true, mime_type: true })
    .parse(input);

  if (parsed.size_bytes > EVIDENCE_MAX_BYTES) {
    throw new Error("File exceeds the 25 MB limit.");
  }

  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  const safeName = parsed.file_name.replace(/[^\w.\-]+/g, "_");
  const rand = crypto.randomUUID().slice(0, 8);
  const path = `${orgId}/${parsed.gap_id}/${rand}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Could not sign upload.");

  return { token: data.token, path, signedUrl: data.signedUrl };
}

/** Persists evidence metadata after the file has been uploaded to storage. */
export async function recordEvidence(input: {
  gap_id: string;
  file_name: string;
  storage_path: string;
  size_bytes: number;
  mime_type?: string;
  description?: string | null;
}) {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("evidence").insert({
    org_id: orgId,
    gap_id: input.gap_id,
    file_name: input.file_name,
    storage_path: input.storage_path,
    size_bytes: input.size_bytes,
    mime_type: input.mime_type ?? null,
    description: input.description ?? null,
    uploaded_by: user?.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/gaps/${input.gap_id}`);
  revalidatePath("/evidence");
}

/** Short-lived signed URL for downloading/viewing an evidence file. */
export async function getEvidenceUrl(storagePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60);
  if (error || !data) throw new Error(error?.message ?? "Could not sign URL.");
  return data.signedUrl;
}

export async function deleteEvidence(id: string, storagePath: string, gapId: string) {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase.from("evidence").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/gaps/${gapId}`);
  revalidatePath("/evidence");
}
