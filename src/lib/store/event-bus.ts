import type { PipelineEvent } from "@/lib/types/domain";

type Subscriber = (event: PipelineEvent) => void;

class EventBus {
  private subscribers = new Map<string, Set<Subscriber>>();
  private events = new Map<string, PipelineEvent[]>();
  private ids = new Map<string, number>();

  publish(projectId: string, event: Omit<PipelineEvent, "id">): PipelineEvent {
    const nextId = (this.ids.get(projectId) ?? 0) + 1;
    this.ids.set(projectId, nextId);
    const payload: PipelineEvent = { ...event, id: nextId };

    const existing = this.events.get(projectId) ?? [];
    existing.push(payload);
    if (existing.length > 2000) {
      existing.shift();
    }
    this.events.set(projectId, existing);

    const listeners = this.subscribers.get(projectId);
    listeners?.forEach((fn) => fn(payload));
    return payload;
  }

  subscribe(projectId: string, cb: Subscriber): () => void {
    const current = this.subscribers.get(projectId) ?? new Set<Subscriber>();
    current.add(cb);
    this.subscribers.set(projectId, current);

    return (): void => {
      const listeners = this.subscribers.get(projectId);
      if (!listeners) return;
      listeners.delete(cb);
      if (listeners.size === 0) {
        this.subscribers.delete(projectId);
      }
    };
  }

  replayFrom(projectId: string, fromId: number): PipelineEvent[] {
    return (this.events.get(projectId) ?? []).filter((event) => event.id > fromId);
  }

  clearProject(projectId: string): void {
    this.subscribers.delete(projectId);
    this.events.delete(projectId);
    this.ids.delete(projectId);
  }
}

// Use globalThis to ensure singleton across Next.js route bundles
const globalForEventBus = globalThis as unknown as { __forgeEventBus?: EventBus };
if (!globalForEventBus.__forgeEventBus) {
  globalForEventBus.__forgeEventBus = new EventBus();
}
export const eventBus = globalForEventBus.__forgeEventBus;
