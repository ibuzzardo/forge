import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { internalServerErrorResponse, validationErrorResponse } from "@/lib/api/errors";
import { projectBriefSchema } from "@/lib/validation/project-brief-schema";
import { inMemoryStore } from "@/lib/store/in-memory-store";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = projectBriefSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const project = inMemoryStore.createProject(parsed.data);
    return apiSuccess(project, 201);
  } catch (error) {
    return internalServerErrorResponse();
  }
}
