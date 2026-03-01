import { PIPELINE_DEFAULTS } from "@/lib/constants/pipeline";

export interface StageTick {
  progress: number;
  done: boolean;
}

export async function runStageTicks(onTick: (tick: StageTick) => Promise<void>): Promise<void> {
  try {
    const duration =
      PIPELINE_DEFAULTS.minMs +
      Math.floor(Math.random() * Math.max(1, PIPELINE_DEFAULTS.maxMs - PIPELINE_DEFAULTS.minMs));
    const steps = Math.max(3, Math.floor(duration / PIPELINE_DEFAULTS.tickMs));

    for (let i = 1; i <= steps; i += 1) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), PIPELINE_DEFAULTS.tickMs);
      });
      const progress = Math.min(100, Math.round((i / steps) * 100));
      await onTick({ progress, done: i === steps });
    }
  } catch (error) {
    throw error;
  }
}
