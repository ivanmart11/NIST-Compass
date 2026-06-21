"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  createEvidenceUploadUrl,
  recordEvidence,
} from "@/app/(app)/evidence/actions";
import { Button } from "@/components/ui";
import { EVIDENCE_MAX_BYTES } from "@/lib/constants";

export function EvidenceUploader({ gapId }: { gapId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > EVIDENCE_MAX_BYTES) {
      setError("File exceeds the 25 MB limit.");
      return;
    }

    setBusy(true);
    try {
      const { path, token } = await createEvidenceUploadUrl({
        gap_id: gapId,
        file_name: file.name,
        size_bytes: file.size,
        mime_type: file.type,
      });

      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("evidence")
        .uploadToSignedUrl(path, token, file);
      if (upErr) throw upErr;

      await recordEvidence({
        gap_id: gapId,
        file_name: file.name,
        storage_path: path,
        size_bytes: file.size,
        mime_type: file.type,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onFile}
        disabled={busy}
      />
      <Button
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? "Uploading…" : "+ Upload"}
      </Button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
