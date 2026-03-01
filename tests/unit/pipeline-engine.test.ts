import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/pipeline/stage-runner", () => ({
  runStageTicks: vi.fn(async (onTick: (tick: { progress: number; done: boolean }) => Promise<void>) => {
    await onTick({ progress: 50, done: false });
    await onTick({ progress: 100, done: true });
  })
}));

import { eventBus } from "@/lib/store/event-bus";
import { inMemoryStore } from "@/lib/store/in-memory-store";
import { startPipeline } from "@/lib/pipeline/simulation-engine";

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

describe("pipeline engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not started for missing project", async () => {
    const result = await startPipeline("missing-project");
    expect(result).toEqual({ started: false, reason: "Project not found" });
  });

  it("starts pipeline for valid project and emits events", async () => {
    const project = inMemoryStore.createProject(validBrief);

    const result = await startPipeline(project.id);
    expect(result.started).toBe(true);

    const events = eventBus.replayFrom(project.id, 0);
    expect(events.length).toBeGreaterThan(0);
    expect(events.some((event) => event.type === "snapshot")).toBe(true);
    expect(events.some((event) => event.type === "stage")).toBe(true);
    expect(events.some((event) => event.type === "stats")).toBe(true);

    const reloaded = inMemoryStore.getProject(project.id);
    expect(reloaded).not.toBeNull();
    expect(reloaded?.logs.length).toBeGreaterThan(0);

    inMemoryStore.deleteProject(project.id);
    eventBus.clearProject(project.id);
  });
});
