import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProject, openProjectEvents, startProjectPipeline } from "@/lib/api/client";

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  emit(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }

  close(): void {}
}

describe("api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("createProject posts payload and returns data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: "p1", status: "idle" } })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createProject({
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
    });

    expect(result).toEqual({ id: "p1", status: "idle" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/projects",
      expect.objectContaining({ method: "POST", cache: "no-store" })
    );
  });

  it("startProjectPipeline throws when request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false })
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(startProjectPipeline("p1")).rejects.toThrow("Request failed");
  });

  it("openProjectEvents wires EventSource messages", () => {
    vi.stubGlobal("EventSource", MockEventSource as never);
    const events: unknown[] = [];

    const source = openProjectEvents("project-1", (event) => events.push(event));
    expect((source as unknown as MockEventSource).url).toBe("/api/projects/project-1/events");

    (source as unknown as MockEventSource).emit({ id: 1, type: "heartbeat", projectId: "project-1", timestamp: "t", payload: {} });
    expect(events).toHaveLength(1);
  });
});
