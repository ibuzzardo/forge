import { randomUUID } from "crypto";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline";
import type { PipelineStageState, PipelineStats, ProjectBrief, ProjectRecord } from "@/lib/types/domain";

const projectTtlMs = Number(process.env.PROJECT_TTL_MS ?? 3600000);

function newStats(): PipelineStats {
  return {
    totalStages: PIPELINE_STAGES.length,
    completedStages: 0,
    activeStage: null,
    percentComplete: 0,
    etaSeconds: 0,
    logsEmitted: 0
  };
}

function newStages(): PipelineStageState[] {
  return PIPELINE_STAGES.map((stage) => ({
    ...stage,
    progress: 0,
    status: "pending",
    startedAt: null,
    completedAt: null
  }));
}

class InMemoryStore {
  private projects = new Map<string, ProjectRecord>();

  createProject(brief: ProjectBrief): ProjectRecord {
    const now = new Date().toISOString();
    const record: ProjectRecord = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      brief,
      status: "idle",
      stages: newStages(),
      logs: [],
      stats: newStats()
    };
    this.projects.set(record.id, record);
    return record;
  }

  getProject(projectId: string): ProjectRecord | null {
    const project = this.projects.get(projectId);
    if (!project) return null;
    return project;
  }

  upsertProject(project: ProjectRecord): void {
    project.updatedAt = new Date().toISOString();
    this.projects.set(project.id, project);
  }

  deleteProject(projectId: string): void {
    this.projects.delete(projectId);
  }

  cleanup(): void {
    const now = Date.now();
    for (const project of this.projects.values()) {
      const age = now - new Date(project.updatedAt).getTime();
      if (age > projectTtlMs) {
        this.projects.delete(project.id);
      }
    }
  }
}

export const inMemoryStore = new InMemoryStore();
