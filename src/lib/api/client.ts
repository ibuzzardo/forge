import type { ApiSuccessResponse, PipelineEvent, ProjectRecord } from "@/lib/types/domain";
import type { ProjectBriefInput } from "@/lib/validation/project-brief-schema";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      cache: "no-store"
    });

    const payload = (await response.json()) as T;
    if (!response.ok) {
      throw new Error("Request failed");
    }
    return payload;
  } catch (error) {
    throw error;
  }
}

export async function createProject(brief: ProjectBriefInput): Promise<ProjectRecord> {
  try {
    const result = await requestJson<ApiSuccessResponse<ProjectRecord>>("/api/projects", {
      method: "POST",
      body: JSON.stringify(brief)
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

export async function startProjectPipeline(projectId: string): Promise<void> {
  try {
    await requestJson(`/api/projects/${projectId}/pipeline/start`, { method: "POST", body: JSON.stringify({ projectId }) });
  } catch (error) {
    throw error;
  }
}

export function openProjectEvents(projectId: string, onEvent: (event: PipelineEvent) => void): EventSource {
  const source = new EventSource(`/api/projects/${projectId}/events`);
  source.onmessage = (message): void => {
    const parsed = JSON.parse(message.data) as PipelineEvent;
    onEvent(parsed);
  };
  return source;
}
