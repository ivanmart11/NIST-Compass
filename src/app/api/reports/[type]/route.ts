import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/auth";
import { reportTypeSchema } from "@/lib/validations";
import { csvCell } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const parsedType = reportTypeSchema.safeParse(params.type);
  if (!parsedType.success) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: "Unknown report type." } },
      { status: 400 }
    );
  }
  const type = parsedType.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthenticated", message: "Sign in required." } },
      { status: 401 }
    );
  }

  const { orgId } = await getActiveOrg();
  const format = request.nextUrl.searchParams.get("format") ?? "csv";

  let header: string[] = [];
  let rows: unknown[][] = [];

  if (type === "open-gaps") {
    const { data } = await supabase
      .from("v_open_gaps")
      .select("title, subcategory_code, risk_level, status, priority, owner_name, due_date")
      .eq("org_id", orgId)
      .order("due_date", { ascending: true, nullsFirst: false });
    header = ["Title", "NIST", "Risk", "Status", "Priority", "Owner", "Due"];
    rows = (data ?? []).map((g) => [
      g.title,
      g.subcategory_code,
      g.risk_level,
      g.status,
      g.priority,
      g.owner_name,
      g.due_date,
    ]);
  } else if (type === "overdue") {
    const { data } = await supabase
      .from("v_overdue_items")
      .select("title, kind, owner_name, due_date")
      .eq("org_id", orgId)
      .order("due_date", { ascending: true });
    header = ["Item", "Type", "Owner", "Due"];
    rows = (data ?? []).map((o) => [o.title, o.kind, o.owner_name, o.due_date]);
  } else {
    // executive-summary
    const { data } = await supabase
      .from("v_dashboard_stats")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();
    const s = data ?? {};
    header = ["Metric", "Value"];
    rows = [
      ["Open gaps", s.open_gaps ?? 0],
      ["Closed gaps", s.closed_gaps ?? 0],
      ["Overdue gaps", s.overdue_gaps ?? 0],
      ["Due within 30 days", s.due_soon_gaps ?? 0],
      ["Critical (open)", s.risk_critical ?? 0],
      ["High (open)", s.risk_high ?? 0],
      ["Medium (open)", s.risk_medium ?? 0],
      ["Low (open)", s.risk_low ?? 0],
    ];
  }

  if (format === "json") {
    return NextResponse.json({
      report: type,
      generated_at: new Date().toISOString(),
      rows: rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]]))),
    });
  }

  const csv = [header, ...rows]
    .map((r) => r.map(csvCell).join(","))
    .join("\n");
  const filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
