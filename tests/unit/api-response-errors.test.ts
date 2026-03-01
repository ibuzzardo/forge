import { describe, expect, it } from "vitest";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  conflictResponse,
  internalServerErrorResponse,
  notFoundResponse,
  validationErrorResponse
} from "@/lib/api/errors";

describe("api responses", () => {
  it("apiSuccess returns success envelope with status", async () => {
    const response = apiSuccess({ id: "x" }, 201);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ success: true, data: { id: "x" } });
  });

  it("apiError returns error envelope with optional details", async () => {
    const withDetails = apiError("BAD", "bad request", 400, { field: "email" });
    expect(withDetails.status).toBe(400);
    await expect(withDetails.json()).resolves.toEqual({
      success: false,
      error: { code: "BAD", message: "bad request", details: { field: "email" } }
    });

    const withoutDetails = apiError("BAD", "bad request", 400);
    await expect(withoutDetails.json()).resolves.toEqual({
      success: false,
      error: { code: "BAD", message: "bad request" }
    });
  });
});

describe("api error helper wrappers", () => {
  it("validationErrorResponse returns standardized shape", async () => {
    const schema = z.object({ name: z.string().min(2) });
    const result = schema.safeParse({ name: "x" });
    if (result.success) {
      throw new Error("Expected invalid payload");
    }

    const response = validationErrorResponse(result.error);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toBeTruthy();
  });

  it("notFoundResponse returns 404", async () => {
    const response = notFoundResponse("Project not found");
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("conflictResponse returns 409", async () => {
    const response = conflictResponse("conflict");
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("CONFLICT");
  });

  it("internalServerErrorResponse uses default and custom message", async () => {
    const defaultResponse = internalServerErrorResponse();
    expect(defaultResponse.status).toBe(500);
    await expect(defaultResponse.json()).resolves.toMatchObject({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" }
    });

    const customResponse = internalServerErrorResponse("Oops");
    await expect(customResponse.json()).resolves.toMatchObject({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Oops" }
    });
  });
});
