import { NextResponse } from "next/server";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/types/domain";

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(code: string, message: string, status: number, details?: unknown): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {})
      }
    },
    { status }
  );
}
