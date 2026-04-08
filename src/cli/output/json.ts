/**
 * JSON Output Formatter
 *
 * Formats OwlResponse as JSON output.
 */

import type { OwlResponse } from '../../contracts';

/**
 * Format response as JSON
 */
export function formatJsonOutput(response: OwlResponse): string {
  return JSON.stringify(response, null, 2);
}