/**
 * @fileoverview Feed type definitions with nutritional stats.
 */

/** @enum {number} */
export const FeedRarity = {
  COMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  DIVINE: 5,
};

export const FEED_RARITY_LABELS = {
  [FeedRarity.COMMON]: '普通',
  [FeedRarity.RARE]: '稀有',
  [FeedRarity.EPIC]: '史詩',
  [FeedRarity.LEGENDARY]: '傳說',
  [FeedRarity.DIVINE]: '神聖',
};

/**
 * @typedef {Object} FeedType
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {number} rarity
 * @property {number} price - cost per unit
 * @property {number} hungerRestore - hunger points restored (0–100)
 * @property {number} healthBonus - health bonus applied after eating
 * @property {number} affectionBonus - affection bonus applied after eating
 * @property {string} flavorText
 */

/** @type {FeedType[]} */
export const FEED_TYPES = [
  {
    id: 'scraps',
    name: '廚餘',
    emoji: '🗑️',
    rarity: FeedRarity.COMMON,
    price: 2,
    hungerRestore: 20,
    healthBonus: 0,
    affectionBonus: 0,
    flavorText: '環保愛地球，豬：……好吧。',
  },
  {
    id: 'peels',
    name: '果皮拼盤',
    emoji: '🍊',
    rarity: FeedRarity.COMMON,
    price: 5,
    hungerRestore: 30,
    healthBonus: 1,
    affectionBonus: 0,
    flavorText: '來自菜市場的愛，新鮮保證。',
  },
  {
    id: 'veggies',
    name: '有機蔬菜餐',
    emoji: '🥗',
    rarity: FeedRarity.RARE,
    price: 15,
    hungerRestore: 45,
    healthBonus: 3,
    affectionBonus: 2,
    flavorText: '網紅豬都在吃，拍起來很好看。',
  },
  {
    id: 'sweetpotato',
    name: '地瓜稀飯',
    emoji: '🍠',
    rarity: FeedRarity.RARE,
    price: 20,
    hungerRestore: 50,
    healthBonus: 4,
    affectionBonus: 3,
    flavorText: '台灣阿嬤的愛心料理，豬吃了想哭。',
  },
  {
    id: 'truffle',
    name: '松露拼盤',
    emoji: '🍄',
    rarity: FeedRarity.EPIC,
    price: 80,
    hungerRestore: 65,
    healthBonus: 8,
    affectionBonus: 8,
    flavorText: '豬：我值這個錢。（確實）',
  },
  {
    id: 'wagyu',
    name: '和牛壽喜燒',
    emoji: '🥩',
    rarity: FeedRarity.EPIC,
    price: 120,
    hungerRestore: 70,
    healthBonus: 10,
    affectionBonus: 10,
    flavorText: '豬吃牛，世界大亂，牛：？？？',
  },
  {
    id: 'lobster',
    name: '龍蝦套餐',
    emoji: '🦞',
    rarity: FeedRarity.LEGENDARY,
    price: 300,
    hungerRestore: 80,
    healthBonus: 15,
    affectionBonus: 15,
    flavorText: '米其林一星豬宴，需要提前預約。',
  },
  {
    id: 'abalone',
    name: '鮑魚燉補湯',
    emoji: '🐚',
    rarity: FeedRarity.LEGENDARY,
    price: 500,
    hungerRestore: 85,
    healthBonus: 18,
    affectionBonus: 18,
    flavorText: '豬的 Spa Day，吃完會發光。',
  },
  {
    id: 'buddha_jump',
    name: '神仙佛跳牆',
    emoji: '🏺',
    rarity: FeedRarity.DIVINE,
    price: 1500,
    hungerRestore: 100,
    healthBonus: 25,
    affectionBonus: 25,
    flavorText: '豬：我已成神。佛祖：……請節制。',
  },
];

export const FEED_TYPE_MAP = Object.fromEntries(FEED_TYPES.map(f => [f.id, f]));

export const FEED_GACHA_WEIGHTS = [
  { rarity: FeedRarity.COMMON, weight: 50 },
  { rarity: FeedRarity.RARE, weight: 30 },
  { rarity: FeedRarity.EPIC, weight: 15 },
  { rarity: FeedRarity.LEGENDARY, weight: 4 },
  { rarity: FeedRarity.DIVINE, weight: 1 },
];
