/**
 * @fileoverview Pig entity factory and state operations.
 */

import { PIG_TYPE_MAP } from '../data/pigTypes.js';

let nextPigId = 1;

const PIG_NAMES = [
  '麻糬', '波霸', '湯圓', '珍珠', '糯米', '芋圓', '芝麻', '紅豆', '綠豆', '花生',
  '奶茶', '布丁', '提拉米蘇', '拿鐵', '卡布', '摩卡', '焦糖', '榛果', '抹茶', '草莓',
  '哈密瓜', '西瓜', '荔枝', '芒果', '木瓜', '鳳梨', '椰子', '龍眼', '蓮霧', '楊桃',
];

/** @returns {string} a random cute pig name */
function randomName() {
  return PIG_NAMES[Math.floor(Math.random() * PIG_NAMES.length)];
}

/**
 * Creates a new pig state object.
 * @param {string} typeId - breed id from PIG_TYPE_MAP
 * @param {boolean|null} isMale - null means random
 * @returns {Object} pig state
 */
export function createPig(typeId, isMale = null) {
  const breed = PIG_TYPE_MAP[typeId];
  if (!breed) throw new Error(`Unknown pig type: ${typeId}`);

  const genderRoll = Math.random();
  const male = isMale !== null ? isMale : genderRoll < breed.genderBias;

  return {
    id: `pig_${nextPigId++}`,
    typeId,
    name: randomName(),
    isMale: male,
    health: 80,
    hunger: 70,
    affection: 30,
    ageDays: 0,
    isAlive: true,
    isDead: false,
    deadSinceMs: null,
    lastPetMs: 0,
    totalFeedQuality: 0,
    feedCount: 0,
    penId: null,
  };
}

/**
 * Returns average feed quality score (1–5) for sell price calc.
 * Defaults to 1 if never fed.
 * @param {Object} pig
 * @returns {number}
 */
export function avgFeedQuality(pig) {
  if (pig.feedCount === 0) return 1;
  return pig.totalFeedQuality / pig.feedCount;
}

/**
 * Computes the sell price for a pig.
 * @param {Object} pig
 * @returns {number} rounded coin value
 */
export function sellPrice(pig) {
  const breed = PIG_TYPE_MAP[pig.typeId];
  const sellMult = breed.special.sellMult ?? 1;
  const feedMult = 1 + (avgFeedQuality(pig) - 1) * 0.1;
  const price = breed.baseSell
    * sellMult
    * (0.5 + pig.health / 200)
    * (1 + pig.affection / 200)
    * feedMult;
  return Math.round(price);
}

/**
 * Restores id counter from saved state (call on game load).
 * @param {number} maxId
 */
export function restorePigIdCounter(maxId) {
  nextPigId = maxId + 1;
}
