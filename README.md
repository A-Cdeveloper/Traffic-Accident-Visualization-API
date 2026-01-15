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
✅ Rate limiting configured  
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

1.  Configure `.env` with database credentials
2.  Run migrations: `npx prisma migrate dev`
3.  Generate Prisma Client: `npx prisma generate`

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
- `years` (optional) - Comma-separated list of years (e.g., `2020,2021,2022`)

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

- Rate limiting: 100 requests per minute
- Caching: 5 minutes (s-maxage=300)
- Error handling with proper status codes
- Optimized database queries with composite indexes

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

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 100 requests per minute per IP address
- **Response:** Returns `429 Too Many Requests` when limit is exceeded

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request:** Missing or invalid parameters
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server-side errors (logged to console)

## Performance Optimizations

- **Database Indexes:** Composite indexes on frequently queried fields
- **Response Caching:** HTTP cache headers for improved performance
- **Batch Processing:** Efficient data import with batch transactions

## Note

The frontend is separate and not part of this project.
