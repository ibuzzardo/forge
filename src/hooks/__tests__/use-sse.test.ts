import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSse } from "@/hooks/use-sse";
import type { PipelineEvent } from "@/lib/types/domain";

class MockEventSource {
  static instances: MockEventSource[] = [];
  static throwOnNext = false;

  public readonly url: string;
  public onmessage: ((event: MessageEvent<string>) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public closed = false;

  constructor(url: string) {
    if (MockEventSource.throwOnNext) {
      MockEventSource.throwOnNext = false;
      throw new Error("EventSource init failed");
    }

    this.url = url;
    MockEventSource.instances.push(this);
  }

  close(): void {
    this.closed = true;
  }

  emitMessage(data: unknown, lastEventId = ""): void {
    const event = { data: JSON.stringify(data), lastEventId } as MessageEvent<string>;
    this.onmessage?.(event);
  }

  emitRawMessage(rawData: string, lastEventId = ""): void {
    const event = { data: rawData, lastEventId } as MessageEvent<string>;
    this.onmessage?.(event);
  }

  emitError(): void {
    this.onerror?.(new Event("error"));
  }
}

describe("useSse", () => {
  beforeEach((): void => {
    vi.useFakeTimers();
    MockEventSource.instances = [];
    MockEventSource.throwOnNext = false;
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
  });

  afterEach((): void => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("opens an initial SSE connection for the project", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    renderHook(() => useSse("project-1", onEvent));

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0]?.url).toBe("/api/projects/project-1/events");
  });

  it("parses incoming messages and forwards events", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    renderHook(() => useSse("project-1", onEvent));

    const source = MockEventSource.instances[0];
    const event = {
      type: "stats",
      payload: {
        tokensUsed: 10,
        durationMs: 100
      }
    } as unknown as PipelineEvent;

    act((): void => {
      source?.emitMessage(event, "evt-1");
    });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(event);
  });

  it("ignores malformed JSON payloads without crashing", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    renderHook(() => useSse("project-1", onEvent));

    const source = MockEventSource.instances[0];

    act((): void => {
      source?.emitRawMessage("not-json");
    });

    expect(onEvent).not.toHaveBeenCalled();
  });

  it("reconnects with message lastEventId after stream error", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    renderHook(() => useSse("project-1", onEvent));

    const firstSource = MockEventSource.instances[0];

    act((): void => {
      firstSource?.emitMessage(
        { type: "log", payload: { message: "ok" } } as unknown as PipelineEvent,
        "evt-42"
      );
      firstSource?.emitError();
    });

    act((): void => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockEventSource.instances).toHaveLength(2);
    expect(MockEventSource.instances[1]?.url).toBe(
      "/api/projects/project-1/events?lastEventId=evt-42"
    );
  });

  it("falls back to payload id when MessageEvent.lastEventId is empty", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    renderHook(() => useSse("project-1", onEvent));

    const firstSource = MockEventSource.instances[0];
    const payloadWithId = {
      id: "payload-evt-9",
      type: "log",
      payload: { message: "ok" }
    } as unknown as PipelineEvent;

    act((): void => {
      firstSource?.emitMessage(payloadWithId, "");
      firstSource?.emitError();
    });

    act((): void => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockEventSource.instances).toHaveLength(2);
    expect(MockEventSource.instances[1]?.url).toBe(
      "/api/projects/project-1/events?lastEventId=payload-evt-9"
    );
  });

  it("uses exponential backoff and caps retry delay at 5000ms", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    renderHook(() => useSse("project-1", onEvent));

    const first = MockEventSource.instances[0];

    act(() => {
      first?.emitError();
      vi.advanceTimersByTime(1000); // reconnect #1 (next delay 2000)
    });

    const second = MockEventSource.instances[1];
    act(() => {
      second?.emitError();
      vi.advanceTimersByTime(2000); // reconnect #2 (next delay 4000)
    });

    const third = MockEventSource.instances[2];
    act(() => {
      third?.emitError();
      vi.advanceTimersByTime(4000); // reconnect #3 (next delay 5000 cap)
    });

    const fourth = MockEventSource.instances[3];
    act(() => {
      fourth?.emitError();
      vi.advanceTimersByTime(5000); // reconnect #4 (still capped)
    });

    expect(MockEventSource.instances).toHaveLength(5);
  });

  it("retries when EventSource constructor throws", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    MockEventSource.throwOnNext = true;
    renderHook(() => useSse("project-1", onEvent));

    // First connect fails before an instance is tracked.
    expect(MockEventSource.instances).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0]?.url).toBe("/api/projects/project-1/events");
  });

  it("uses the latest callback without reinitializing connection", () => {
    const firstHandler = vi.fn<(event: PipelineEvent) => void>();
    const secondHandler = vi.fn<(event: PipelineEvent) => void>();

    const { rerender } = renderHook(
      ({ onEvent }) => useSse("project-1", onEvent),
      { initialProps: { onEvent: firstHandler } }
    );

    expect(MockEventSource.instances).toHaveLength(1);

    rerender({ onEvent: secondHandler });

    const source = MockEventSource.instances[0];
    const event = { type: "stats", payload: { tokensUsed: 3 } } as unknown as PipelineEvent;

    act(() => {
      source?.emitMessage(event, "evt-100");
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(MockEventSource.instances).toHaveLength(1);
  });

  it("closes current stream and resets state when projectId changes", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    const { rerender } = renderHook(
      ({ projectId }) => useSse(projectId, onEvent),
      { initialProps: { projectId: "project-1" } }
    );

    const first = MockEventSource.instances[0];
    act(() => {
      first?.emitMessage({ id: "evt-1", type: "log", payload: {} } as PipelineEvent, "evt-1");
    });

    rerender({ projectId: "project-2" });

    expect(first?.closed).toBe(true);
    expect(MockEventSource.instances).toHaveLength(2);
    expect(MockEventSource.instances[1]?.url).toBe("/api/projects/project-2/events");
  });

  it("closes stream on unmount and prevents future reconnects", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    const { unmount } = renderHook(() => useSse("project-1", onEvent));

    const source = MockEventSource.instances[0];

    act(() => {
      source?.emitError();
    });

    unmount();

    expect(source?.closed).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(MockEventSource.instances).toHaveLength(1);
  });
});
