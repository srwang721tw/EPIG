/**
 * @fileoverview Converts real elapsed milliseconds into game ticks.
 *
 * 1 game day = 2 real hours = 7,200,000 ms
 * Offline catch-up is capped at 8 real hours to prevent extreme state jumps.
 */

export const MS_PER_GAME_DAY = 2 * 60 * 60 * 1000;
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

/**
 * Returns the number of real milliseconds elapsed since lastSavedAt,
 * capped at MAX_OFFLINE_MS.
 * @param {number} lastSavedAt - timestamp from Date.now()
 * @returns {number} elapsed ms (capped)
 */
export function elapsedMs(lastSavedAt) {
  return Math.min(Date.now() - lastSavedAt, MAX_OFFLINE_MS);
}

/**
 * Converts ms to fractional game days.
 * @param {number} ms
 * @returns {number}
 */
export function msToGameDays(ms) {
  return ms / MS_PER_GAME_DAY;
}

/**
 * Converts ms to fractional real hours.
 * @param {number} ms
 * @returns {number}
 */
export function msToHours(ms) {
  return ms / (60 * 60 * 1000);
}
