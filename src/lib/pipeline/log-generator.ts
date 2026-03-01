import type { PipelineStageDefinition } from "@/lib/types/domain";

export function buildStageLogMessages(stage: PipelineStageDefinition): string[] {
  return [
    `${stage.name}: initializing execution context`,
    `${stage.name}: processing inputs`,
    `${stage.name}: running quality checks`,
    `${stage.name}: stage complete`
  ];
}
