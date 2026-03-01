import { describe, expect, it } from "vitest";
import { projectBriefSchema, startPipelineSchema } from "@/lib/validation/project-brief-schema";
import { lastEventIdSchema, projectIdParamSchema } from "@/lib/validation/common";

const validBrief = {
  contactName: "Test User",
  email: "test@example.com",
  company: "Acme",
  projectName: "Portal",
  targetUsers: "Internal and external stakeholders",
  goals: "Automate repetitive workflows",
  scope: "MVP with dashboard and submissions",
  constraints: "SOC2 and budget",
  timeline: "2-4 weeks",
  budgetRange: "$25k-$50k"
};

describe("project brief schema", () => {
  it("accepts a valid payload", () => {
    const parsed = projectBriefSchema.safeParse(validBrief);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const parsed = projectBriefSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const parsed = projectBriefSchema.safeParse({ ...validBrief, email: "bad-email" });
    expect(parsed.success).toBe(false);
  });

  it("enforces min length constraints", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      contactName: "A",
      targetUsers: "short",
      goals: "short",
      scope: "short",
      constraints: "1234",
      timeline: "x",
      budgetRange: "x"
    });
    expect(parsed.success).toBe(false);
  });
});

describe("startPipelineSchema", () => {
  it("accepts non-empty project id", () => {
    const parsed = startPipelineSchema.safeParse({ projectId: "p1" });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty project id", () => {
    const parsed = startPipelineSchema.safeParse({ projectId: "" });
    expect(parsed.success).toBe(false);
  });
});

describe("common validation schemas", () => {
  it("projectIdParamSchema rejects empty id", () => {
    const parsed = projectIdParamSchema.safeParse({ projectId: "" });
    expect(parsed.success).toBe(false);
  });

  it("lastEventIdSchema coerces valid numeric strings", () => {
    const parsed = lastEventIdSchema.safeParse({ lastEventId: "12" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.lastEventId).toBe(12);
    }
  });

  it("lastEventIdSchema rejects negative and decimal values", () => {
    expect(lastEventIdSchema.safeParse({ lastEventId: -1 }).success).toBe(false);
    expect(lastEventIdSchema.safeParse({ lastEventId: 1.5 }).success).toBe(false);
  });

  it("lastEventIdSchema allows undefined", () => {
    const parsed = lastEventIdSchema.safeParse({});
    expect(parsed.success).toBe(true);
  });
});
