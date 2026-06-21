import {
  GAP_STATUSES,
  RISK_LEVELS,
  PRIORITIES,
  STATUS_LABELS,
  RISK_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";
import type { Gap, FrameworkSubcategory } from "@/types/db";
import { Button } from "@/components/ui";

type Member = { id: string; full_name: string | null; email: string | null };

export function GapForm({
  action,
  gap,
  members,
  subcategory,
  subcategoryId,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  gap?: Gap;
  members: Member[];
  subcategory?: FrameworkSubcategory | null;
  subcategoryId?: string | null;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-3">
      <input
        type="hidden"
        name="subcategory_id"
        value={gap?.subcategory_id ?? subcategoryId ?? ""}
      />

      <div className="space-y-4 lg:col-span-2">
        <div>
          <label className="label">Title</label>
          <input
            name="title"
            className="input"
            defaultValue={gap?.title ?? ""}
            placeholder="e.g. Enable MFA organization-wide"
            required
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            className="input min-h-[80px]"
            defaultValue={gap?.description ?? ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current state</label>
            <textarea
              name="current_state"
              className="input min-h-[70px]"
              defaultValue={gap?.current_state ?? ""}
            />
          </div>
          <div>
            <label className="label">Desired state</label>
            <textarea
              name="desired_state"
              className="input min-h-[70px]"
              defaultValue={gap?.desired_state ?? ""}
            />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            name="notes"
            className="input min-h-[60px]"
            defaultValue={gap?.notes ?? ""}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="card space-y-4 p-4">
          {(subcategory || gap?.subcategory_id) && (
            <div>
              <label className="label">NIST CSF 2.0</label>
              <p className="font-mono text-sm text-brand-700">
                {subcategory?.code ?? "Linked subcategory"}
              </p>
              {subcategory?.description && (
                <p className="mt-1 text-xs text-gray-500">
                  {subcategory.description}
                </p>
              )}
            </div>
          )}
          <Select name="status" label="Status" defaultValue={gap?.status ?? "not_started"}>
            {GAP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select name="risk_level" label="Risk level" defaultValue={gap?.risk_level ?? "medium"}>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {RISK_LABELS[r]}
              </option>
            ))}
          </Select>
          <Select name="priority" label="Priority" defaultValue={gap?.priority ?? "medium"}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
          <Select name="owner_id" label="Owner" defaultValue={gap?.owner_id ?? ""}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name ?? m.email}
              </option>
            ))}
          </Select>
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              name="due_date"
              className="input"
              defaultValue={gap?.due_date ?? ""}
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Select({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} className="input" defaultValue={defaultValue}>
        {children}
      </select>
    </div>
  );
}
