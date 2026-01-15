import rateLimit from "next-rate-limit";
import { NextRequest, NextResponse } from "next/server";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});

export const checkRateLimit = async (
  request: NextRequest
): Promise<NextResponse | null> => {
  try {
    limiter.checkNext(request, 100);
    return null;
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
};
