/**
 * Utility functions for turno validation
 */

/**
 * Splits an array into chunks of specified size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Normalizes different response formats from the turnos API
 */
export function normalizeTurnosResponse(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  } else if (data.turnos && Array.isArray(data.turnos)) {
    return data.turnos;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (typeof data === 'object' && data !== null) {
    return [data];
  }
  return [];
}

/**
 * Configuration constants for validation
 */
export const VALIDATION_CONFIG = {
  BATCH_SIZE: 10,
  BATCH_DELAY_MS: 1000,
} as const;






