import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";
import {
  VALID_ACCIDENT_TYPES,
  VALID_CATEGORIES,
  getAccidentTypeLabel,
  getCategoryLabel,
  getAccidentTypeFilter,
  getCategoryFilter,
} from "@/lib/accidentLabels";
import { handleApiError, DatabaseError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { withTimeout } from "@/lib/queryTimeout";

export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Build metadata response
    const accidentTypes = VALID_ACCIDENT_TYPES.map((type) => ({
      value: type,
      label: getAccidentTypeLabel(getAccidentTypeFilter(type)),
    }));

    const categories = VALID_CATEGORIES.map((cat) => ({
      value: cat,
      label: getCategoryLabel(getCategoryFilter(cat)),
    }));

    // Get last accident date from database
    const lastUpdated = await withTimeout(
      prisma.trafficAccident.findFirst({
        orderBy: {
          dateTime: "desc",
        },
        select: {
          dateTime: true,
        },
      })
    ).catch((error) => {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new DatabaseError("Query timeout - request took too long", error);
      }
      throw new DatabaseError("Failed to fetch last accident date", error);
    });

    return NextResponse.json(
      {
        accidentTypes,
        categories,
        lastUpdated: lastUpdated?.dateTime.toISOString() || null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
