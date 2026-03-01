export type PipelineStageKey =
  | "intake"
  | "planning"
  | "scaffolding"
  | "implementation"
  | "verification"
  | "delivery";

export type PipelineStatus = "idle" | "running" | "complete" | "failed";

export interface ProjectBrief {
  contactName: string;
  email: string;
  company: string;
  projectName: string;
  targetUsers: string;
  goals: string;
  scope: string;
  constraints: string;
  timeline: string;
  budgetRange: string;
}

export interface PipelineStageDefinition {
  key: PipelineStageKey;
  name: string;
  description: string;
}

export interface PipelineStageState extends PipelineStageDefinition {
  progress: number;
  status: "pending" | "active" | "complete" | "failed";
  startedAt: string | null;
  completedAt: string | null;
}

export interface PipelineStats {
  totalStages: number;
  completedStages: number;
  activeStage: string | null;
  percentComplete: number;
  etaSeconds: number;
  logsEmitted: number;
}

export interface ProjectRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  brief: ProjectBrief;
  status: PipelineStatus;
  stages: PipelineStageState[];
  logs: PipelineLogEvent[];
  stats: PipelineStats;
}

export interface PipelineLogEvent {
  id: number;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  projectId: string;
}

export interface PipelineEvent {
  id: number;
  type: "snapshot" | "stage" | "log" | "stats" | "heartbeat";
  projectId: string;
  timestamp: string;
  payload: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}
