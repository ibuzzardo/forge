import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/projects/[projectId]/events/route";
import { inMemoryStore } from "@/lib/store/in-memory-store";
import { eventBus } from "@/lib/store/event-bus";

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

afterEach(() => {
  vi.useRealTimers();
});

describe("sse route", () => {
  it("returns not found for missing project", async () => {
    const request = new Request("http://localhost/api/projects/x/events");
    const response = await GET(request, { params: { projectId: "missing" } });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "NOT_FOUND" }
    });
  });

  it("returns stream for existing project with SSE headers", async () => {
    const project = inMemoryStore.createProject(validBrief);
    const request = new Request(`http://localhost/api/projects/${project.id}/events`);
    const response = await GET(request, { params: { projectId: project.id } });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")?.includes("text/event-stream")).toBe(true);
    expect(response.headers.get("Cache-Control")).toContain("no-cache");

    inMemoryStore.deleteProject(project.id);
    eventBus.clearProject(project.id);
  });

  it("replays events after provided last-event-id", async () => {
    const project = inMemoryStore.createProject(validBrief);

    eventBus.publish(project.id, {
      type: "log",
      projectId: project.id,
      timestamp: new Date().toISOString(),
      payload: { msg: "first" }
    });
    eventBus.publish(project.id, {
      type: "log",
      projectId: project.id,
      timestamp: new Date().toISOString(),
      payload: { msg: "second" }
    });

    const request = new Request(`http://localhost/api/projects/${project.id}/events`, {
      headers: { "last-event-id": "1" }
    });

    const response = await GET(request, { params: { projectId: project.id } });
    const reader = response.body?.getReader();
    expect(reader).toBeTruthy();

    const chunk = await reader?.read();
    const decoded = new TextDecoder().decode(chunk?.value);
    expect(decoded).toContain("id: 2");
    expect(decoded).toContain("event: log");

    await reader?.cancel();
    inMemoryStore.deleteProject(project.id);
    eventBus.clearProject(project.id);
  });

  it("publishes heartbeat events on interval", async () => {
    vi.useFakeTimers();
    const project = inMemoryStore.createProject(validBrief);

    const controller = new AbortController();
    const request = new Request(`http://localhost/api/projects/${project.id}/events`, { signal: controller.signal });
    const response = await GET(request, { params: { projectId: project.id } });
    const reader = response.body?.getReader();

    vi.advanceTimersByTime(15000);
    const chunk = await reader?.read();
    const decoded = new TextDecoder().decode(chunk?.value);
    expect(decoded).toContain("event: heartbeat");

    controller.abort();
    await reader?.cancel();
    inMemoryStore.deleteProject(project.id);
    eventBus.clearProject(project.id);
  });
});
