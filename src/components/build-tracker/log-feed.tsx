import { componentClasses } from "@/lib/constants/design-tokens";
import type { PipelineLogEvent } from "@/lib/types/domain";

interface LogFeedProps {
  logs: PipelineLogEvent[];
}

export function LogFeed({ logs }: LogFeedProps): JSX.Element {
  return (
    <div className={componentClasses.logFeed}>
      {logs.length === 0 ? <p className="text-slate-400">Waiting for logs...</p> : null}
      {logs.map((log) => (
        <p key={log.id}>[{new Date(log.timestamp).toLocaleTimeString()}] {log.message}</p>
      ))}
    </div>
  );
}
