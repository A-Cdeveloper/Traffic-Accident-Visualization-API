# Traffic Accident Visualization (API)

This Next.js project is intended solely as an API service.  
The frontend will be built in a separate React project.

## Idea

- Download XLSX files with traffic accident statistics published by the Serbian Ministry of Internal Affairs (MUP)
- Convert XLSX to JSON
- Expose the JSON through a single API route

## Data Source

The dataset is based on official open data from the Republic of Serbia.

## Status

✅ Database schema defined (Prisma ORM with MySQL)  
✅ Initial data import script implemented  
✅ Data sources configured (2020-2025)  
✅ API routes implemented  
✅ CORS protection via Next.js 16 proxy  
✅ Rate limiting configured  
✅ Input validation with Zod  
✅ Database indexes optimized  
✅ Centralized error handling with custom error classes  
✅ Health check endpoint for monitoring  
✅ Metadata endpoint for filter options  
✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy)  
✅ Query timeout protection for database queries  
✅ Configurable connection pooling

## Database

The project uses MySQL database with Prisma ORM. The database contains traffic accident data from 2020-2025.

**Schema:**

- `TrafficAccident` model with fields: accidentId, pdepartment, pstation, dateTime, coordinates (longitude, latitude), accidentType, category, description

**Indexes:**

- Single column indexes on: `accidentId`, `pdepartment`, `pstation`, `dateTime`
- Composite index on: `[pstation, dateTime]` for optimized filtering
- Composite index on: `[latitude, longitude]` for geospatial queries

**Setup:**

1.  Configure `.env` with your database credentials:

**Required:**

- `DATABASE_HOST` - Database host
- `DATABASE_USER` - Database username
- `DATABASE_PASSWORD` - Database password
- `DATABASE_NAME` - Database name
- `DATABASE_URL` - Full database connection string

**Optional:**

- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (default: `http://localhost:5176`)
- `DATABASE_CONNECTION_LIMIT` - Connection pool limit (default: `5`)
- `DATABASE_QUERY_TIMEOUT` - Query timeout in milliseconds (default: `30000` = 30 seconds)

1.  Run migrations: `npx prisma migrate dev`
2.  Generate Prisma Client: `npx prisma generate`

## Data Import

Initial data import script is available to populate the database with historical data.

**Run initial import:**

```
npm run import:initial
```

This script will:

- Download XLSX files from data.gov.rs (2020-2025)
- Parse and convert to database format
- Insert data using batch processing for performance

## API Routes

### `GET /api/accidents`

Returns traffic accident data filtered by pstation and optional filters.

**Query Parameters:**

- `pstation` (required) - Police station name to filter by
  - Must be between 1-100 characters
  - Automatically trimmed
- `startDate` (optional) - Start date in ISO format (YYYY-MM-DD)
- `endDate` (optional) - End date in ISO format (YYYY-MM-DD)
  - Must be greater than or equal to `startDate`
- `accidentType` (optional) - Filter by accident type
  - Valid values: `materijalna`, `povredjeni`, `poginuli`
- `categories` (optional) - Comma-separated list of categories
  - Valid values: `jedno-vozilo`, `bez-skretanja`, `sa-skretanjem`, `parkirana`, `pesaci`

**Example Request:**

```
GET /api/accidents?pstation=Beograd&startDate=2023-01-01&endDate=2023-12-31&accidentType=materijalna&categories=jedno-vozilo,bez-skretanja
```

**Response:**

```
{
  "pstation": "Beograd",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "accidentType": "materijalna",
  "categories": ["jedno-vozilo", "bez-skretanja"],
  "total": 150,
  "data": [
    {
      "id": 1,
      "accidentId": 12345,
      "pdepartment": "Beograd",
      "pstation": "Beograd",
      "dateTime": "2023-01-15T10:30:00.000Z",
      "longitude": 20.4489,
      "latitude": 44.7866,
      "accidentType": "Sa materijalnom štetom",
      "category": "Jedno vozilo",
      "description": "..."
    }
  ]
}
```

**Features:**

- **Input Validation:** Zod schema validation for all query parameters
- **Rate limiting:** 100 requests per minute
- **Caching:** 5 minutes (s-maxage=300)
- **Error handling:** Centralized error handling with custom error classes
- **Query timeout:** 30 seconds default (configurable via `DATABASE_QUERY_TIMEOUT`)
- **Optimized queries:** Database queries with composite indexes
- **Human-readable labels:** Accident types and categories are transformed to readable format in responses

### `GET /api/accidents/metadata`

Returns available filter options for `accidentType` and `categories` with human-readable labels. This endpoint enables frontend to dynamically populate filter dropdowns without hardcoding values.

**Response:**

