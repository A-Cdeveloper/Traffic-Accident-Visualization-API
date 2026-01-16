import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";
import { accidentsQuerySchema } from "@/lib/zod";
import {
  getAccidentTypeLabel,
  getCategoryLabel,
  getAccidentTypeFilter,
  getCategoryFilter,
} from "@/lib/accidentLabels";
import { handleApiError, DatabaseError } from "@/lib/errors";
import { withTimeout } from "@/lib/queryTimeout";

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
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      accidentType: searchParams.get("accidentType") || undefined,
      categories: searchParams.get("categories") || undefined,
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

    const { pstation, startDate, endDate, accidentType, categories } =
      validationResult.data;

    //  Build where clause
    const whereClause: {
      pstation: string;
      accidentType?: string;
      category?: {
        in: string[];
      };
      dateTime?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      pstation,
    };

    //  Apply accidentType filter
    if (accidentType) {
      whereClause.accidentType = getAccidentTypeFilter(accidentType);
    }

    //  Apply categories filter (multiple values)
    if (categories && categories.length > 0) {
      const dbCategories = categories.map((cat) => getCategoryFilter(cat));
      whereClause.category = {
        in: dbCategories,
      };
    }

    //  Apply date range filter
    if (startDate || endDate) {
      whereClause.dateTime = {};

      if (startDate) {
        // Set to start of day in UTC (00:00:00.000)
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        whereClause.dateTime.gte = start;
      }

      if (endDate) {
        // Set to end of day in UTC (23:59:59.999)
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        whereClause.dateTime.lte = end;
      }
    }

    //  Query DB with timeout
    const accidents = await withTimeout(
      prisma.trafficAccident.findMany({
        where: whereClause,
        orderBy: {
          dateTime: "asc",
        },
      })
    ).catch((error) => {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new DatabaseError("Query timeout - request took too long", error);
      }
      throw new DatabaseError("Failed to fetch accidents", error);
    });

    //  Transform data to include human-readable labels
    const transformedData = accidents.map((accident) => ({
      ...accident,
      accidentType: getAccidentTypeLabel(accident.accidentType),
      category: getCategoryLabel(accident.category),
    }));

    //  Response
    return NextResponse.json(
      {
        pstation,
        startDate: startDate?.toISOString().split("T")[0] || null,
        endDate: endDate?.toISOString().split("T")[0] || null,
        accidentType: accidentType || null,
        categories: categories || null,
        total: accidents.length,
        data: transformedData,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
