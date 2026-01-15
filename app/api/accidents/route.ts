import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function GET(request: NextRequest) {
  try {
    //  Rate limit
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const searchParams = request.nextUrl.searchParams;

    const municipality = searchParams.get("municipality");
    const yearsParam = searchParams.get("years");

    //  municipality is required
    if (!municipality || municipality.trim().length === 0) {
      return NextResponse.json(
        { error: "municipality is required" },
        { status: 400 }
      );
    }

    //  Parse & validate years
    const yearsArray = yearsParam
      ? yearsParam
          .split(",")
          .map((y) => parseInt(y.trim(), 10))
          .filter(
            (y) => !isNaN(y) && y >= 2000 && y <= new Date().getFullYear()
          )
      : [];

    //  Build where clause
    const whereClause: {
      municipality: string;
      dateTime?: {
        gte: Date;
        lte: Date;
      };
    } = {
      municipality,
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
        municipality,
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
