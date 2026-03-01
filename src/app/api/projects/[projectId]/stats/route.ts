import { apiSuccess } from "@/lib/api/response";
import { internalServerErrorResponse, notFoundResponse } from "@/lib/api/errors";
import { inMemoryStore } from "@/lib/store/in-memory-store";

interface Params {
  params: { projectId: string };
}

export async function GET(_: Request, { params }: Params) {
  try {
    const project = inMemoryStore.getProject(params.projectId);
    if (!project) {
      return notFoundResponse("Project not found");
    }
    return apiSuccess(project.stats);
  } catch (error) {
    return internalServerErrorResponse();
  }
}
