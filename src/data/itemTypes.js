/**
 * @fileoverview Disaster-prevention item definitions for the gacha item pool.
 */

/**
 * @typedef {Object} ItemType
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {string} description
 * @property {string} counters - event id this item counters
 * @property {boolean} autoUse - if true, triggers automatically when matching event fires
 */

/** @type {ItemType[]} */
export const ITEM_TYPES = [
  {
    id: 'vaccine',
    name: '疫苗注射包',
    emoji: '💉',
    description: '預防口蹄疫，使用後免疫 3 個遊戲天。',
    counters: 'epidemic',
    autoUse: false,
  },
  {
    id: 'typhoon_proof',
    name: '防颱豬舍加固',
    emoji: '🔩',
    description: '颱風來襲時保護豬舍不被弄髒，豬健康損失減少 80%。',
    counters: 'typhoon',
    autoUse: true,
  },
  {
    id: 'earthquake_insurance',
    name: '豬舍地震險',
    emoji: '📋',
    description: '地震後豬舍不降 tier，豬好感損失減半。',
    counters: 'earthquake',
    autoUse: true,
  },
  {
    id: 'electric_fence',
    name: '電子圍籬',
    emoji: '⚡',
    description: '大野狼入侵時自動阻擋，保護全部豬隻。',
    counters: 'wolf',
    autoUse: true,
  },
  {
    id: 'guard_dog',
    name: '神勇看門狗',
    emoji: '🐕',
    description: '大野狼入侵時有 70% 機率成功阻擋，失敗時看門狗自己會哭。',
    counters: 'wolf',
    autoUse: true,
  },
  {
    id: 'water_tank',
    name: '儲水設施',
    emoji: '🪣',
    description: '大旱時飼料消耗量不翻倍，豬健康維持正常。',
    counters: 'drought',
    autoUse: true,
  },
  {
    id: 'black_market',
    name: '黑市賣家許可證',
    emoji: '🕶️',
    description: '市場崩盤時賣豬價格不受影響，適合地下交易愛好者。',
    counters: 'market_crash',
    autoUse: false,
  },
];

export const ITEM_TYPE_MAP = Object.fromEntries(ITEM_TYPES.map(i => [i.id, i]));

export const ITEM_GACHA_WEIGHTS = [
  { id: 'guard_dog', weight: 25 },
  { id: 'water_tank', weight: 20 },
  { id: 'vaccine', weight: 20 },
  { id: 'typhoon_proof', weight: 15 },
  { id: 'earthquake_insurance', weight: 10 },
  { id: 'electric_fence', weight: 7 },
  { id: 'black_market', weight: 3 },
];
