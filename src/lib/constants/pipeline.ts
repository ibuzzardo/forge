import type { PipelineStageDefinition } from "@/lib/types/domain";

export const PIPELINE_STAGES: PipelineStageDefinition[] = [
  { key: "intake", name: "Intake", description: "Validating brief and requirements." },
  { key: "planning", name: "Planning", description: "Generating architecture and work plan." },
  { key: "scaffolding", name: "Scaffolding", description: "Preparing project structure." },
  { key: "implementation", name: "Implementation", description: "Building core features." },
  { key: "verification", name: "Verification", description: "Running checks and quality gates." },
  { key: "delivery", name: "Delivery", description: "Packaging output and handoff." }
];

export const PIPELINE_DEFAULTS = {
  minMs: Number(process.env.PIPELINE_STAGE_MIN_MS ?? 2500),
  maxMs: Number(process.env.PIPELINE_STAGE_MAX_MS ?? 5500),
  tickMs: Number(process.env.PIPELINE_TICK_MS ?? 600)
} as const;
