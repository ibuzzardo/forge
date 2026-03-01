import { eventBus } from "@/lib/store/event-bus";
import { inMemoryStore } from "@/lib/store/in-memory-store";
import { PIPELINE_STAGES, PIPELINE_DEFAULTS } from "@/lib/constants/pipeline";
import { buildStageLogMessages } from "@/lib/pipeline/log-generator";
import { calculateStats } from "@/lib/pipeline/stats-calculator";
import { runStageTicks } from "@/lib/pipeline/stage-runner";
import type { PipelineLogEvent, ProjectRecord } from "@/lib/types/domain";

const runningProjects = new Set<string>();

function publishSnapshot(project: ProjectRecord): void {
  eventBus.publish(project.id, {
    type: "snapshot",
    projectId: project.id,
    timestamp: new Date().toISOString(),
    payload: {
      status: project.status,
      stages: project.stages,
      stats: project.stats
    }
  });
}

function pushLog(project: ProjectRecord, level: PipelineLogEvent["level"], message: string): void {
  const eventId = project.logs.length + 1;
  const log: PipelineLogEvent = {
    id: eventId,
    level,
    message,
    timestamp: new Date().toISOString(),
    projectId: project.id
  };
  project.logs.push(log);
  eventBus.publish(project.id, {
    type: "log",
    projectId: project.id,
    timestamp: log.timestamp,
    payload: log
  });
}

export async function startPipeline(projectId: string): Promise<{ started: boolean; reason?: string }> {
  try {
    const project = inMemoryStore.getProject(projectId);
    if (!project) {
      return { started: false, reason: "Project not found" };
    }
    if (runningProjects.has(projectId)) {
      return { started: false, reason: "Pipeline already running" };
    }

    runningProjects.add(projectId);
    project.status = "running";
    inMemoryStore.upsertProject(project);
    publishSnapshot(project);

    for (let index = 0; index < PIPELINE_STAGES.length; index += 1) {
      const stage = project.stages[index];
      if (!stage) continue;

      stage.status = "active";
      stage.startedAt = new Date().toISOString();
      inMemoryStore.upsertProject(project);
      eventBus.publish(project.id, {
        type: "stage",
        projectId: project.id,
        timestamp: new Date().toISOString(),
        payload: { stage }
      });

      const messages = buildStageLogMessages(stage);
      pushLog(project, "info", messages[0] ?? `${stage.name}: started`);

      await runStageTicks(async (tick) => {
        try {
          stage.progress = tick.progress;
          if (tick.progress >= 35 && tick.progress <= 45) {
            pushLog(project, "info", messages[1] ?? `${stage.name}: processing`);
          }
          if (tick.progress >= 70 && tick.progress <= 80) {
            pushLog(project, "info", messages[2] ?? `${stage.name}: checking`);
          }

          project.stats = calculateStats(project.stages, project.logs.length, PIPELINE_DEFAULTS.maxMs);
          inMemoryStore.upsertProject(project);
          eventBus.publish(project.id, {
            type: "stats",
            projectId: project.id,
            timestamp: new Date().toISOString(),
            payload: project.stats
          });

          if (tick.done) {
            stage.status = "complete";
            stage.progress = 100;
            stage.completedAt = new Date().toISOString();
            pushLog(project, "info", messages[3] ?? `${stage.name}: complete`);
            eventBus.publish(project.id, {
              type: "stage",
              projectId: project.id,
              timestamp: new Date().toISOString(),
              payload: { stage }
            });
          }
        } catch (error) {
          throw error;
        }
      });
    }

    project.status = "complete";
    project.stats = calculateStats(project.stages, project.logs.length, PIPELINE_DEFAULTS.maxMs);
    inMemoryStore.upsertProject(project);
    publishSnapshot(project);
    return { started: true };
  } catch (error) {
    const project = inMemoryStore.getProject(projectId);
    if (project) {
      project.status = "failed";
      pushLog(project, "error", "Pipeline failed unexpectedly");
      inMemoryStore.upsertProject(project);
      publishSnapshot(project);
    }
    return { started: false, reason: "Pipeline execution failed" };
  } finally {
    runningProjects.delete(projectId);
  }
}
