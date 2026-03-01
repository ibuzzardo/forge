import { useEffect } from "react";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePipelineState } from "@/hooks/use-pipeline-state";
import { useSse } from "@/hooks/use-sse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/project-brief/step-progress";
import { cn } from "@/lib/utils";
import type { PipelineEvent, PipelineStageState } from "@/lib/types/domain";

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  emit(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }

  fail(): void {
    this.onerror?.();
  }

  close(): void {
    this.closed = true;
  }
}

function PipelineStateHarness({ events }: { events: PipelineEvent[] }): JSX.Element {
  const initialStages: PipelineStageState[] = [
    {
      key: "intake",
      name: "Intake",
      description: "Validating",
      progress: 0,
      status: "pending",
      startedAt: null,
      completedAt: null
    }
  ];
  const { state, applyEvent } = usePipelineState(initialStages);

  useEffect(() => {
    events.forEach((event) => applyEvent(event));
  }, [events, applyEvent]);

  return (
    <div>
      <p data-testid="status">{state.status}</p>
      <p data-testid="logs">{state.logs.length}</p>
      <p data-testid="progress">{state.stages[0]?.progress}</p>
    </div>
  );
}

function SseHarness({ onEvent }: { onEvent: (event: PipelineEvent) => void }): JSX.Element {
  useSse("project-1", onEvent);
  return <div>ready</div>;
}

describe("hooks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource as never);
  });

  it("usePipelineState applies snapshot, stage, and log events", () => {
    const events: PipelineEvent[] = [
      {
        id: 1,
        type: "snapshot",
        projectId: "p1",
        timestamp: "t1",
        payload: {
          status: "running",
          stages: [
            {
              key: "intake",
              name: "Intake",
              description: "Validating",
              progress: 25,
              status: "active",
              startedAt: null,
              completedAt: null
            }
          ],
          stats: { totalStages: 1, completedStages: 0, activeStage: "Intake", percentComplete: 25, etaSeconds: 3, logsEmitted: 0 }
        }
      },
      {
        id: 2,
        type: "log",
        projectId: "p1",
        timestamp: "t2",
        payload: { id: 1, level: "info", message: "hello", timestamp: "t2", projectId: "p1" }
      }
    ];

    render(<PipelineStateHarness events={events} />);
    expect(screen.getByTestId("status").textContent).toBe("running");
    expect(screen.getByTestId("logs").textContent).toBe("1");
    expect(screen.getByTestId("progress").textContent).toBe("25");
  });

  it("useSse reconnects on error and resets retry on message", () => {
    const onEvent = vi.fn();
    const { unmount } = render(<SseHarness onEvent={onEvent} />);

    expect(MockEventSource.instances.length).toBe(1);
    const first = MockEventSource.instances[0];

    act(() => {
      first.emit({ id: 1, type: "heartbeat", projectId: "project-1", timestamp: "t", payload: {} });
    });
    expect(onEvent).toHaveBeenCalledTimes(1);

    act(() => {
      first.fail();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockEventSource.instances.length).toBe(2);

    unmount();
    expect(MockEventSource.instances.some((instance) => instance.closed)).toBe(true);
    vi.useRealTimers();
  });
});

describe("utils and ui primitives", () => {
  it("cn merges tailwind classes", () => {
    expect(cn("p-2", "p-4", "text-sm")).toContain("p-4");
    expect(cn("p-2", "p-4", "text-sm")).not.toContain("p-2");
  });

  it("renders button/input/textarea/select/card", () => {
    render(
      <div>
        <Button className="extra">Click</Button>
        <Input placeholder="name" />
        <Textarea placeholder="notes" />
        <Select aria-label="sel">
          <option>One</option>
        </Select>
        <Card data-testid="card">Body</Card>
      </div>
    );

    expect(screen.getByRole("button", { name: "Click" }).className).toContain("extra");
    expect(screen.getByPlaceholderText("name")).toBeTruthy();
    expect(screen.getByPlaceholderText("notes")).toBeTruthy();
    expect(screen.getByLabelText("sel")).toBeTruthy();
    expect(screen.getByTestId("card")).toBeTruthy();
  });

  it("progress clamps value between 0 and 100", () => {
    const { rerender } = render(<Progress value={-10} />);
    expect(screen.getByTestId("indicator")).toBeFalsy();

    let indicator = document.querySelector('[data-slot="indicator"]') as HTMLDivElement;
    expect(indicator.style.width).toBe("0%");

    rerender(<Progress value={120} />);
    indicator = document.querySelector('[data-slot="indicator"]') as HTMLDivElement;
    expect(indicator.style.width).toBe("100%");
  });

  it("badge supports variants", () => {
    const { rerender } = render(<Badge>default</Badge>);
    expect(screen.getByText("default").className).toContain("bg-primary/20");

    rerender(<Badge variant="secondary">secondary</Badge>);
    expect(screen.getByText("secondary").className).toContain("bg-secondary/20");

    rerender(<Badge variant="destructive">danger</Badge>);
    expect(screen.getByText("danger").className).toContain("bg-destructive/20");
  });

  it("step progress renders expected number of steps", () => {
    render(<StepProgress currentStep={2} totalSteps={3} />);
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });
});
