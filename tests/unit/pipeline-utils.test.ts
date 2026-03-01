import { describe, expect, it, vi } from "vitest";
import { buildStageLogMessages } from "@/lib/pipeline/log-generator";
import { calculateStats } from "@/lib/pipeline/stats-calculator";
import { runStageTicks } from "@/lib/pipeline/stage-runner";
import type { PipelineStageState } from "@/lib/types/domain";

describe("log-generator", () => {
  it("builds 4 deterministic messages from stage name", () => {
    const messages = buildStageLogMessages({ key: "intake", name: "Intake", description: "x" });
    expect(messages).toHaveLength(4);
    expect(messages[0]).toContain("Intake");
    expect(messages[3]).toContain("stage complete");
  });
});

describe("stats-calculator", () => {
  it("calculates complete stats with active stage and eta", () => {
    const stages: PipelineStageState[] = [
      { key: "intake", name: "Intake", description: "", progress: 100, status: "complete", startedAt: null, completedAt: null },
      { key: "planning", name: "Planning", description: "", progress: 50, status: "active", startedAt: null, completedAt: null },
      { key: "scaffolding", name: "Scaffolding", description: "", progress: 0, status: "pending", startedAt: null, completedAt: null }
    ];

    const stats = calculateStats(stages, 7, 3000);
    expect(stats.totalStages).toBe(3);
    expect(stats.completedStages).toBe(1);
    expect(stats.activeStage).toBe("Planning");
    expect(stats.percentComplete).toBe(50);
    expect(stats.etaSeconds).toBe(3);
    expect(stats.logsEmitted).toBe(7);
  });

  it("handles no active stage and clamps eta to non-negative", () => {
    const stages: PipelineStageState[] = [
      { key: "intake", name: "Intake", description: "", progress: 100, status: "complete", startedAt: null, completedAt: null }
    ];

    const stats = calculateStats(stages, 0, -1000);
    expect(stats.activeStage).toBeNull();
    expect(stats.etaSeconds).toBe(0);
  });
});

describe("stage-runner", () => {
  it("emits monotonic progress and done=true for final tick", async () => {
    vi.useFakeTimers();
    const ticks: Array<{ progress: number; done: boolean }> = [];

    const p = runStageTicks(async (tick) => {
      ticks.push(tick);
    });

    await vi.runAllTimersAsync();
    await p;

    expect(ticks.length).toBeGreaterThanOrEqual(3);
    expect(ticks[0]?.progress).toBeGreaterThan(0);
    expect(ticks[ticks.length - 1]?.progress).toBe(100);
    expect(ticks[ticks.length - 1]?.done).toBe(true);

    for (let i = 1; i < ticks.length; i += 1) {
      expect(ticks[i].progress).toBeGreaterThanOrEqual(ticks[i - 1].progress);
    }

    vi.useRealTimers();
  });
});
