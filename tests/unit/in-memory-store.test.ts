import { describe, expect, it } from "vitest";
import { inMemoryStore } from "@/lib/store/in-memory-store";

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

describe("inMemoryStore", () => {
  it("creates project with initialized stages and stats", () => {
    const project = inMemoryStore.createProject(validBrief);

    expect(project.id).toBeTruthy();
    expect(project.status).toBe("idle");
    expect(project.stages.length).toBe(6);
    expect(project.stages.every((stage) => stage.status === "pending")).toBe(true);
    expect(project.stats.totalStages).toBe(6);
    expect(project.stats.completedStages).toBe(0);
    expect(project.stats.percentComplete).toBe(0);

    inMemoryStore.deleteProject(project.id);
  });

  it("getProject returns null for missing project", () => {
    expect(inMemoryStore.getProject("missing-project")).toBeNull();
  });

  it("upsertProject updates timestamp and persists changes", async () => {
    const project = inMemoryStore.createProject(validBrief);
    const before = project.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 2));
    project.status = "running";
    inMemoryStore.upsertProject(project);

    const loaded = inMemoryStore.getProject(project.id);
    expect(loaded?.status).toBe("running");
    expect(new Date(loaded?.updatedAt ?? 0).getTime()).toBeGreaterThan(new Date(before).getTime());

    inMemoryStore.deleteProject(project.id);
  });

  it("deleteProject removes project", () => {
    const project = inMemoryStore.createProject(validBrief);
    inMemoryStore.deleteProject(project.id);
    expect(inMemoryStore.getProject(project.id)).toBeNull();
  });

  it("cleanup removes stale projects", () => {
    const project = inMemoryStore.createProject(validBrief);
    project.updatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    inMemoryStore.upsertProject(project);

    inMemoryStore.cleanup();
    expect(inMemoryStore.getProject(project.id)).toBeNull();
  });
});
