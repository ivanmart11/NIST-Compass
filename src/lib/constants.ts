// Shared enums + display metadata, mirroring the DB CHECK constraints.

export const GAP_STATUSES = [
  "not_started",
  "in_progress",
  "blocked",
  "complete",
] as const;
export type GapStatus = (typeof GAP_STATUSES)[number];

export const STATUS_LABELS: Record<GapStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  complete: "Complete",
};

export const STATUS_BADGE: Record<GapStatus, string> = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-amber-100 text-amber-800",
  complete: "bg-green-100 text-green-700",
};

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const RISK_BADGE: Record<RiskLevel, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-700",
};

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const ACTIVITY_CATEGORIES = [
  "access_review",
  "termination_review",
  "policy_review",
  "vendor_review",
  "controls_review",
  "other",
] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  access_review: "User Access Review",
  termination_review: "Termination Review",
  policy_review: "Policy Review",
  vendor_review: "Vendor Review",
  controls_review: "Quarterly Controls",
  other: "Other",
};

export const FREQUENCIES = [
  "monthly",
  "quarterly",
  "semiannual",
  "annual",
  "one_time",
] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semiannual: "Semi-annual",
  annual: "Annual",
  one_time: "One-time",
};

// Roughly how many months between occurrences, used to generate the calendar.
export const FREQUENCY_MONTHS: Record<Frequency, number | null> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
  one_time: null,
};

export const ROLES = ["owner", "admin", "member", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const EVIDENCE_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
