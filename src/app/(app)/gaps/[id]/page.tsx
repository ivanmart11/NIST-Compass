import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg, getOrgMembers } from "@/lib/auth";
import { PageHeader, Card, Button } from "@/components/ui";
import { GapForm } from "@/components/gaps/GapForm";
import { EvidenceUploader } from "@/components/gaps/EvidenceUploader";
import { EvidenceRow } from "@/components/gaps/EvidenceRow";
import { updateGap, deleteGap, addComment } from "../actions";
import { formatDate } from "@/lib/utils";
import type { Gap, Evidence, FrameworkSubcategory } from "@/types/db";

export const dynamic = "force-dynamic";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  author: { full_name: string | null } | null;
};

export default async function GapDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  const { data: gapData } = await supabase
    .from("gaps")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const gap = gapData as Gap | null;
  if (!gap) notFound();

  const [members, subRes, evidenceRes, commentsRes] = await Promise.all([
    getOrgMembers(orgId),
    gap.subcategory_id
      ? supabase
          .from("framework_subcategories")
          .select("*")
          .eq("id", gap.subcategory_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("evidence")
      .select("*")
      .eq("gap_id", gap.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("gap_comments")
      .select("id, body, created_at, author:profiles(full_name)")
      .eq("gap_id", gap.id)
      .order("created_at", { ascending: true }),
  ]);

  const subcategory = (subRes.data as FrameworkSubcategory | null) ?? null;
  const evidence = (evidenceRes.data as Evidence[] | null) ?? [];
  const comments = (commentsRes.data as unknown as Comment[] | null) ?? [];

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/gaps" className="text-sm text-brand-600">
          ‹ Back to gaps
        </Link>
        <form action={deleteGap.bind(null, gap.id)}>
          <Button variant="danger" type="submit">
            Delete
          </Button>
        </form>
      </div>

      <PageHeader
        title={gap.title}
        description={`Created ${formatDate(gap.created_at)}${
          gap.closed_at ? ` · Closed ${formatDate(gap.closed_at)}` : ""
        }`}
      />

      <GapForm
        action={updateGap.bind(null, gap.id)}
        gap={gap}
        members={members}
        subcategory={subcategory}
        submitLabel="Save changes"
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              Evidence ({evidence.length})
            </h3>
            <EvidenceUploader gapId={gap.id} />
          </div>
          {evidence.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No evidence attached yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {evidence.map((e) => (
                <EvidenceRow key={e.id} item={e} />
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 font-medium text-gray-900">Comments</h3>
          <ul className="mb-4 space-y-3">
            {comments.length === 0 && (
              <li className="text-sm text-gray-400">No comments yet.</li>
            )}
            {comments.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="font-medium text-gray-800">
                  {c.author?.full_name ?? "Someone"}
                </span>{" "}
                <span className="text-xs text-gray-400">
                  {formatDate(c.created_at)}
                </span>
                <p className="text-gray-600">{c.body}</p>
              </li>
            ))}
          </ul>
          <form action={addComment.bind(null, gap.id)} className="flex gap-2">
            <input
              name="body"
              className="input"
              placeholder="Add a note…"
              required
            />
            <Button type="submit" variant="secondary">
              Post
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
