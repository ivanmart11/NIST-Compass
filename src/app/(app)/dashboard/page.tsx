import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { PageHeader, Card, LinkButton } from "@/components/ui";
import { STATUS_LABELS, RISK_LABELS } from "@/lib/constants";
import { formatDate, daysUntil } from "@/lib/utils";
import type { DashboardStats } from "@/types/db";

export const dynamic = "force-dynamic";

type DeadlineRow = {
  id: string;
  title: string;
  due_date: string;
  owner_name: string | null;
  kind: string;
};

export default async function DashboardPage() {
  const { orgId } = await getActiveOrg();
  const supabase = createClient();

  const [statsRes, upcomingRes, overdueRes] = await Promise.all([
    supabase.from("v_dashboard_stats").select("*").eq("org_id", orgId).maybeSingle(),
    supabase
      .from("v_upcoming_deadlines")
      .select("*")
      .eq("org_id", orgId)
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("v_overdue_items")
      .select("*")
      .eq("org_id", orgId)
      .order("due_date", { ascending: true })
      .limit(6),
  ]);

  const stats = (statsRes.data as DashboardStats | null) ?? null;
  const upcoming = (upcomingRes.data as DeadlineRow[] | null) ?? [];
  const overdue = (overdueRes.data as DeadlineRow[] | null) ?? [];

  const cards = [
    { label: "Open gaps", value: stats?.open_gaps ?? 0, href: "/gaps?status=open" },
    { label: "Closed gaps", value: stats?.closed_gaps ?? 0, href: "/gaps?status=complete" },
    { label: "Overdue", value: stats?.overdue_gaps ?? 0, href: "/gaps", accent: "text-red-600" },
    { label: "Due ≤ 30 days", value: stats?.due_soon_gaps ?? 0, href: "/calendar" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your compliance posture at a glance."
        action={<LinkButton href="/gaps/new">+ New Gap</LinkButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="transition-shadow hover:shadow-md">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-1 text-3xl font-semibold ${c.accent ?? "text-gray-900"}`}>
                {c.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-medium text-gray-900">Open gaps by status</h3>
          <BreakdownBar
            rows={[
              ["not_started", STATUS_LABELS.not_started, stats?.not_started ?? 0, "bg-gray-400"],
              ["in_progress", STATUS_LABELS.in_progress, stats?.in_progress ?? 0, "bg-blue-500"],
              ["blocked", STATUS_LABELS.blocked, stats?.blocked ?? 0, "bg-amber-500"],
            ]}
          />
        </Card>
        <Card>
          <h3 className="mb-3 font-medium text-gray-900">Open gaps by risk</h3>
          <BreakdownBar
            rows={[
              ["critical", RISK_LABELS.critical, stats?.risk_critical ?? 0, "bg-red-500"],
              ["high", RISK_LABELS.high, stats?.risk_high ?? 0, "bg-orange-500"],
              ["medium", RISK_LABELS.medium, stats?.risk_medium ?? 0, "bg-yellow-500"],
              ["low", RISK_LABELS.low, stats?.risk_low ?? 0, "bg-gray-400"],
            ]}
          />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-medium text-gray-900">Upcoming deadlines</h3>
          <DeadlineList rows={upcoming} empty="No deadlines in the next 30 days." />
        </Card>
        <Card>
          <h3 className="mb-3 font-medium text-gray-900">Overdue items</h3>
          <DeadlineList rows={overdue} empty="Nothing overdue. Nice work." overdue />
        </Card>
      </div>
    </div>
  );
}

function BreakdownBar({
  rows,
}: {
  rows: [string, string, number, string][];
}) {
  const total = rows.reduce((s, r) => s + r[2], 0) || 1;
  return (
    <div className="space-y-3">
      {rows.map(([key, label, value, color]) => (
        <div key={key}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full ${color}`}
              style={{ width: `${(value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeadlineList({
  rows,
  empty,
  overdue,
}: {
  rows: DeadlineRow[];
  empty: string;
  overdue?: boolean;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-gray-100">
      {rows.map((r) => {
        const d = daysUntil(r.due_date);
        return (
          <li key={`${r.kind}-${r.id}`} className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{r.title}</p>
              <p className="text-xs text-gray-400">
                {r.kind === "gap" ? "Gap" : "Calendar"} · {r.owner_name ?? "Unassigned"}
              </p>
            </div>
            <div className="ml-3 text-right">
              <p className="text-sm text-gray-600">{formatDate(r.due_date)}</p>
              <p className={`text-xs ${overdue ? "text-red-600" : "text-gray-400"}`}>
                {d === null ? "" : d < 0 ? `${-d}d overdue` : `in ${d}d`}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
