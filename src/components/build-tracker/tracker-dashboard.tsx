"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/build-tracker/stat-card";
import { PipelineStageList } from "@/components/build-tracker/pipeline-stage-list";
import { LogFeed } from "@/components/build-tracker/log-feed";
import { Progress } from "@/components/ui/progress";
import { useSse } from "@/hooks/use-sse";
import { usePipelineState } from "@/hooks/use-pipeline-state";
import { startProjectPipeline } from "@/lib/api/client";
import type { ProjectRecord } from "@/lib/types/domain";

export function TrackerDashboard({ project }: { project: ProjectRecord }): JSX.Element {
  const { state, applyEvent } = usePipelineState(project.stages);
  const [starting, setStarting] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>(project.status);

  const handleEvent = useCallback(applyEvent, [applyEvent]);
  useSse(project.id, handleEvent);

  useEffect(() => {
    setStatusText(state.status);
  }, [state.status]);

  const handleStart = async (): Promise<void> => {
    try {
      setStarting(true);
      await startProjectPipeline(project.id);
    } catch (error) {
      setStatusText("failed");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0b1020_0%,_#0a0f1a_55%,_#070b14_100%)] text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Build Tracker</h1>
            <p className="text-sm text-slate-300">Live 6-stage pipeline execution</p>
          </div>
          <div className="flex gap-2">
            <Badge>{statusText}</Badge>
            <Button onClick={handleStart} disabled={starting || statusText === "running" || statusText === "complete"}>
              {starting ? "Starting..." : "Start Pipeline"}
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Completed" value={state.stats?.completedStages ?? 0} />
          <StatCard label="Percent" value={`${state.stats?.percentComplete ?? 0}%`} />
          <StatCard label="ETA" value={`${state.stats?.etaSeconds ?? 0}s`} />
          <StatCard label="Logs" value={state.stats?.logsEmitted ?? state.logs.length} />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl md:p-6">
            <PipelineStageList stages={state.stages} />
            <Progress value={state.stats?.percentComplete ?? 0} />
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-xl md:p-4">
            <LogFeed logs={state.logs} />
          </div>
        </section>
      </main>
    </div>
  );
}
