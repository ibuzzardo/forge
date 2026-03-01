import { eventBus } from "@/lib/store/event-bus";
import { inMemoryStore } from "@/lib/store/in-memory-store";
import type { PipelineEvent } from "@/lib/types/domain";

type Params = { params: Promise<{ projectId: string }> };

function encodeSse(event: PipelineEvent): string {
  return `id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function GET(request: Request, props: Params): Promise<Response> {
  try {
    const { projectId } = await props.params;
    const project = inMemoryStore.getProject(projectId);
    if (!project) {
      return new Response(JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Project not found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const lastEventIdHeader = request.headers.get("last-event-id");
    const parsedLastId = Number.isNaN(Number(lastEventIdHeader)) ? 0 : Number(lastEventIdHeader ?? "0");

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();

        const replay = eventBus.replayFrom(projectId, parsedLastId);
        replay.forEach((event) => controller.enqueue(encoder.encode(encodeSse(event))));

        const unsubscribe = eventBus.subscribe(projectId, (event) => {
          controller.enqueue(encoder.encode(encodeSse(event)));
        });

        const heartbeat = setInterval(() => {
          const event = eventBus.publish(projectId, {
            type: "heartbeat",
            projectId: projectId,
            timestamp: new Date().toISOString(),
            payload: { ok: true }
          });
          controller.enqueue(encoder.encode(encodeSse(event)));
        }, 15000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          unsubscribe();
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" } }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
