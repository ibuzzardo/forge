import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PipelineEvent } from "@/lib/types/domain";
import { useSse, type SseHookError } from "@/hooks/use-sse";

class MockEventSource {
  static instances: MockEventSource[] = [];

  readonly url: string;
  readonly withCredentials = false;
  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSED = 2;
  readyState = 1;
  closeCalls = 0;

  onopen: ((this: EventSource, ev: Event) => unknown) | null = null;
  onmessage: ((this: EventSource, ev: MessageEvent<string>) => unknown) | null = null;
  onerror: ((this: EventSource, ev: Event) => unknown) | null = null;

  constructor(url: string | URL) {
    this.url = String(url);
    MockEventSource.instances.push(this);
  }

  close(): void {
    this.closeCalls += 1;
    this.readyState = this.CLOSED;
  }

  addEventListener(): void {
    // Not needed for these tests.
  }

  removeEventListener(): void {
    // Not needed for these tests.
  }

  dispatchEvent(): boolean {
    return true;
  }

  emitRaw(data: string, lastEventId = ""): void {
    this.onmessage?.call(this as unknown as EventSource, {
      data,
      lastEventId
    } as MessageEvent<string>);
  }

  emitJson(payload: unknown, lastEventId = ""): void {
    this.emitRaw(JSON.stringify(payload), lastEventId);
  }

  emitError(): void {
    this.onerror?.call(this as unknown as EventSource, new Event("error"));
  }
}

interface HarnessProps {
  projectId: string;
  onEvent: (event: PipelineEvent) => void;
  onError?: (error: SseHookError) => void;
}

function Harness({ projectId, onEvent, onError }: HarnessProps): null {
  useSse(projectId, onEvent, onError);
  return null;
}

describe("useSse", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("opens an EventSource for the project events endpoint", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    render(<Harness projectId="project-1" onEvent={onEvent} />);

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe("/api/projects/project-1/events");
  });

  it("forwards parsed events to onEvent", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    render(<Harness projectId="project-1" onEvent={onEvent} />);

    const source = MockEventSource.instances[0];
    const payload = {
      id: "evt-100",
      type: "stats",
      payload: { durationMs: 42 }
    } as unknown as PipelineEvent;

    source.emitJson(payload);

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(payload);
  });

  it("uses MessageEvent.lastEventId for resume after reconnect", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    render(<Harness projectId="project-1" onEvent={onEvent} />);

    const source = MockEventSource.instances[0];
    source.emitJson({ type: "progress", payload: { pct: 50 } }, "server-id-9");

    source.emitError();
    vi.advanceTimersByTime(1000);

    const reconnect = MockEventSource.instances[1];
    expect(reconnect.url).toContain("lastEventId=server-id-9");
  });

  it("tracks fallback payload id when MessageEvent.lastEventId is absent", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    render(<Harness projectId="project-1" onEvent={onEvent} />);

    const initialSource = MockEventSource.instances[0];
    initialSource.emitJson({
      id: "evt-101",
      type: "stats",
      payload: { durationMs: 42 }
    });

    initialSource.emitError();
    vi.advanceTimersByTime(1000);

    const reconnectedSource = MockEventSource.instances[1];
    expect(reconnectedSource.url).toContain("lastEventId=evt-101");
  });

  it("extracts fallback id from root eventId and nested payload ids", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    render(<Harness projectId="project-1" onEvent={onEvent} />);

    const first = MockEventSource.instances[0];
    first.emitJson({ eventId: 123, type: "progress", payload: {} });
    first.emitError();
    vi.advanceTimersByTime(1000);

    expect(MockEventSource.instances[1].url).toContain("lastEventId=123");

    const second = MockEventSource.instances[1];
    second.emitJson({ type: "progress", payload: { id: "nested-7" } });
    second.emitError();
    vi.advanceTimersByTime(2000);

    expect(MockEventSource.instances[2].url).toContain("lastEventId=nested-7");

    const third = MockEventSource.instances[2];
    third.emitJson({ type: "progress", payload: { eventId: 456 } });
    third.emitError();
    vi.advanceTimersByTime(4000);

    expect(MockEventSource.instances[3].url).toContain("lastEventId=456");
  });

  it("reports parse errors with structured metadata and raw payload", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();
    const onError = vi.fn<(error: SseHookError) => void>();

    render(<Harness projectId="project-1" onEvent={onEvent} onError={onError} />);

    MockEventSource.instances[0].emitRaw("{not-json", "evt-last-1");

    expect(onEvent).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "parse",
        status: 0,
        projectId: "project-1",
        lastEventId: "evt-last-1",
        rawData: "{not-json"
      })
    );
  });

  it("reports connection errors and reconnects with exponential backoff capped at 5000ms", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();
    const onError = vi.fn<(error: SseHookError) => void>();

    render(<Harness projectId="project-1" onEvent={onEvent} onError={onError} />);

    const first = MockEventSource.instances[0];
    first.emitError();

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "connection",
        projectId: "project-1"
      })
    );

    vi.advanceTimersByTime(999);
    expect(MockEventSource.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances).toHaveLength(2);

    MockEventSource.instances[1].emitError();
    vi.advanceTimersByTime(1999);
    expect(MockEventSource.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances).toHaveLength(3);

    MockEventSource.instances[2].emitError();
    vi.advanceTimersByTime(3999);
    expect(MockEventSource.instances).toHaveLength(3);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances).toHaveLength(4);

    MockEventSource.instances[3].emitError();
    vi.advanceTimersByTime(4999);
    expect(MockEventSource.instances).toHaveLength(4);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances).toHaveLength(5);

    MockEventSource.instances[4].emitError();
    vi.advanceTimersByTime(4999);
    expect(MockEventSource.instances).toHaveLength(5);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances).toHaveLength(6);
  });

  it("resets retry delay and lastEventId when project changes", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    const view = render(<Harness projectId="project-1" onEvent={onEvent} />);

    const first = MockEventSource.instances[0];
    first.emitJson({ id: "evt-keep", type: "progress", payload: {} });
    first.emitError();
    vi.advanceTimersByTime(1000);

    expect(MockEventSource.instances[1].url).toContain("lastEventId=evt-keep");

    view.rerender(<Harness projectId="project-2" onEvent={onEvent} />);

    const project2Initial = MockEventSource.instances[2];
    expect(project2Initial.url).toBe("/api/projects/project-2/events");

    project2Initial.emitError();
    vi.advanceTimersByTime(999);
    expect(MockEventSource.instances).toHaveLength(3);
    vi.advanceTimersByTime(1);

    const project2Reconnect = MockEventSource.instances[3];
    expect(project2Reconnect.url).toBe("/api/projects/project-2/events");
  });

  it("closes source and cancels pending reconnect on unmount", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();

    const view = render(<Harness projectId="project-1" onEvent={onEvent} />);

    const source = MockEventSource.instances[0];
    source.emitError();
    expect(source.closeCalls).toBeGreaterThan(0);

    view.unmount();
    vi.runOnlyPendingTimers();

    expect(MockEventSource.instances).toHaveLength(1);
  });

  it("falls back to console.error when onError is not provided", () => {
    const onEvent = vi.fn<(event: PipelineEvent) => void>();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<Harness projectId="project-1" onEvent={onEvent} />);

    MockEventSource.instances[0].emitRaw("not-json");

    expect(errorSpy).toHaveBeenCalled();
    const firstCall = errorSpy.mock.calls[0] ?? [];
    expect(String(firstCall[0])).toContain("[useSse]");
  });
});
