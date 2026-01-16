/**
 * Maps accident type strings to human-readable format
 * Handles variations in input data
 */
export function getAccidentTypeLabel(type: string): string {
  const normalized = type.trim().toLowerCase();

  if (
    normalized.includes("materijaln") ||
    normalized.includes("štetom") ||
    normalized.includes("stetom")
  ) {
    return "Sa materijalnom štetom";
  }

  if (
    normalized.includes("povređenim") ||
    normalized.includes("povredjenim") ||
    normalized.includes("povređen") ||
    normalized.includes("povredjen")
  ) {
    return "Sa povređenim";
  }

  if (normalized.includes("poginulim") || normalized.includes("poginul")) {
    return "Sa poginulim";
  }

  // Return original if no match found
  return type.trim();
}

/**
 * Maps category strings to human-readable format
 * Handles variations in input data
 */
export function getCategoryLabel(category: string): string {
  const normalized = category.trim().toLowerCase();

  // SN SA JEDNIM VOZILOM
  if (
    normalized.includes("jednim vozilom") ||
    normalized.includes("jedno vozilo")
  ) {
    return "SN sa jednim vozilom";
  }

  // SN SA NAJMANjE DVA VOZILA – BEZ SKRETANjA
  if (
    (normalized.includes("najmanje dva vozila") ||
      normalized.includes("najmanj dva vozila")) &&
    normalized.includes("bez skretanja")
  ) {
    return "Najmanje dva vozila – bez skretanja";
  }

  // SN SA NAJMANjE DVA VOZILA – SKRETANjE ILI PRELAZAK
  if (
    (normalized.includes("najmanje dva vozila") ||
      normalized.includes("najmanj dva vozila")) &&
    (normalized.includes("skretanje") || normalized.includes("prelazak"))
  ) {
    return "Najmanje dva vozila – skretanje ili prelazak";
  }

  // SN SA PARKIRANIM VOZILIMA
  if (
    normalized.includes("parkiranim vozilima") ||
    normalized.includes("parkiranim")
  ) {
    return "Parkirana vozila";
  }

  // SN SA PEŠACIMA
  if (
    normalized.includes("pešacima") ||
    normalized.includes("pesacima") ||
    normalized.includes("pešak") ||
    normalized.includes("pesak")
  ) {
    return "Pešaci";
  }

  // Return original if no match found
  return category.trim();
}
