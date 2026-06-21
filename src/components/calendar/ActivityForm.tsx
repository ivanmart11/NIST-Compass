"use client";

import { useState } from "react";
import {
  ACTIVITY_CATEGORIES,
  CATEGORY_LABELS,
  FREQUENCIES,
  FREQUENCY_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui";
import type { OrgMember } from "@/lib/auth";

export function ActivityForm({
  action,
  members,
}: {
  action: (formData: FormData) => void;
  members: OrgMember[];
}) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ New Activity</Button>;
  }

  return (
    <form
      action={action}
      className="card grid w-full gap-4 p-5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label className="label">Title</label>
        <input
          name="title"
          className="input"
          placeholder="e.g. Quarterly User Access Review"
          required
        />
      </div>
      <div>
        <label className="label">Category</label>
        <select name="category" className="input" defaultValue="access_review">
          {ACTIVITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Frequency</label>
        <select name="frequency" className="input" defaultValue="quarterly">
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {FREQUENCY_LABELS[f]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Owner</label>
        <select name="owner_id" className="input" defaultValue="">
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name ?? m.email}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">First due date</label>
        <input type="date" name="start_date" className="input" defaultValue={today} />
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Button type="submit">Create activity</Button>
        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
