/**
 * @fileoverview Pig pen tier definitions.
 */

/**
 * dirtyDecayPerPigPerHour: how much cleanliness drops per pig per real hour.
 *
 * @typedef {Object} PenTier
 * @property {number} tier
 * @property {string} name
 * @property {string} emoji
 * @property {number} capacity - max pigs
 * @property {number} upgradeCost - 0 for starter tier
 * @property {number} dirtyDecayPerPigPerHour
 * @property {number} healthBonus - passive health bonus to all pigs inside
 * @property {string} description
 * @property {string} flavorText
 */

/** @type {PenTier[]} */
export const PEN_TIERS = [
  {
    tier: 1,
    name: '路邊廢棄豬圈',
    emoji: '🪵',
    capacity: 2,
    upgradeCost: 0,
    dirtyDecayPerPigPerHour: 8,
    healthBonus: 0,
    description: '隨便撿來的廢材拼湊，一下雨就漏水。',
    flavorText: '豬：我要投訴，這不符合最低居住標準。',
  },
  {
    tier: 2,
    name: '傳統三合院豬舍',
    emoji: '🏯',
    capacity: 3,
    upgradeCost: 500,
    dirtyDecayPerPigPerHour: 5,
    healthBonus: 0,
    description: '有歷史感的傳統建築，也有歷史感的氣味。',
    flavorText: '阿公說：以前的豬都住這種，很好養。',
  },
  {
    tier: 3,
    name: '現代化養豬場',
    emoji: '🏭',
    capacity: 5,
    upgradeCost: 1500,
    dirtyDecayPerPigPerHour: 3,
    healthBonus: 2,
    description: '通過動物福利認證，有通風設備。',
    flavorText: '豬：嗯，好多了，可以接受。',
  },
  {
    tier: 4,
    name: '溫泉豬舍',
    emoji: '♨️',
    capacity: 7,
    upgradeCost: 5000,
    dirtyDecayPerPigPerHour: 1.5,
    healthBonus: 10,
    description: '豬每天泡湯，健康加成 +10，皮膚超好。',
    flavorText: '豬：這才是生活，關我什麼事，這本來就是我的。',
  },
  {
    tier: 5,
    name: '帝寶豬宅',
    emoji: '🏙️',
    capacity: 10,
    upgradeCost: 20000,
    dirtyDecayPerPigPerHour: 0.8,
    healthBonus: 15,
    description: '大安區門牌，管理費要繳不少，但值得。',
    flavorText: '豬：可以了，我滿意了。鄰居：請問你們豬舍有幾坪？',
  },
  {
    tier: 6,
    name: '陶朱隱園豬墅',
    emoji: '🌀',
    capacity: 15,
    upgradeCost: 80000,
    dirtyDecayPerPigPerHour: 0.3,
    healthBonus: 20,
    description: '螺旋式外觀，豬有專屬管家和 SPA 服務。',
    flavorText: '建築師：這是生態永續設計。豬：我也是生態的一部分。',
  },
  {
    tier: 7,
    name: '外太空豬站',
    emoji: '🚀',
    capacity: 20,
    upgradeCost: 500000,
    dirtyDecayPerPigPerHour: 0,
    healthBonus: 30,
    description: '無重力環境自動清潔，豬的心情永遠最佳。',
    flavorText: '豬：地球都在我腳下了，還養什麼豬，哦對，我就是豬。',
  },
];

export const PEN_TIER_MAP = Object.fromEntries(PEN_TIERS.map(p => [p.tier, p]));

export const PEN_GACHA_WEIGHTS = [
  { tier: 1, weight: 0 },
  { tier: 2, weight: 40 },
  { tier: 3, weight: 30 },
  { tier: 4, weight: 20 },
  { tier: 5, weight: 7 },
  { tier: 6, weight: 2 },
  { tier: 7, weight: 1 },
];
