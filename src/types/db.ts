// Hand-written DB row types. In a fuller setup these can be generated with
// `supabase gen types typescript`. Kept minimal and aligned with the schema.

import type {
  GapStatus,
  RiskLevel,
  Priority,
  ActivityCategory,
  Frequency,
} from "@/lib/constants";

export type FrameworkFunction = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type FrameworkCategory = {
  id: string;
  function_id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type FrameworkSubcategory = {
  id: string;
  category_id: string;
  code: string;
  description: string;
  sort_order: number;
};

export type Gap = {
  id: string;
  org_id: string;
  subcategory_id: string | null;
  title: string;
  description: string | null;
  current_state: string | null;
  desired_state: string | null;
  risk_level: RiskLevel;
  status: GapStatus;
  priority: Priority;
  owner_id: string | null;
  due_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type Evidence = {
  id: string;
  org_id: string;
  gap_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type CalendarActivity = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  category: ActivityCategory;
  frequency: Frequency;
  owner_id: string | null;
  start_date: string;
  active: boolean;
  created_at: string;
};

export type CalendarOccurrence = {
  id: string;
  org_id: string;
  activity_id: string;
  due_date: string;
  status: "pending" | "complete" | "skipped";
  completed_at: string | null;
  completed_by: string | null;
  note: string | null;
};

export type DashboardStats = {
  org_id: string;
  open_gaps: number;
  closed_gaps: number;
  overdue_gaps: number;
  due_soon_gaps: number;
  not_started: number;
  in_progress: number;
  blocked: number;
  risk_critical: number;
  risk_high: number;
  risk_medium: number;
  risk_low: number;
};
