import { NextResponse } from "next/server";

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
  }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends ApiError {
  constructor(
    message: string = "Database operation failed",
    details?: unknown
  ) {
    super(500, message, details);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(404, message, details);
  }
}

/**
 * Handles errors and returns appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle known ApiError instances
  if (error instanceof ApiError) {
    const response: { error: string; details?: unknown } = {
      error: error.message,
    };
    if (error.details) {
      response.details = error.details;
    }
    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    // Prisma error codes
    const prismaError = error as { code?: string; message?: string };

    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate entry", details: "Unique constraint violation" },
        { status: 409 }
      );
    }

    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }

  // Unknown errors - return generic 500
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
