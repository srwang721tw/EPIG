/**
 * @fileoverview Gacha pool configurations with pity (保底) system.
 */

import { PIG_TYPES, PIG_GACHA_WEIGHTS, Rarity } from './pigTypes.js';
import { FEED_TYPES, FEED_GACHA_WEIGHTS, FeedRarity } from './feedTypes.js';
import { PEN_TIERS, PEN_GACHA_WEIGHTS } from './penTiers.js';
import { ITEM_TYPES, ITEM_GACHA_WEIGHTS } from './itemTypes.js';

/**
 * @typedef {Object} GachaPool
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {number} singleCost
 * @property {number} tenCost
 * @property {number} pityThreshold - guaranteed high-rarity pull at this count
 * @property {number} superPityThreshold - guaranteed legendary at this count (optional)
 * @property {Function} draw - returns one item from pool
 * @property {Function} pityCheck - returns override item if pity triggered
 */

/**
 * Weighted random draw from an array of {weight} items.
 * @param {Array<{weight: number}>} pool
 * @returns {number} selected index
 */
function weightedRandom(pool) {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= pool[i].weight;
    if (roll <= 0) return i;
  }
  return pool.length - 1;
}

/**
 * Draw a random pig type id.
 * @param {number|null} minRarity - if set, only draw from this rarity or higher
 * @returns {string} pig type id
 */
export function drawPig(minRarity = null) {
  let weights = PIG_GACHA_WEIGHTS;
  if (minRarity !== null) {
    weights = weights.map(w => ({ ...w, weight: w.rarity >= minRarity ? w.weight : 0 }));
  }
  const idx = weightedRandom(weights);
  const rarity = weights[idx].rarity;
  const candidates = PIG_TYPES.filter(p => p.rarity === rarity);
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

/**
 * Draw a random feed type id.
 * @param {number|null} minRarity
 * @returns {string} feed type id
 */
export function drawFeed(minRarity = null) {
  let weights = FEED_GACHA_WEIGHTS;
  if (minRarity !== null) {
    weights = weights.map(w => ({ ...w, weight: w.rarity >= minRarity ? w.weight : 0 }));
  }
  const idx = weightedRandom(weights);
  const rarity = weights[idx].rarity;
  const candidates = FEED_TYPES.filter(f => f.rarity === rarity);
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

/**
 * Draw a random pen tier number (2–7).
 * @param {number|null} minTier
 * @returns {number} pen tier
 */
export function drawPen(minTier = null) {
  let weights = PEN_GACHA_WEIGHTS.filter(w => w.tier >= 2);
  if (minTier !== null) {
    weights = weights.map(w => ({ ...w, weight: w.tier >= minTier ? w.weight : 0 }));
  }
  const idx = weightedRandom(weights);
  return weights[idx].tier;
}

/**
 * Draw a random item id.
 * @returns {string} item id
 */
export function drawItem() {
  const idx = weightedRandom(ITEM_GACHA_WEIGHTS);
  return ITEM_GACHA_WEIGHTS[idx].id;
}

export const GACHA_POOLS = {
  pig: {
    id: 'pig',
    name: '豬豬抽',
    emoji: '🐷',
    singleCost: 100,
    tenCost: 900,
    pityThreshold: 50,
    superPityThreshold: 100,
    pityMinRarity: Rarity.EPIC,
    superPityMinRarity: Rarity.LEGENDARY,
    draw: () => drawPig(),
    pityDraw: (superPity) => drawPig(superPity ? Rarity.LEGENDARY : Rarity.EPIC),
  },
  feed: {
    id: 'feed',
    name: '飼料抽',
    emoji: '🌾',
    singleCost: 50,
    tenCost: 450,
    pityThreshold: 30,
    superPityThreshold: null,
    pityMinRarity: FeedRarity.EPIC,
    draw: () => drawFeed(),
    pityDraw: () => drawFeed(FeedRarity.EPIC),
  },
  pen: {
    id: 'pen',
    name: '豬舍抽',
    emoji: '🏠',
    singleCost: 200,
    tenCost: 1800,
    pityThreshold: 20,
    superPityThreshold: null,
    pityMinTier: 4,
    draw: () => drawPen(),
    pityDraw: () => drawPen(4),
  },
  item: {
    id: 'item',
    name: '道具抽',
    emoji: '🎒',
    singleCost: 80,
    tenCost: 720,
    pityThreshold: 20,
    superPityThreshold: null,
    draw: () => drawItem(),
    pityDraw: () => drawItem(),
  },
};
