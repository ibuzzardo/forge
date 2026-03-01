import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { conflictResponse, internalServerErrorResponse, notFoundResponse, validationErrorResponse } from "@/lib/api/errors";
import { startPipelineSchema } from "@/lib/validation/project-brief-schema";
import { inMemoryStore } from "@/lib/store/in-memory-store";
import { startPipeline } from "@/lib/pipeline/simulation-engine";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(request: NextRequest, props: Params) {
  try {
    const { projectId } = await props.params;
    const body = await request.json();
    const parsed = startPipelineSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    if (parsed.data.projectId !== projectId) {
      return conflictResponse("projectId in body does not match route param");
    }

    const project = inMemoryStore.getProject(projectId);
    if (!project) {
      return notFoundResponse("Project not found");
    }

    const result = await startPipeline(projectId);
    if (!result.started) {
      return conflictResponse(result.reason ?? "Unable to start pipeline");
    }

    return apiSuccess({ started: true });
  } catch (error) {
    return internalServerErrorResponse();
  }
}
