import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  const [statsRes, openRes, overdueRes] = await Promise.all([
    supabase.from("v_dashboard_stats").select("*").eq("org_id", orgId).maybeSingle(),
    supabase
      .from("v_open_gaps")
      .select("title, subcategory_code, risk_level, status, owner_name, due_date")
      .eq("org_id", orgId)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("v_overdue_items")
      .select("title, kind, owner_name, due_date")
      .eq("org_id", orgId)
      .order("due_date", { ascending: true }),
  ]);

  const stats = (statsRes.data as DashboardStats | null) ?? null;
  const open = (openRes.data as OpenRow[] | null) ?? [];
  const overdue = (overdueRes.data as OverdueRow[] | null) ?? [];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Snapshot reports for your team and auditors. Export to CSV for sharing."
      />

      {/* Executive summary */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Executive Summary</h3>
          <ExportLink type="executive-summary" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Open gaps" value={stats?.open_gaps ?? 0} />
          <Stat label="Closed gaps" value={stats?.closed_gaps ?? 0} />
          <Stat label="Overdue" value={stats?.overdue_gaps ?? 0} accent="text-red-600" />
          <Stat label="Critical/High open" value={(stats?.risk_critical ?? 0) + (stats?.risk_high ?? 0)} />
        </div>
      </Card>

      {/* Open gaps */}
      <Card className="mb-6 p-0">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-medium text-gray-900">
            Open Gap Report ({open.length})
          </h3>
          <ExportLink type="open-gaps" />
        </div>
        <ReportTable
          head={["Title", "NIST", "Risk", "Status", "Owner", "Due"]}
          rows={open.map((g) => [
            g.title,
            g.subcategory_code ?? "—",
            g.risk_level,
            g.status,
            g.owner_name ?? "Unassigned",
            formatDate(g.due_date),
          ])}
          empty="No open gaps."
        />
      </Card>

      {/* Overdue */}
      <Card className="p-0">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-medium text-gray-900">
            Overdue Items Report ({overdue.length})
          </h3>
          <ExportLink type="overdue" />
        </div>
        <ReportTable
          head={["Item", "Type", "Owner", "Due"]}
          rows={overdue.map((o) => [
            o.title,
            o.kind,
            o.owner_name ?? "Unassigned",
            formatDate(o.due_date),
          ])}
          empty="Nothing overdue."
        />
      </Card>
    </div>
  );
}

type OpenRow = {
  title: string;
  subcategory_code: string | null;
  risk_level: string;
  status: string;
  owner_name: string | null;
  due_date: string | null;
};
type OverdueRow = {
  title: string;
  kind: string;
  owner_name: string | null;
  due_date: string;
};

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function ExportLink({ type }: { type: string }) {
  return (
    <a
      href={`/api/reports/${type}?format=csv`}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Export CSV
    </a>
  );
}

function ReportTable({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="px-5 pb-6 text-sm text-gray-400">{empty}</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead className="border-y border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
        <tr>
          {head.map((h) => (
            <th key={h} className="px-5 py-2.5 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              <td key={j} className="px-5 py-2.5 text-gray-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
