import { z } from "zod";
import {
  GAP_STATUSES,
  RISK_LEVELS,
  PRIORITIES,
  ACTIVITY_CATEGORIES,
  FREQUENCIES,
  EVIDENCE_MAX_BYTES,
} from "./constants";

export const gapInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  current_state: z.string().max(5000).optional().nullable(),
  desired_state: z.string().max(5000).optional().nullable(),
  risk_level: z.enum(RISK_LEVELS),
  status: z.enum(GAP_STATUSES),
  priority: z.enum(PRIORITIES),
  owner_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  subcategory_id: z.string().uuid().optional().nullable(),
});
export type GapInput = z.infer<typeof gapInputSchema>;

export const evidenceInputSchema = z.object({
  gap_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  size_bytes: z.number().int().positive().max(EVIDENCE_MAX_BYTES),
  mime_type: z.string().max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
});
export type EvidenceInput = z.infer<typeof evidenceInputSchema>;

export const activityInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(ACTIVITY_CATEGORIES),
  frequency: z.enum(FREQUENCIES),
  owner_id: z.string().uuid().optional().nullable(),
  start_date: z.string(),
});
export type ActivityInput = z.infer<typeof activityInputSchema>;

export const reportTypeSchema = z.enum([
  "open-gaps",
  "overdue",
  "executive-summary",
]);
export type ReportType = z.infer<typeof reportTypeSchema>;
