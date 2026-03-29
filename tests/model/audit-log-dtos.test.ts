import { describe, expect, test } from "vitest";

import {
  AuditLogEntriesDeleteRequestSchema,
  AuditLogEntriesSchema,
  AuditLogEntrySchema,
} from "@/model/audit-log-dtos";
import dayjs from "@/utils/dayjs";

describe("AuditLogEntrySchema", () => {
  test("parses a valid entry", () => {
    const entry = AuditLogEntrySchema.parse({
      id: 1,
      createdAt: "2025-06-15T10:00:00Z",
      application: "ycc-app",
      principal: "JDOE",
      description: "Updated a task",
      data: '{"taskId": 42}',
    });

    expect(entry).toEqual({
      id: 1,
      createdAt: dayjs("2025-06-15T10:00:00Z"),
      application: "ycc-app",
      principal: "JDOE",
      description: "Updated a task",
      data: '{"taskId": 42}',
    });
  });

  test("accepts null data", () => {
    const entry = AuditLogEntrySchema.parse({
      id: 1,
      createdAt: "2025-06-15T10:00:00Z",
      application: "ycc-app",
      principal: "JDOE",
      description: "Logged in",
      data: null,
    });

    expect(entry.data).toBeNull();
  });

  test("rejects missing fields", () => {
    expect(() => AuditLogEntrySchema.parse({})).toThrow();
  });
});

describe("AuditLogEntriesSchema", () => {
  test("parses an array of entries", () => {
    const entries = AuditLogEntriesSchema.parse([
      {
        id: 1,
        createdAt: "2025-06-15T10:00:00Z",
        application: "ycc-app",
        principal: "JDOE",
        description: "Action 1",
        data: null,
      },
      {
        id: 2,
        createdAt: "2025-06-16T10:00:00Z",
        application: "ycc-app",
        principal: "ASMITH",
        description: "Action 2",
        data: "{}",
      },
    ]);

    expect(entries).toHaveLength(2);
  });

  test("parses empty array", () => {
    expect(AuditLogEntriesSchema.parse([])).toEqual([]);
  });
});

describe("AuditLogEntriesDeleteRequestSchema", () => {
  test("parses valid delete request", () => {
    const req = AuditLogEntriesDeleteRequestSchema.parse({
      cutoffDate: "2025-01-01",
    });

    expect(req.cutoffDate).toBe("2025-01-01");
  });

  test("rejects missing cutoffDate", () => {
    expect(() => AuditLogEntriesDeleteRequestSchema.parse({})).toThrow();
  });
});
