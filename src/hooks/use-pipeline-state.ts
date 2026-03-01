"use client";

import { useCallback, useState } from "react";
import type { PipelineEvent, PipelineLogEvent, PipelineStageState, PipelineStats } from "@/lib/types/domain";

interface PipelineViewState {
  stages: PipelineStageState[];
  stats: PipelineStats | null;
  logs: PipelineLogEvent[];
  status: string;
}

export function usePipelineState(initialStages: PipelineStageState[]): {
  state: PipelineViewState;
  applyEvent: (event: PipelineEvent) => void;
} {
  const [state, setState] = useState<PipelineViewState>({
    stages: initialStages,
    stats: null,
    logs: [],
    status: "idle"
  });

  const applyEvent = useCallback((event: PipelineEvent): void => {
    setState((current) => {
      if (event.type === "snapshot") {
        const payload = event.payload as { status: string; stages: PipelineStageState[]; stats: PipelineStats };
        return { ...current, status: payload.status, stages: payload.stages, stats: payload.stats };
      }
      if (event.type === "stage") {
        const payload = event.payload as { stage: PipelineStageState };
        return {
          ...current,
          stages: current.stages.map((stage) => (stage.key === payload.stage.key ? payload.stage : stage))
        };
      }
      if (event.type === "log") {
        const payload = event.payload as PipelineLogEvent;
        return { ...current, logs: [...current.logs, payload] };
      }
      if (event.type === "stats") {
        return { ...current, stats: event.payload as PipelineStats };
      }
      return current;
    });
  }, []);

  return { state, applyEvent };
}
