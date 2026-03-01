"use client";

import { useEffect, useRef } from "react";
import type { PipelineEvent } from "@/lib/types/domain";

export function useSse(projectId: string, onEvent: (event: PipelineEvent) => void): void {
  const retryRef = useRef<number>(1000);

  useEffect(() => {
    let source: EventSource | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const connect = (): void => {
      source = new EventSource(`/api/projects/${projectId}/events`);

      source.onmessage = (message): void => {
        const parsed = JSON.parse(message.data) as PipelineEvent;
        onEvent(parsed);
        retryRef.current = 1000;
      };

      source.onerror = (): void => {
        source?.close();
        timeoutId = setTimeout(() => {
          retryRef.current = Math.min(5000, retryRef.current * 2);
          connect();
        }, retryRef.current);
      };
    };

    connect();

    return (): void => {
      source?.close();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onEvent, projectId]);
}
