"use client";

import { useEffect, useRef } from "react";
import type { PipelineEvent } from "@/lib/types/domain";

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 5000;

export interface SseHookError {
  kind: "parse" | "connection";
  status: number;
  message: string;
  projectId: string;
  lastEventId?: string;
  rawData?: string;
  cause?: unknown;
}

interface EventWithOptionalId {
  id?: string | number;
  eventId?: string | number;
  payload?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringId(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function extractEventId(event: unknown): string | undefined {
  if (!isRecord(event)) {
    return undefined;
  }

  const root = event as EventWithOptionalId;
  const rootId = toStringId(root.id) ?? toStringId(root.eventId);
  if (rootId) {
    return rootId;
  }

  if (!isRecord(root.payload)) {
    return undefined;
  }

  return toStringId(root.payload.id) ?? toStringId(root.payload.eventId);
}

function buildEventsUrl(projectId: string, lastEventId?: string): string {
  const url = new URL(`/api/projects/${projectId}/events`, window.location.origin);

  if (lastEventId) {
    // Replay invariant: carry forward the most recently processed event id.
    url.searchParams.set("lastEventId", lastEventId);
  }

  return `${url.pathname}${url.search}`;
}

export function useSse(
  projectId: string,
  onEvent: (event: PipelineEvent) => void,
  onError?: (error: SseHookError) => void
): void {
  const retryRef = useRef<number>(INITIAL_RETRY_MS);
  const lastEventIdRef = useRef<string | undefined>(undefined);

  useEffect((): void => {
    retryRef.current = INITIAL_RETRY_MS;
    lastEventIdRef.current = undefined;
  }, [projectId]);

  useEffect(() => {
    let source: EventSource | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const reportError = (error: SseHookError): void => {
      if (onError) {
        onError(error);
        return;
      }

      console.error(`[useSse] ${error.message}`, {
        projectId: error.projectId,
        status: error.status,
        kind: error.kind,
        lastEventId: error.lastEventId,
        cause: error.cause
      });
    };

    const clearConnection = (): void => {
      if (source) {
        source.close();
        source = null;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const connect = (): void => {
      if (disposed) {
        return;
      }

      source = new EventSource(buildEventsUrl(projectId, lastEventIdRef.current));

      source.onmessage = (message: MessageEvent<string>): void => {
        try {
          const parsed = JSON.parse(message.data) as PipelineEvent;
          const fallbackId = extractEventId(parsed);
          const resolvedId = message.lastEventId || fallbackId;

          if (resolvedId) {
            lastEventIdRef.current = resolvedId;
          }

          onEvent(parsed);
          retryRef.current = INITIAL_RETRY_MS;
        } catch (cause: unknown) {
          reportError({
            kind: "parse",
            status: 400,
            message: "Failed to parse SSE payload as JSON.",
            projectId,
            lastEventId: lastEventIdRef.current,
            rawData: message.data,
            cause
          });
        }
      };

      source.onerror = (): void => {
        clearConnection();

        if (disposed) {
          return;
        }

        const retryInMs = retryRef.current;

        reportError({
          kind: "connection",
          status: 503,
          message: `SSE connection dropped. Retrying in ${retryInMs}ms.`,
          projectId,
          lastEventId: lastEventIdRef.current
        });

        timeoutId = setTimeout((): void => {
          retryRef.current = Math.min(MAX_RETRY_MS, retryRef.current * 2);
          connect();
        }, retryInMs);
      };
    };

    connect();

    return (): void => {
      disposed = true;
      clearConnection();
    };
  }, [onEvent, onError, projectId]);
}
