import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/errors";
import { withTimeout } from "@/lib/queryTimeout";

export async function GET() {
  try {
    // Check database connection with a simple query (shorter timeout for health check)
    await withTimeout(prisma.$queryRaw`SELECT 1`, 5000).catch((error) => {
      throw new DatabaseError("Database connection failed", error);
    });

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      { status: 200 }
    );
  } catch (error) {
    // Health check needs specific format, not generic error handler
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          status: "error",
          timestamp: new Date().toISOString(),
          database: "disconnected",
        },
        { status: 503 }
      );
    }
    // Fallback for unknown errors
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "unknown",
      },
      { status: 503 }
    );
  }
}
