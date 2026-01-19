/**
 * Valid coordinate ranges for Serbia
 */
const SERBIA_LONGITUDE_MIN = 18.5;
const SERBIA_LONGITUDE_MAX = 23.0;
const SERBIA_LATITUDE_MIN = 41.8;
const SERBIA_LATITUDE_MAX = 46.2;

/**
 * Parses a coordinate and fixes format if needed
 * Example: 2063443 -> 20.63443, 446382248 -> 44.6382248
 */
export function parseCoordinate(
  value: string | number | null | undefined,
  isLongitude: boolean
): number {
  if (!value) {
    return 0;
  }

  let numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue) || numValue === 0) {
    return 0;
  }

  const min = isLongitude ? SERBIA_LONGITUDE_MIN : SERBIA_LATITUDE_MIN;
  const max = isLongitude ? SERBIA_LONGITUDE_MAX : SERBIA_LATITUDE_MAX;

  // Ako je već ispravna, vraća se bez izmena
  if (numValue >= min && numValue <= max) {
    return numValue;
  }

  // Ako nije ispravna, deli se sa 10 dok ne dođe u opseg
  while (numValue > max) {
    numValue = numValue / 10;
  }

  return numValue;
}
