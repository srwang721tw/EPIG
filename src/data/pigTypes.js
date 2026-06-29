/**
 * @fileoverview Pig breed definitions with stats and special abilities.
 */

/** @enum {number} */
export const Rarity = {
  COMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
};

export const RARITY_LABELS = {
  [Rarity.COMMON]: '普通',
  [Rarity.RARE]: '稀有',
  [Rarity.EPIC]: '史詩',
  [Rarity.LEGENDARY]: '傳說',
};

export const RARITY_COLORS = {
  [Rarity.COMMON]: '#a8c8a0',
  [Rarity.RARE]: '#7eb8e0',
  [Rarity.EPIC]: '#b07fc8',
  [Rarity.LEGENDARY]: '#e8a830',
};

/**
 * Gender bias: 0.5 = equal, >0.5 = more likely male, <0.5 = more likely female.
 * @typedef {Object} PigType
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {number} rarity
 * @property {number} buyPrice
 * @property {number} baseSell
 * @property {number} genderBias - probability of being male (0–1)
 * @property {string} description
 * @property {string} flavorText
 * @property {Object} special - special ability modifiers
 */

/** @type {PigType[]} */
export const PIG_TYPES = [
  {
    id: 'mini',
    name: '迷你豬',
    emoji: '🐷',
    rarity: Rarity.COMMON,
    buyPrice: 50,
    baseSell: 80,
    genderBias: 0.5,
    description: '小巧可愛的迷你豬，超愛在地上打滾。',
    flavorText: '躺著滾是一種生活態度。',
    special: {},
  },
  {
    id: 'native',
    name: '台灣土豬',
    emoji: '🐖',
    rarity: Rarity.COMMON,
    buyPrice: 120,
    baseSell: 200,
    genderBias: 0.5,
    description: '耐餓的本土豬，饑餓衰減速度減少 30%。',
    flavorText: '本土豬，有台灣魂，吃苦耐勞。',
    special: { hungerDecayMult: 0.7 },
  },
  {
    id: 'lazy',
    name: '懶豬',
    emoji: '😴',
    rarity: Rarity.COMMON,
    buyPrice: 60,
    baseSell: 90,
    genderBias: 0.7,
    description: '懶到連豬舍都不會亂弄，髒污衰減速度減少 20%。',
    flavorText: '躺著也是一種才能。（本人認為）',
    special: { penDirtyContribMult: 0.8 },
  },
  {
    id: 'clean',
    name: '愛乾淨豬',
    emoji: '🧼',
    rarity: Rarity.RARE,
    buyPrice: 250,
    baseSell: 400,
    genderBias: 0.3,
    description: '有潔癖，每小時自動幫豬舍清潔 +5。',
    flavorText: '牠嫌你的豬舍很臭，牠說的。',
    special: { autocleanPerHour: 5 },
  },
  {
    id: 'black',
    name: '黑毛豬',
    emoji: '🐗',
    rarity: Rarity.RARE,
    buyPrice: 300,
    baseSell: 600,
    genderBias: 0.5,
    description: '高檔食材代名詞，基礎賣價 ×1.5。',
    flavorText: '黑就是貴，這是定律。',
    special: { sellMult: 1.5 },
  },
  {
    id: 'panda',
    name: '胖達豬',
    emoji: '🐼',
    rarity: Rarity.RARE,
    buyPrice: 280,
    baseSell: 380,
    genderBias: 0.3,
    description: '長得像貓熊，好感度加成 ×2，本人不介意被誤認。',
    flavorText: '竹子？不，牠要吃松露。',
    special: { affectionGainMult: 2 },
  },
  {
    id: 'musk',
    name: '麝香豬',
    emoji: '✨',
    rarity: Rarity.EPIC,
    buyPrice: 800,
    baseSell: 1200,
    genderBias: 0.5,
    description: '天生散發魅力，讓同豬舍所有豬好感度每小時 +1。',
    flavorText: '豬緣極好，連野狼都不忍心吃牠。',
    special: { penAffectionAuraPerHour: 1 },
  },
  {
    id: 'shennong',
    name: '神農豬',
    emoji: '🌿',
    rarity: Rarity.EPIC,
    buyPrice: 1000,
    baseSell: 1500,
    genderBias: 0.7,
    description: '吃廚餘也能獲得優質飼料效果，是豬界的養生達人。',
    flavorText: '「我自己嘗百草。」——神農豬',
    special: { upgradeFeedToRare: true },
  },
  {
    id: 'idol',
    name: '偶像豬',
    emoji: '🌟',
    rarity: Rarity.EPIC,
    buyPrice: 1200,
    baseSell: 1800,
    genderBias: 0.2,
    description: '互動一次好感 +25，冷卻時間只需 10 分鐘。',
    flavorText: '出道就是巔峰，巔峰即是牠。',
    special: { affectionPerPet: 25, petCooldownMin: 10 },
  },
  {
    id: 'ironpig',
    name: '豬堅強',
    emoji: '💪',
    rarity: Rarity.LEGENDARY,
    buyPrice: 5000,
    baseSell: 8000,
    genderBias: 0.8,
    description: '死亡時有 30% 機率復活，健康回至 10。',
    flavorText: '傳說中的不死豬，被賣了也能跑回來。',
    special: { reviveChance: 0.3 },
  },
  {
    id: 'dragon',
    name: '龍豬',
    emoji: '🐉',
    rarity: Rarity.LEGENDARY,
    buyPrice: 8000,
    baseSell: 20000,
    genderBias: 0.5,
    description: '基礎賣價 ×3，據說真的會飛。',
    flavorText: '豬會飛了，你的夢也實現了。',
    special: { sellMult: 3, canFly: true },
  },
  {
    id: 'pigotaro',
    name: '豬太郎',
    emoji: '🌀',
    rarity: Rarity.LEGENDARY,
    buyPrice: 10000,
    baseSell: 15000,
    genderBias: 0.8,
    description: '可同時在兩個豬舍出現，分身術大師。',
    flavorText: '時空豬，物理學家表示看不懂。',
    special: { canClone: true },
  },
];

/** Map from id to PigType for O(1) lookup. */
export const PIG_TYPE_MAP = Object.fromEntries(PIG_TYPES.map(p => [p.id, p]));

/**
 * Gacha probability weights by rarity.
 * @type {Array<{rarity: number, weight: number}>}
 */
export const PIG_GACHA_WEIGHTS = [
  { rarity: Rarity.COMMON, weight: 60 },
  { rarity: Rarity.RARE, weight: 25 },
  { rarity: Rarity.EPIC, weight: 12 },
  { rarity: Rarity.LEGENDARY, weight: 3 },
];
