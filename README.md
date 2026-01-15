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

## Database

The project uses MySQL database with Prisma ORM. The database contains traffic accident data from 2020-2025.

**Schema:**

- `TrafficAccident` model with fields: accidentId, city, municipality, dateTime, coordinates (longitude, latitude), accidentType, category, description

**Indexes:**

- Single column indexes on: `accidentId`, `city`, `municipality`, `dateTime`
- Composite index on: `[municipality, dateTime]` for optimized filtering
- Composite index on: `[latitude, longitude]` for geospatial queries

**Setup:**

1.  Configure `.env` with your database credentials:

- `DATABASE_HOST` - Database host
- `DATABASE_USER` - Database username
- `DATABASE_PASSWORD` - Database password
- `DATABASE_NAME` - Database name
- `DATABASE_URL` - Full database connection string
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (default: `http://localhost:5176`)

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

Returns traffic accident data filtered by municipality and optional year range.

**Query Parameters:**

- `municipality` (required) - Municipality name to filter by
  - Must be between 1-100 characters
  - Automatically trimmed
- `years` (optional) - Comma-separated list of years (e.g., `2020,2021,2022`)
  - Each year must be between 2000 and current year
  - Automatically parsed and validated

**Example Request:**

```
GET /api/accidents?municipality=Beograd&years=2023,2024
```

**Response:**

```
{
  "municipality": "Beograd",
  "years": [2023, 2024],
  "total": 150,
  "data": [
    {
      "id": 1,
      "accidentId": 12345,
      "city": "Beograd",
      "municipality": "Beograd",
      "dateTime": "2023-01-15T10:30:00.000Z",
      "longitude": 20.4489,
      "latitude": 44.7866,
      "accidentType": "Sudar",
      "category": "Sa povređenim",
      "description": "..."
    }
  ]
}
```

**Features:**

- **Input Validation:** Zod schema validation for all query parameters
- **Rate limiting:** 100 requests per minute
- **Caching:** 5 minutes (s-maxage=300)
- **Error handling:** Proper status codes with detailed validation errors
- **Optimized queries:** Database queries with composite indexes

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

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 100 requests per minute per IP address
- **Response:** Returns `429 Too Many Requests` when limit is exceeded

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request:** Missing or invalid parameters
  - Returns detailed Zod validation errors with field-specific messages
  - Example: `{ error: "Invalid request parameters", details: [...] }`
- **403 Forbidden:** Origin not allowed (CORS violation)
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server-side errors (logged to console)

**Validation:**

- All query parameters are validated using Zod schemas
- Invalid input is rejected early with clear error messages
- Type-safe validation ensures data integrity

## Performance Optimizations

- **Database Indexes:** Composite indexes on frequently queried fields
- **Response Caching:** HTTP cache headers for improved performance
- **Batch Processing:** Efficient data import with batch transactions

## Architecture

**Next.js 16 App Router:**

- Uses `proxy.ts` for request interception (replaces middleware in Next.js 16)
- Proxy handles CORS at the network boundary before requests reach route handlers
- All `/api/*` routes are protected by the proxy configuration

**Request Flow:**

1.  Request arrives → `proxy.ts` checks origin and adds CORS headers
2.  Rate limiting check → `rateLimiter.ts`
3.  Input validation → `lib/zod.ts` validates and parses query parameters
4.  Route handler → `app/api/accidents/route.ts` processes validated data
5.  Database query → Prisma ORM with optimized indexes
6.  Response with caching headers

## Note

The frontend is separate and not part of this project.
