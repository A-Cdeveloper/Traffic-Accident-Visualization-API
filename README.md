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

Currently the project is empty (boilerplate only). This repository will contain only the API.

## Planned API Route

- `GET /api/accidents` -> JSON with processed data

## Local Development

```
npm run dev
```

## Note

The frontend is separate and not part of this project.
