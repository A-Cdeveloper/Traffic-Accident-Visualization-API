import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";
import { accidentsQuerySchema } from "@/lib/zod";

export async function GET(request: NextRequest) {
  try {
    //  Rate limit
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const searchParams = request.nextUrl.searchParams;

    // Convert URLSearchParams to object for Zod
    const params = {
      pstation: searchParams.get("pstation") || undefined,
      years: searchParams.get("years") || undefined,
    };

    // Validate with Zod
    const validationResult = accidentsQuerySchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { pstation, years } = validationResult.data;

    // Years is already validated and parsed by Zod
    const yearsArray = years ?? [];

    //  Build where clause
    const whereClause: {
      pstation: string;
      dateTime?: {
        gte: Date;
        lte: Date;
      };
    } = {
      pstation,
    };

    //  Apply year range filter (optimized)
    if (yearsArray.length > 0) {
      const minYear = Math.min(...yearsArray);
      const maxYear = Math.max(...yearsArray);

      whereClause.dateTime = {
        gte: new Date(`${minYear}-01-01T00:00:00Z`),
        lte: new Date(`${maxYear}-12-31T23:59:59Z`),
      };
    }

    //  Query DB
    const accidents = await prisma.trafficAccident.findMany({
      where: whereClause,
      orderBy: {
        dateTime: "asc",
      },
    });

    //  Response
    return NextResponse.json(
      {
        pstation,
        years: yearsArray.length > 0 ? yearsArray : "all",
        total: accidents.length,
        data: accidents,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/accidents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
