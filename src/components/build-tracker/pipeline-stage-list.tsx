import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PipelineStageState } from "@/lib/types/domain";

interface PipelineStageListProps {
  stages: PipelineStageState[];
}

export function PipelineStageList({ stages }: PipelineStageListProps): JSX.Element {
  return (
    <div className="grid gap-3 md:grid-cols-6">
      {stages.map((stage) => (
        <article
          key={stage.key}
          data-status={stage.status}
          className="group rounded-xl border border-slate-700/60 bg-slate-900/50 p-3 transition-all duration-300 data-[status=active]:ring-2 data-[status=active]:ring-blue-300/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{stage.name}</span>
            <Badge variant={stage.status === "complete" ? "secondary" : stage.status === "failed" ? "destructive" : "default"}>
              {stage.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-300">{stage.description}</p>
          <Progress value={stage.progress} className="mt-3" />
        </article>
      ))}
    </div>
  );
}
