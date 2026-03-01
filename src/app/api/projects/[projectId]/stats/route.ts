import { apiSuccess } from "@/lib/api/response";
import { internalServerErrorResponse, notFoundResponse } from "@/lib/api/errors";
import { inMemoryStore } from "@/lib/store/in-memory-store";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_: Request, props: Params) {
  try {
    const { projectId } = await props.params;
    const project = inMemoryStore.getProject(projectId);
    if (!project) {
      return notFoundResponse("Project not found");
    }
    return apiSuccess(project.stats);
  } catch (error) {
    return internalServerErrorResponse();
  }
}
