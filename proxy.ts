import { NextRequest, NextResponse } from "next/server";

/**
 * Allowed origins for CORS
 * Can be configured via ALLOWED_ORIGINS env variable (comma-separated)
 * Default: http://localhost:5176 (Vite dev server)
 */
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }
  // Default: Vite dev server
  return ["http://localhost:5176"];
};

/**
 * Checks if the request origin is allowed
 */
const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Handle CORS preflight requests (OPTIONS)
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    if (origin && isOriginAllowed(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      response.headers.set("Access-Control-Max-Age", "86400");
    }

    return response;
  }

  // For actual requests, check origin and add CORS headers
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (origin && isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  } else if (origin) {
    // Origin not allowed - block the request
    return NextResponse.json(
      { error: "Forbidden: Origin not allowed" },
      { status: 403 }
    );
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
