import type { PipelineStageState, PipelineStats } from "@/lib/types/domain";

export function calculateStats(stages: PipelineStageState[], logsEmitted: number, stageDurationMs: number): PipelineStats {
  const totalStages = stages.length;
  const completedStages = stages.filter((stage) => stage.status === "complete").length;
  const active = stages.find((stage) => stage.status === "active")?.name ?? null;
  const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0);
  const percentComplete = Math.round(totalProgress / totalStages);
  const remainingStages = totalStages - completedStages - (active ? 1 : 0);
  const etaSeconds = Math.max(0, Math.round((remainingStages * stageDurationMs) / 1000));

  return {
    totalStages,
    completedStages,
    activeStage: active,
    percentComplete,
    etaSeconds,
    logsEmitted
  };
}
