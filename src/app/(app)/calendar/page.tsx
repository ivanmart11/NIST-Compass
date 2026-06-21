import { createClient } from "@/lib/supabase/server";
import { getActiveOrg, getOrgMembers } from "@/lib/auth";
import { PageHeader, Card, Badge, Button, EmptyState } from "@/components/ui";
import { ActivityForm } from "@/components/calendar/ActivityForm";
import { createActivity, completeOccurrence, reopenOccurrence } from "./actions";
import { CATEGORY_LABELS, type ActivityCategory } from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/utils";

export const dynamic = "force-dynamic";

type OccurrenceRow = {
  id: string;
  due_date: string;
  status: "pending" | "complete" | "skipped";
  activity: {
    title: string;
    category: ActivityCategory;
    owner: { full_name: string | null } | null;
  } | null;
};

export default async function CalendarPage() {
  const { orgId } = await getActiveOrg();
  const members = await getOrgMembers(orgId);
  const supabase = createClient();

  const { data } = await supabase
    .from("calendar_occurrences")
    .select(
      "id, due_date, status, activity:calendar_activities(title, category, owner:profiles(full_name))"
    )
    .eq("org_id", orgId)
    .order("due_date", { ascending: true });

  const rows = (data as unknown as OccurrenceRow[] | null) ?? [];

  return (
    <div>
      <PageHeader
        title="Compliance Calendar"
        description="Recurring reviews and control checks. Each activity generates dated occurrences to check off."
      />

      <div className="mb-6">
        <ActivityForm action={createActivity} members={members} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No scheduled activities"
          description="Create a recurring activity such as a quarterly access review or vendor review."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Activity</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => {
                const overdue =
                  r.status === "pending" && isOverdue(r.due_date);
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={overdue ? "font-medium text-red-600" : "text-gray-700"}>
                        {formatDate(r.due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.activity?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.activity ? CATEGORY_LABELS[r.activity.category] : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.activity?.owner?.full_name ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "complete" ? (
                        <Badge className="bg-green-100 text-green-700">Done</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "complete" ? (
                        <form action={reopenOccurrence.bind(null, r.id)}>
                          <Button variant="ghost" type="submit" className="px-2 py-1 text-xs">
                            Reopen
                          </Button>
                        </form>
                      ) : (
                        <form action={completeOccurrence.bind(null, r.id)}>
                          <Button variant="secondary" type="submit" className="px-2 py-1 text-xs">
                            Mark done
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
