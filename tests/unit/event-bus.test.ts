import { describe, expect, it } from "vitest";
import { eventBus } from "@/lib/store/event-bus";

const makeEvent = (projectId: string, type: "snapshot" | "stage" | "log" | "stats" | "heartbeat") => ({
  type,
  projectId,
  timestamp: new Date().toISOString(),
  payload: { ok: true }
});

describe("eventBus", () => {
  it("publishes incrementing ids per project", () => {
    const projectId = `project-${Date.now()}-ids`;
    const first = eventBus.publish(projectId, makeEvent(projectId, "heartbeat"));
    const second = eventBus.publish(projectId, makeEvent(projectId, "heartbeat"));
    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
  });

  it("replays only events after fromId", () => {
    const projectId = `project-${Date.now()}-replay`;
    eventBus.publish(projectId, makeEvent(projectId, "log"));
    eventBus.publish(projectId, makeEvent(projectId, "log"));
    eventBus.publish(projectId, makeEvent(projectId, "log"));

    const replay = eventBus.replayFrom(projectId, 1);
    expect(replay.length).toBe(2);
    expect(replay[0]?.id).toBe(2);
    expect(replay[1]?.id).toBe(3);
  });

  it("subscribes and unsubscribes listeners", () => {
    const projectId = `project-${Date.now()}-sub`;
    const seen: number[] = [];
    const unsubscribe = eventBus.subscribe(projectId, (event) => seen.push(event.id));

    eventBus.publish(projectId, makeEvent(projectId, "stage"));
    unsubscribe();
    eventBus.publish(projectId, makeEvent(projectId, "stage"));

    expect(seen).toEqual([1]);
  });

  it("keeps replay buffer bounded to 2000 events", () => {
    const projectId = `project-${Date.now()}-buffer`;
    for (let i = 0; i < 2005; i += 1) {
      eventBus.publish(projectId, makeEvent(projectId, "heartbeat"));
    }

    const replay = eventBus.replayFrom(projectId, 0);
    expect(replay.length).toBe(2000);
    expect(replay[0]?.id).toBe(6);
    expect(replay[1999]?.id).toBe(2005);
  });

  it("clearProject removes events and id counters", () => {
    const projectId = `project-${Date.now()}-clear`;
    eventBus.publish(projectId, makeEvent(projectId, "log"));
    eventBus.clearProject(projectId);

    expect(eventBus.replayFrom(projectId, 0)).toEqual([]);
    const next = eventBus.publish(projectId, makeEvent(projectId, "log"));
    expect(next.id).toBe(1);

    eventBus.clearProject(projectId);
  });
});
