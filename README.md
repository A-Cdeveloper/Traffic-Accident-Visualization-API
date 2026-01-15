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
🚧 API routes (in progress)

## Database

The project uses MySQL database with Prisma ORM. The database contains traffic accident data from 2020-2025.

**Schema:**

- `TrafficAccident` model with fields: accidentId, city, municipality, dateTime, coordinates, accidentType, category, description

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

## Planned API Route

- `GET /api/accidents` -> JSON with processed data

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

## Note

The frontend is separate and not part of this project.
