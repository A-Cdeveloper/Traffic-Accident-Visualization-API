import { prisma } from "../lib/prisma";
import os from "os";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { DATA_SOURCES } from "../constants/data";
import { parseCoordinate } from "../lib/coordinates";

/**
 * Downloads a file from a URL and saves it to the specified file path
 */
async function downloadFile(url: string, filePath: string): Promise<void> {
  console.log(`  Downloading from ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`  ✓ Downloaded to ${filePath}`);
}

/**
 * Parses a date-time string in format "DD.MM.YYYY,HH:MM" to a JavaScript Date object
 */
function parseDateTime(dateTimeStr: string): Date {
  const [datePart, timePart] = dateTimeStr.split(",");
  const [day, month, year] = datePart.split(".");
  const [hour, minute] = timePart.split(":");

  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
}

/**
 * Parses an XLSX file and converts it to an array of accident objects
 */
async function parseXLSX(filePath: string): Promise<
  Array<{
    accidentId: number;
    pdepartment: string;
    pstation: string;
    dateTime: Date;
    longitude: number;
    latitude: number;
    accidentType: string;
    category: string;
    description: string | null;
  }>
> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
  }) as unknown[][];

  const rows = data;

  const accidents = rows
    .filter((row) => row && row[0])
    .map((row) => {
      const rowArray = row as unknown[];
      return {
        accidentId: parseInt(String(rowArray[0] || "0")),
        pdepartment: String(rowArray[1] || ""),
        pstation: String(rowArray[2] || ""),
        dateTime: parseDateTime(String(rowArray[3] || "")),
        longitude: parseCoordinate(
          rowArray[4] as string | number | null | undefined,
          true
        ),
        latitude: parseCoordinate(
          rowArray[5] as string | number | null | undefined,
          false
        ),
        accidentType: String(rowArray[6] || ""),
        category: String(rowArray[7] || ""),
        description: rowArray[8] ? String(rowArray[8]) : null,
      };
    });

  return accidents;
}

/**
 * Main function that orchestrates the initial data import process
 */
async function main() {
  console.log("Starting initial data import...");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "traffic-accidents-"));
  console.log(`Using temp directory: ${tempDir}\n`);

  try {
    for (const [year, url] of Object.entries(DATA_SOURCES)) {
      console.log(`Processing ${year}...`);

      const tempFilePath = path.join(tempDir, `${year}.xlsx`);

      try {
        // Download file
        await downloadFile(url, tempFilePath);

        // Parse XLSX file
        console.log(`  Parsing XLSX file...`);
        const accidents = await parseXLSX(tempFilePath);

        // Insert into database using batch processing
        console.log(`  Inserting ${accidents.length} records into database...`);
        const batchSize = 1000;
        let inserted = 0;

        for (let i = 0; i < accidents.length; i += batchSize) {
          const batch = accidents.slice(i, i + batchSize);

          await prisma.$transaction(
            batch.map((accident) =>
              prisma.trafficAccident.upsert({
                where: { accidentId: accident.accidentId },
                update: accident,
                create: accident,
              })
            )
          );

          inserted += batch.length;
          console.log(
            `    Progress: ${inserted}/${accidents.length} records inserted...`
          );
        }

        console.log(
          `  ✓ Successfully imported ${inserted} records for ${year}\n`
        );
      } catch (error) {
        console.error(`  ✗ Error processing ${year}:`, error);
      }
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log("✓ Cleaned up temp files");
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }

  await prisma.$disconnect();
}

main().catch(console.error);
