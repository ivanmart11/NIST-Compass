import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { formatBytes, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  file_name: string;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
  gap: { id: string; title: string } | null;
  uploader: { full_name: string | null } | null;
};

export default async function EvidencePage() {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  const { data } = await supabase
    .from("evidence")
    .select(
      "id, file_name, size_bytes, mime_type, created_at, gap:gaps(id, title), uploader:profiles(full_name)"
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const rows = (data as unknown as Row[] | null) ?? [];

  return (
    <div>
      <PageHeader
        title="Evidence"
        description="Every artifact attached across your gaps. Open a gap to upload or remove files."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No evidence yet"
          description="Attach policies, screenshots, and documents from a gap's detail page."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Gap</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Uploaded by</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.file_name}
                  </td>
                  <td className="px-4 py-3">
                    {r.gap ? (
                      <Link
                        href={`/gaps/${r.gap.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {r.gap.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatBytes(r.size_bytes)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.uploader?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
