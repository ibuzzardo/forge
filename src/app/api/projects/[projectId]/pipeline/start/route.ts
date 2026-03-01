import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { conflictResponse, internalServerErrorResponse, notFoundResponse, validationErrorResponse } from "@/lib/api/errors";
import { startPipelineSchema } from "@/lib/validation/project-brief-schema";
import { inMemoryStore } from "@/lib/store/in-memory-store";
import { startPipeline } from "@/lib/pipeline/simulation-engine";

interface Params {
  params: { projectId: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const parsed = startPipelineSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    if (parsed.data.projectId !== params.projectId) {
      return conflictResponse("projectId in body does not match route param");
    }

    const project = inMemoryStore.getProject(params.projectId);
    if (!project) {
      return notFoundResponse("Project not found");
    }

    const result = await startPipeline(params.projectId);
    if (!result.started) {
      return conflictResponse(result.reason ?? "Unable to start pipeline");
    }

    return apiSuccess({ started: true });
  } catch (error) {
    return internalServerErrorResponse();
  }
}
