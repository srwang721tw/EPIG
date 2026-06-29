/**
 * @fileoverview Applies time-based stat decay and recovery to pigs and pens.
 */

import { PIG_TYPE_MAP } from '../data/pigTypes.js';
import { PEN_TIER_MAP } from '../data/penTiers.js';
import { msToHours, msToGameDays } from './timeSystem.js';
import { effectiveTier } from '../entities/pen.js';

const BASE_HUNGER_DECAY_PER_HOUR = 5;
const BASE_AFFECTION_DECAY_PER_HOUR = 1;
const HUNGER_HEALTH_DAMAGE_PER_HOUR = 3;
const DIRTY_HEALTH_DAMAGE_THRESHOLD = 30;
const DIRTY_HEALTH_DAMAGE_PER_HOUR = 2;

/**
 * Applies elapsed time decay to all pigs and pens in the game state.
 * Mutates state directly (called during tick and on offline catch-up).
 * @param {Object} state - full game state
 * @param {number} deltaMs - elapsed milliseconds
 */
export function applyTimeDelta(state, deltaMs) {
  const hours = msToHours(deltaMs);
  const days = msToGameDays(deltaMs);

  // Update pen cleanliness
  for (const pen of Object.values(state.pens)) {
    const tierData = PEN_TIER_MAP[effectiveTier(pen, state.day)];
    const decay = tierData.dirtyDecayPerPigPerHour * pen.pigIds.length * hours;
    pen.cleanliness = Math.max(0, pen.cleanliness - decay);

    // Expire temp tier reduction
    if (pen.tempTierReduction > 0 && state.day >= pen.tempTierUntilDay) {
      pen.tempTierReduction = 0;
      pen.tempTierUntilDay = null;
    }
  }

  // Update pigs
  for (const pig of Object.values(state.pigs)) {
    if (!pig.isAlive) continue;

    const breed = PIG_TYPE_MAP[pig.typeId];
    const pen = pig.penId ? state.pens[pig.penId] : null;

    // Age
    pig.ageDays += days;

    // Hunger decay
    const hungerDecayMult = breed.special.hungerDecayMult ?? 1;
    pig.hunger = Math.max(0, pig.hunger - BASE_HUNGER_DECAY_PER_HOUR * hungerDecayMult * hours);

    // Affection decay
    pig.affection = Math.max(0, pig.affection - BASE_AFFECTION_DECAY_PER_HOUR * hours);

    // Health damage from hunger
    if (pig.hunger === 0) {
      pig.health = Math.max(0, pig.health - HUNGER_HEALTH_DAMAGE_PER_HOUR * hours);
    }

    // Health damage from dirty pen
    if (pen && pen.cleanliness < DIRTY_HEALTH_DAMAGE_THRESHOLD) {
      pig.health = Math.max(0, pig.health - DIRTY_HEALTH_DAMAGE_PER_HOUR * hours);
    }

    // Pen health bonus
    if (pen) {
      const tierData = PEN_TIER_MAP[effectiveTier(pen, state.day)];
      if (tierData.healthBonus > 0 && pig.health < 100) {
        pig.health = Math.min(100, pig.health + (tierData.healthBonus / 24) * hours);
      }

      // Musk pig aura: penAffectionAuraPerHour bonus to all pen-mates
      const mushkPigsInPen = pen.pigIds
        .filter(id => id !== pig.id)
        .map(id => state.pigs[id])
        .filter(p => p?.isAlive && PIG_TYPE_MAP[p.typeId]?.special?.penAffectionAuraPerHour);
      for (const m of mushkPigsInPen) {
        const aura = PIG_TYPE_MAP[m.typeId].special.penAffectionAuraPerHour;
        pig.affection = Math.min(100, pig.affection + aura * hours);
      }

      // Clean pig auto-cleans pen
      if (breed.special.autocleanPerHour) {
        pen.cleanliness = Math.min(100, pen.cleanliness + breed.special.autocleanPerHour * hours);
      }
    }

    // Death check
    if (pig.health <= 0) {
      killPig(pig, state);
    }
  }

  // Advance game day counter
  state.day += days;
}

/**
 * Marks a pig as dead and records death time.
 * @param {Object} pig
 * @param {Object} state
 */
export function killPig(pig, state) {
  const breed = PIG_TYPE_MAP[pig.typeId];
  // Legendary 豬堅強: 30% revive chance
  if (breed.special.reviveChance && Math.random() < breed.special.reviveChance) {
    pig.health = 10;
    state.events.push({ type: 'revive', pigId: pig.id, message: `${pig.name} 從死亡邊緣復活了！（豬堅強！）` });
    return;
  }
  pig.isAlive = false;
  pig.isDead = true;
  pig.deadSinceMs = Date.now();
  state.events.push({ type: 'death', pigId: pig.id, message: `${pig.name} 死掉了……` });
}
