"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getEvidenceUrl, deleteEvidence } from "@/app/(app)/evidence/actions";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Evidence } from "@/types/db";

export function EvidenceRow({ item }: { item: Evidence }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function view() {
    const url = await getEvidenceUrl(item.storage_path);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function remove() {
    if (!confirm(`Delete ${item.file_name}?`)) return;
    setBusy(true);
    await deleteEvidence(item.id, item.storage_path, item.gap_id);
    router.refresh();
  }

  return (
    <li className="flex items-center justify-between py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-800">
          {item.file_name}
        </p>
        <p className="text-xs text-gray-400">
          {formatBytes(item.size_bytes)} · {formatDate(item.created_at)}
        </p>
      </div>
      <div className="ml-3 flex items-center gap-2 text-sm">
        <button onClick={view} className="text-brand-600 hover:underline">
          View
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="text-red-600 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
