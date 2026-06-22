import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { PageHeader, LinkButton, Badge, EmptyState } from "@/components/ui";
import {
  STATUS_LABELS,
  STATUS_BADGE,
  RISK_LABELS,
  RISK_BADGE,
  GAP_STATUSES,
  RISK_LEVELS,
  type GapStatus,
} from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/utils";

export const dynamic = "force-dynamic";

type GapRow = {
  id: string;
  title: string;
  risk_level: keyof typeof RISK_LABELS;
  status: GapStatus;
  due_date: string | null;
  owner: { full_name: string | null } | null;
  sub: { code: string } | null;
};

export default async function GapsPage({
  searchParams,
}: {
  searchParams: { status?: string; risk?: string; q?: string };
}) {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  let query = supabase
    .from("gaps")
    .select(
      "id, title, risk_level, status, due_date, owner:profiles!gaps_owner_id_fkey(full_name), sub:framework_subcategories(code)"
    )
    .eq("org_id", orgId)
    .order("due_date", { ascending: true, nullsFirst: false });

  const { status, risk, q } = searchParams;
  if (status === "open") query = query.neq("status", "complete");
  else if (status && GAP_STATUSES.includes(status as GapStatus))
    query = query.eq("status", status);
  if (risk && RISK_LEVELS.includes(risk as never)) query = query.eq("risk_level", risk);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load gaps: ${error.message}`);
  }
  const gaps = (data as unknown as GapRow[] | null) ?? [];

  return (
    <div>
      <PageHeader
        title="Gaps"
        description="Your compliance gap register."
        action={<LinkButton href="/gaps/new">+ New Gap</LinkButton>}
      />

      <form className="card mb-4 flex flex-wrap items-end gap-3 p-4" method="get">
        <FilterSelect name="status" label="Status" value={status}>
          <option value="">All</option>
          <option value="open">Open (any)</option>
          {GAP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="risk" label="Risk" value={risk}>
          <option value="">All</option>
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>
              {RISK_LABELS[r]}
            </option>
          ))}
        </FilterSelect>
        <div className="flex-1">
          <label className="label">Search</label>
          <input
            name="q"
            defaultValue={q ?? ""}
            className="input"
            placeholder="Search by title…"
          />
        </div>
        <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">
          Apply
        </button>
      </form>

      {gaps.length === 0 ? (
        <EmptyState
          title="No gaps yet"
          description="Create a gap directly or start from the NIST framework library."
          action={<LinkButton href="/gaps/new">+ New Gap</LinkButton>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">NIST</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gaps.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/gaps/${g.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                      {g.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {g.sub?.code ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={RISK_BADGE[g.risk_level]}>
                      {RISK_LABELS[g.risk_level]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_BADGE[g.status]}>
                      {STATUS_LABELS[g.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {g.owner?.full_name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        g.status !== "complete" && isOverdue(g.due_date)
                          ? "font-medium text-red-600"
                          : "text-gray-600"
                      }
                    >
                      {formatDate(g.due_date)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  name,
  label,
  value,
  children,
}: {
  name: string;
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} defaultValue={value ?? ""} className="input min-w-[140px]">
        {children}
      </select>
    </div>
  );
}
