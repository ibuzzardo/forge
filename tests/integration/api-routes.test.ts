import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/pipeline/simulation-engine", () => ({
  startPipeline: vi.fn()
}));

import { POST as createProjectRoute } from "@/app/api/projects/route";
import { GET as getProjectRoute } from "@/app/api/projects/[projectId]/route";
import { GET as getStatsRoute } from "@/app/api/projects/[projectId]/stats/route";
import { POST as startPipelineRoute } from "@/app/api/projects/[projectId]/pipeline/start/route";
import { inMemoryStore } from "@/lib/store/in-memory-store";
import { startPipeline } from "@/lib/pipeline/simulation-engine";

const startPipelineMock = vi.mocked(startPipeline);

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

describe("api routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/projects returns 400 for invalid payload", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({})
    });

    const response = await createProjectRoute(request as never);
    expect(response.status).toBe(400);
  });

  it("POST /api/projects returns 201 for valid payload", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify(validBrief)
    });

    const response = await createProjectRoute(request as never);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeTruthy();

    inMemoryStore.deleteProject(body.data.id);
  });

  it("GET /api/projects/[id] returns 404 when missing", async () => {
    const response = await getProjectRoute(new Request("http://localhost") as never, { params: { projectId: "missing" } });
    expect(response.status).toBe(404);
  });

  it("GET /api/projects/[id] returns project when found", async () => {
    const project = inMemoryStore.createProject(validBrief);
    const response = await getProjectRoute(new Request("http://localhost") as never, { params: { projectId: project.id } });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(project.id);

    inMemoryStore.deleteProject(project.id);
  });

  it("GET /api/projects/[id]/stats returns 404 when missing", async () => {
    const response = await getStatsRoute(new Request("http://localhost") as never, { params: { projectId: "missing" } });
    expect(response.status).toBe(404);
  });

  it("GET /api/projects/[id]/stats returns stats when found", async () => {
    const project = inMemoryStore.createProject(validBrief);
    const response = await getStatsRoute(new Request("http://localhost") as never, { params: { projectId: project.id } });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.totalStages).toBe(6);

    inMemoryStore.deleteProject(project.id);
  });

  it("POST pipeline start validates body and route param consistency", async () => {
    const project = inMemoryStore.createProject(validBrief);

    const mismatchRequest = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ projectId: "other" })
    });

    const mismatchResponse = await startPipelineRoute(mismatchRequest as never, { params: { projectId: project.id } });
    expect(mismatchResponse.status).toBe(409);

    const invalidRequest = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ projectId: "" })
    });

    const invalidResponse = await startPipelineRoute(invalidRequest as never, { params: { projectId: project.id } });
    expect(invalidResponse.status).toBe(400);

    inMemoryStore.deleteProject(project.id);
  });

  it("POST pipeline start returns 404 when project missing", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ projectId: "missing" })
    });

    const response = await startPipelineRoute(request as never, { params: { projectId: "missing" } });
    expect(response.status).toBe(404);
  });

  it("POST pipeline start returns 409 when engine does not start", async () => {
    const project = inMemoryStore.createProject(validBrief);
    startPipelineMock.mockResolvedValueOnce({ started: false, reason: "Pipeline already running" });

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ projectId: project.id })
    });

    const response = await startPipelineRoute(request as never, { params: { projectId: project.id } });
    expect(response.status).toBe(409);

    inMemoryStore.deleteProject(project.id);
  });

  it("POST pipeline start returns 200 when engine starts", async () => {
    const project = inMemoryStore.createProject(validBrief);
    startPipelineMock.mockResolvedValueOnce({ started: true });

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ projectId: project.id })
    });

    const response = await startPipelineRoute(request as never, { params: { projectId: project.id } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: { started: true } });

    inMemoryStore.deleteProject(project.id);
  });
});
