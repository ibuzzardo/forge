import { ZodError } from "zod";
import { apiError } from "@/lib/api/response";

export function validationErrorResponse(error: ZodError) {
  return apiError("VALIDATION_ERROR", "Invalid request body", 400, error.flatten());
}

export function notFoundResponse(message: string) {
  return apiError("NOT_FOUND", message, 404);
}

export function conflictResponse(message: string) {
  return apiError("CONFLICT", message, 409);
}

export function internalServerErrorResponse(message = "Unexpected server error") {
  return apiError("INTERNAL_SERVER_ERROR", message, 500);
}
