import { z } from "zod";

import { zodTransformDate } from "./dtos";

export const AuditLogEntrySchema = z.object({
  id: z.number(),
  createdAt: z.unknown().transform(zodTransformDate),
  application: z.string(),
  principal: z.string(),
  description: z.string(),
  data: z.string().nullable(),
});
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

export const AuditLogEntriesSchema = z.array(AuditLogEntrySchema);
export type AuditLogEntries = z.infer<typeof AuditLogEntriesSchema>;

export const AuditLogEntriesDeleteRequestSchema = z.object({
  cutoffDate: z.string(), // YYYY-MM-DD
});
export type AuditLogEntriesDeleteRequest = z.infer<
  typeof AuditLogEntriesDeleteRequestSchema
>;