```json
{
  "accidentTypes": [
    {
      "value": "materijalna",
      "label": "Sa materijalnom štetom"
    },
    {
      "value": "povredjeni",
      "label": "Sa povređenim"
    },
    {
      "value": "poginuli",
      "label": "Sa poginulim"
    }
  ],
  "categories": [
    {
      "value": "jedno-vozilo",
      "label": "Jedno vozilo"
    },
    {
      "value": "bez-skretanja",
      "label": "Najmanje dva vozila – bez skretanja"
    },
    {
      "value": "skretanje-prelazak",
      "label": "Najmanje dva vozila – skretanje ili prelazak"
    },
    {
      "value": "parkirana",
      "label": "Parkirana vozila"
    },
    {
      "value": "pesaci",
      "label": "Pešaci"
    }
  ]
}
```

**Features:**

- **Single source of truth:** Filter options are managed on the backend
- **Rate limiting:** 100 requests per minute
- **Caching:** 1 hour (s-maxage=3600) - metadata rarely changes
- **Error handling:** Centralized error handling with custom error classes
- **Value/Label format:** `value` is used for API filtering, `label` is for UI display

**Usage:**

Frontend should call this endpoint once on initialization to populate filter dropdowns. The `value` field should be used when making requests to `/api/accidents`, while `label` is displayed to users in the UI.

### `GET /api/health`

Health check endpoint for monitoring and deployment verification.

**Response (Success - 200):**

```
{
  "status": "ok",
  "timestamp": "2026-01-16T12:00:00.000Z",
  "database": "connected"
}
```

**Response (Error - 503):**

```
{
  "status": "error",
  "timestamp": "2026-01-16T12:00:00.000Z",
  "database": "disconnected"
}
```

**Features:**

- Checks database connectivity with a simple query
- 5-second timeout for health check queries
- Returns appropriate HTTP status codes (200 for healthy, 503 for unhealthy)

## Local Development

**Start development server:**

```
npm run dev
```

**Available scripts:**

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run import:initial` - Import initial data from XLSX files

## CORS Configuration

The API implements CORS (Cross-Origin Resource Sharing) via Next.js 16 `proxy.ts` to restrict access to allowed frontend origins only.

**Implementation:**

- CORS is handled at the network boundary using `proxy.ts` (Next.js 16 replaces middleware)
- All API routes (`/api/*`) are protected by the proxy
- Preflight OPTIONS requests are automatically handled

**Configuration:**

Set `ALLOWED_ORIGINS` environment variable in `.env` with comma-separated list of allowed origins:

```
# Development
ALLOWED_ORIGINS=http://localhost:5176

# Production (multiple domains)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

- Default: `http://localhost:5176` (Vite dev server)
- Multiple origins: Separate with commas (spaces are automatically trimmed)

**Security:**

- Only requests from allowed origins will be processed
- Returns `403 Forbidden` for requests from unauthorized origins
- Supports preflight OPTIONS requests for CORS
- CORS headers are added automatically for allowed origins

**Security Headers:**

All API responses include the following security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 100 requests per minute per IP address
- **Response:** Returns `429 Too Many Requests` when limit is exceeded

## Error Handling

The API includes comprehensive error handling with centralized error management:

**Error Classes:**

- `ApiError` - Base error class for all API errors
- `ValidationError` - For validation failures (400)
- `DatabaseError` - For database operation failures (500)
- `NotFoundError` - For missing resources (404)

**HTTP Status Codes:**

- **400 Bad Request:** Missing or invalid parameters
  - Returns detailed Zod validation errors with field-specific messages
  - Example: `{ error: "Invalid request parameters", details: [...] }`
- **403 Forbidden:** Origin not allowed (CORS violation)
- **404 Not Found:** Resource not found (Prisma P2025 error)
- **409 Conflict:** Duplicate entry (Prisma P2002 error)
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server-side errors
- **503 Service Unavailable:** Database connection failures or query timeouts

**Prisma Error Handling:**

- Automatically handles Prisma-specific error codes (P2002, P2025, etc.)
- Query timeout errors are caught and returned as 500/503 errors
- All errors are handled through `handleApiError()` function

**Validation:**

- All query parameters are validated using Zod schemas
- Invalid input is rejected early with clear error messages
- Type-safe validation ensures data integrity

## Performance Optimizations

- **Database Indexes:** Composite indexes on frequently queried fields
- **Response Caching:** HTTP cache headers for improved performance
- **Batch Processing:** Efficient data import with batch transactions
- **Connection Pooling:** Configurable connection pool limit (default: 5)
- **Query Timeout:** Prevents long-running queries from blocking the API (default: 30 seconds)

## Architecture

**Next.js 16 App Router:**

- Uses `proxy.ts` for request interception (replaces middleware in Next.js 16)
- Proxy handles CORS at the network boundary before requests reach route handlers
- All `/api/*` routes are protected by the proxy configuration

**Request Flow:**

1.  Request arrives → `proxy.ts` checks origin, adds CORS and security headers
2.  Rate limiting check → `rateLimiter.ts`
3.  Input validation → `lib/zod.ts` validates and parses query parameters
4.  Route handler → `app/api/accidents/route.ts` processes validated data
5.  Database query → Prisma ORM with query timeout wrapper and optimized indexes
6.  Error handling → `lib/errors.ts` handles any errors
7.  Response with caching headers

## Note

The frontend is separate and not part of this project.
