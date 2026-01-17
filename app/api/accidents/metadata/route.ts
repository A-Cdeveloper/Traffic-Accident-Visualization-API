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
import { handleApiError } from "@/lib/errors";

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

    return NextResponse.json(
      {
        accidentTypes,
        categories,
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
