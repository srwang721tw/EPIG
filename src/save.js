/**
 * @fileoverview localStorage save/load for game state.
 */

import { restorePigIdCounter } from './entities/pig.js';
import { restorePenIdCounter } from './entities/pen.js';

const SAVE_KEY = 'epig_save_v1';

/**
 * Persists the full game state to localStorage.
 * @param {Object} state
 */
export function saveGame(state) {
  state.lastSavedAt = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

/**
 * Loads and returns game state from localStorage, or null if no save exists.
 * Also restores entity id counters.
 * @returns {Object|null}
 */
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);

    // Restore id counters so new entities don't collide with saved ones
    const maxPigNum = Object.keys(state.pigs || {})
      .map(id => parseInt(id.replace('pig_', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    const maxPenNum = Object.keys(state.pens || {})
      .map(id => parseInt(id.replace('pen_', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);

    restorePigIdCounter(maxPigNum);
    restorePenIdCounter(maxPenNum);

    return state;
  } catch (e) {
    console.warn('Load failed:', e);
    return null;
  }
}

/**
 * Wipes the save slot (used by "New Game" flow).
 */
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
