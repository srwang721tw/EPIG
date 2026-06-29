/**
 * @fileoverview Pig breeding logic.
 *
 * Conditions: pen has ≥1 male + ≥1 female, both health > 70,
 * both age > 3 days → 5% chance per game day → produce 1 piglet.
 * Piglet rarity drawn from standard gacha weights (parent breed irrelevant).
 */

import { createPig } from '../entities/pig.js';
import { drawPig } from '../data/gachaPools.js';

const MIN_HEALTH_TO_BREED = 70;
const MIN_AGE_DAYS_TO_BREED = 3;
const BREED_CHANCE_PER_DAY = 0.05;

/**
 * Checks all pens for breeding opportunities each tick.
 * @param {Object} state
 * @param {number} deltaDays - fractional game days elapsed
 */
export function checkBreeding(state, deltaDays) {
  for (const pen of Object.values(state.pens)) {
    const livePigs = pen.pigIds
      .map(id => state.pigs[id])
      .filter(p => p?.isAlive);

    const males = livePigs.filter(p =>
      p.isMale &&
      p.health >= MIN_HEALTH_TO_BREED &&
      p.ageDays >= MIN_AGE_DAYS_TO_BREED
    );
    const females = livePigs.filter(p =>
      !p.isMale &&
      p.health >= MIN_HEALTH_TO_BREED &&
      p.ageDays >= MIN_AGE_DAYS_TO_BREED
    );

    if (males.length === 0 || females.length === 0) continue;

    // Probability scales with elapsed days
    const breedRoll = Math.random();
    if (breedRoll < BREED_CHANCE_PER_DAY * deltaDays) {
      spawnPiglet(pen, state);
    }
  }
}

/**
 * Creates a piglet with a gacha-random breed and adds it to the pen.
 * @param {Object} pen
 * @param {Object} state
 */
function spawnPiglet(pen, state) {
  const typeId = drawPig(); // parent breed does NOT influence this
  const piglet = createPig(typeId);
  piglet.ageDays = 0;
  piglet.penId = pen.id;
  piglet.isBaby = true; // unsellable until age >= 3 days

  state.pigs[piglet.id] = piglet;
  pen.pigIds.push(piglet.id);

  state.events.push({
    type: 'birth',
    pigId: piglet.id,
    penId: pen.id,
    message: `🐣 一隻小豬誕生了！牠叫 ${piglet.name}，是${piglet.isMale ? '公' : '母'}豬。`,
  });
}
