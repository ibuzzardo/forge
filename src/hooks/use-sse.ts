"use client";

import { useEffect, useRef } from "react";
import type { PipelineEvent } from "@/lib/types/domain";

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 5000;

function getEventIdFromPayload(event: PipelineEvent): string | null {
  if (typeof event !== "object" || event === null) {
    return null;
  }

  const candidate = event as { id?: unknown };
  return typeof candidate.id === "string" && candidate.id.length > 0 ? candidate.id : null;
}

export function useSse(projectId: string, onEvent: (event: PipelineEvent) => void): void {
  const retryRef = useRef<number>(INITIAL_RETRY_MS);
  const lastEventIdRef = useRef<string | null>(null);
  const onEventRef = useRef<(event: PipelineEvent) => void>(onEvent);

  useEffect((): void => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect((): (() => void) => {
    let source: EventSource | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    retryRef.current = INITIAL_RETRY_MS;
    lastEventIdRef.current = null;

    const clearReconnect = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const buildStreamUrl = (): string => {
      const params = new URLSearchParams();
      if (lastEventIdRef.current) {
        params.set("lastEventId", lastEventIdRef.current);
      }

      const query = params.toString();
      return query.length > 0
        ? `/api/projects/${projectId}/events?${query}`
        : `/api/projects/${projectId}/events`;
    };

    const connect = (): void => {
      if (disposed) {
        return;
      }

      clearReconnect();
      source?.close();

      try {
        source = new EventSource(buildStreamUrl());
      } catch (error) {
        const delay = retryRef.current;
        timeoutId = setTimeout((): void => {
          retryRef.current = Math.min(MAX_RETRY_MS, delay * 2);
          connect();
        }, delay);
        return;
      }

      source.onmessage = (message: MessageEvent<string>): void => {
        try {
          const parsed = JSON.parse(message.data) as PipelineEvent;

          if (typeof message.lastEventId === "string" && message.lastEventId.length > 0) {
            lastEventIdRef.current = message.lastEventId;
          } else {
            const parsedEventId = getEventIdFromPayload(parsed);
            if (parsedEventId) {
              lastEventIdRef.current = parsedEventId;
            }
          }

          onEventRef.current(parsed);
          retryRef.current = INITIAL_RETRY_MS;
        } catch {
          // Ignore malformed payloads and keep stream alive.
        }
      };

      source.onerror = (): void => {
        source?.close();

        const delay = retryRef.current;
        timeoutId = setTimeout((): void => {
          if (disposed) {
            return;
          }

          retryRef.current = Math.min(MAX_RETRY_MS, delay * 2);
          connect();
        }, delay);
      };
    };

    connect();

    return (): void => {
      disposed = true;
      clearReconnect();
      source?.close();
    };
  }, [projectId]);
}
