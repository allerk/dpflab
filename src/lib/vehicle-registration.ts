const DASHES = /[‐‑‒–—−]/g;

/**
 * Keeps customer-entered registration numbers searchable without assuming that
 * every vehicle uses the common Estonian `123 ABC` format.
 */
export function normalizeVehicleRegistrationNumber(value: string): string {
  return value
    .trim()
    .toLocaleUpperCase('et-EE')
    .replace(DASHES, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

export function isPlausibleVehicleRegistrationNumber(value: string): boolean {
  const normalized = normalizeVehicleRegistrationNumber(value);
  if (normalized.length < 2 || normalized.length > 40) return false;
  return /[\p{L}\p{N}]/u.test(normalized);
}
