/**
 * Maps accident type strings from database to human-readable format
 */
export function getAccidentTypeLabel(type: string): string {
  const trimmed = type.trim();

  if (trimmed === "Sa mat.stetom") {
    return "Sa materijalnom štetom";
  }

  if (trimmed === "Sa povredjenim") {
    return "Sa povređenim";
  }

  if (trimmed === "Sa poginulim") {
    return "Sa poginulim";
  }

  // Return original if no match found
  return trimmed;
}

/**
 * Maps category strings from database to human-readable format
 */
export function getCategoryLabel(category: string): string {
  const trimmed = category.trim();

  if (trimmed === "SN SA JEDNIM VOZILOM") {
    return "Jedno vozilo";
  }

  if (trimmed === "SN SA NAJMANjE DVA VOZILA – BEZ SKRETANjA") {
    return "Najmanje dva vozila – bez skretanja";
  }

  if (trimmed === "SN SA NAJMANjE DVA VOZILA – SKRETANjE ILI PRELAZAK") {
    return "Najmanje dva vozila – skretanje ili prelazak";
  }

  if (trimmed === "SN SA PARKIRANIM VOZILIMA") {
    return "Parkirana vozila";
  }

  if (trimmed === "SN SA PEŠACIMA") {
    return "Pešaci";
  }

  // Return original if no match found
  return trimmed;
}

/**
 * Valid accident type labels for API filter (short format)
 */
export const VALID_ACCIDENT_TYPES = [
  "materijalna",
  "povredjeni",
  "poginuli",
] as const;

/**
 * Maps short accident type label to database format for filtering
 */
export function getAccidentTypeFilter(label: string): string {
  if (label === "materijalna") {
    return "Sa mat.stetom";
  }

  if (label === "povredjeni") {
    return "Sa povredjenim";
  }

  if (label === "poginuli") {
    return "Sa poginulim";
  }

  // Fallback
  return label;
}
