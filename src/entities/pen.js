/**
 * @fileoverview Pig pen entity factory.
 */

import { PEN_TIER_MAP } from '../data/penTiers.js';

let nextPenId = 1;

/**
 * Creates a new pen state object.
 * @param {number} tier - starting tier (1–7)
 * @returns {Object} pen state
 */
export function createPen(tier = 1) {
  const tierData = PEN_TIER_MAP[tier];
  if (!tierData) throw new Error(`Unknown pen tier: ${tier}`);
  return {
    id: `pen_${nextPenId++}`,
    tier,
    cleanliness: 100,
    pigIds: [],
    // Temporary tier reduction from earthquake event (null = no reduction)
    tempTierReduction: 0,
    tempTierUntilDay: null,
  };
}

/**
 * Returns the effective tier (accounting for temporary earthquake reduction).
 * @param {Object} pen
 * @param {number} currentDay
 * @returns {number}
 */
export function effectiveTier(pen, currentDay) {
  if (pen.tempTierReduction > 0 && currentDay < pen.tempTierUntilDay) {
    return Math.max(1, pen.tier - pen.tempTierReduction);
  }
  return pen.tier;
}

/**
 * Restores pen id counter from saved state.
 * @param {number} maxId
 */
export function restorePenIdCounter(maxId) {
  nextPenId = maxId + 1;
}
