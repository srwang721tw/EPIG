/**
 * @fileoverview Random disaster and bonus event system.
 *
 * Events fire every 10–30 game days. Each event checks the player's
 * inventory for counteracting items before applying penalties.
 */

import { ITEM_TYPE_MAP } from '../data/itemTypes.js';

const MIN_DAYS_BETWEEN_EVENTS = 10;
const MAX_DAYS_BETWEEN_EVENTS = 30;

/**
 * @typedef {Object} GameEvent
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {string} description
 * @property {string|null} countersItem - item id that blocks/reduces this event
 * @property {boolean} isPositive
 * @property {Function} apply - (state, itemUsed: bool) => void
 */

/** @type {GameEvent[]} */
const RANDOM_EVENTS = [
  {
    id: 'epidemic',
    name: '口蹄疫爆發',
    emoji: '🦷',
    description: '隨機一個豬舍的所有豬健康 -30，若未使用疫苗每天持續 -10。',
    countersItem: 'vaccine',
    isPositive: false,
    apply(state, itemUsed) {
      const pens = Object.values(state.pens);
      if (pens.length === 0) return;
      const targetPen = pens[Math.floor(Math.random() * pens.length)];
      for (const id of targetPen.pigIds) {
        const pig = state.pigs[id];
        if (pig?.isAlive) {
          if (!itemUsed) {
            pig.health = Math.max(0, pig.health - 30);
            pig.hasEpidemic = true;
          }
        }
      }
      if (!itemUsed) {
        state.activeDebuffs = state.activeDebuffs || {};
        state.activeDebuffs.epidemic = { penId: targetPen.id, untilDay: state.day + 3 };
      }
    },
  },
  {
    id: 'typhoon',
    name: '颱風來襲',
    emoji: '🌀',
    description: '全部豬舍乾淨度歸零，豬健康 -15。',
    countersItem: 'typhoon_proof',
    isPositive: false,
    apply(state, itemUsed) {
      for (const pen of Object.values(state.pens)) {
        if (!itemUsed) {
          pen.cleanliness = 0;
          for (const id of pen.pigIds) {
            const pig = state.pigs[id];
            if (pig?.isAlive) pig.health = Math.max(0, pig.health - 15);
          }
        } else {
          // With item: only 20% penalty
          pen.cleanliness = Math.max(0, pen.cleanliness - 20);
          for (const id of pen.pigIds) {
            const pig = state.pigs[id];
            if (pig?.isAlive) pig.health = Math.max(0, pig.health - 3);
          }
        }
      }
    },
  },
  {
    id: 'earthquake',
    name: '地震來了',
    emoji: '🌊',
    description: '隨機一個豬舍暫時降一個 tier（3 天），豬好感 -20。',
    countersItem: 'earthquake_insurance',
    isPositive: false,
    apply(state, itemUsed) {
      const pens = Object.values(state.pens);
      if (pens.length === 0) return;
      const targetPen = pens[Math.floor(Math.random() * pens.length)];
      if (!itemUsed) {
        targetPen.tempTierReduction = 1;
        targetPen.tempTierUntilDay = state.day + 3;
        for (const id of targetPen.pigIds) {
          const pig = state.pigs[id];
          if (pig?.isAlive) pig.affection = Math.max(0, pig.affection - 20);
        }
      } else {
        for (const id of targetPen.pigIds) {
          const pig = state.pigs[id];
          if (pig?.isAlive) pig.affection = Math.max(0, pig.affection - 10);
        }
      }
    },
  },
  {
    id: 'wolf',
    name: '大野狼入侵',
    emoji: '🐺',
    description: '隨機一個豬舍損失一隻豬。',
    countersItem: 'electric_fence',
    altCounterItem: 'guard_dog',
    isPositive: false,
    apply(state, itemUsed, altItemUsed) {
      const pens = Object.values(state.pens);
      if (pens.length === 0) return;
      const targetPen = pens[Math.floor(Math.random() * pens.length)];
      const livePigs = targetPen.pigIds
        .map(id => state.pigs[id])
        .filter(p => p?.isAlive);
      if (livePigs.length === 0) return;

      // electric fence = full block
      if (itemUsed) return;
      // guard dog = 70% block
      if (altItemUsed && Math.random() < 0.7) {
        state.events.push({ type: 'wolf_blocked', message: '🐕 看門狗英勇擊退了大野狼！' });
        return;
      }
      const victim = livePigs[Math.floor(Math.random() * livePigs.length)];
      victim.health = 0;
      // will be caught by healthSystem on next tick
    },
  },
  {
    id: 'drought',
    name: '大旱警報',
    emoji: '☀️',
    description: '飼料消耗量翻倍（1 天），未及時餵豬健康 -20。',
    countersItem: 'water_tank',
    isPositive: false,
    apply(state, itemUsed) {
      if (!itemUsed) {
        state.activeDebuffs = state.activeDebuffs || {};
        state.activeDebuffs.drought = { multiplier: 2, untilDay: state.day + 1 };
        for (const pig of Object.values(state.pigs)) {
          if (pig?.isAlive) pig.health = Math.max(0, pig.health - 20);
        }
      }
    },
  },
  {
    id: 'market_crash',
    name: '市場大崩盤',
    emoji: '💸',
    description: '未來 3 天賣豬價格減半。',
    countersItem: 'black_market',
    isPositive: false,
    apply(state, itemUsed) {
      if (!itemUsed) {
        state.activeDebuffs = state.activeDebuffs || {};
        state.activeDebuffs.marketCrash = { multiplier: 0.5, untilDay: state.day + 3 };
      }
    },
  },
  {
    id: 'fair',
    name: '農業博覽會',
    emoji: '🎉',
    description: '未來 2 天賣豬價格翻倍！',
    countersItem: null,
    isPositive: true,
    apply(state) {
      state.activeBonuses = state.activeBonuses || {};
      state.activeBonuses.fair = { multiplier: 2, untilDay: state.day + 2 };
    },
  },
  {
    id: 'food_festival',
    name: '美食節評選',
    emoji: '👑',
    description: '有一隻豬被選中評比，好感≥80 且健康≥80 可獲大獎！',
    countersItem: null,
    isPositive: true,
    apply(state) {
      const livePigs = Object.values(state.pigs).filter(p => p?.isAlive);
      if (livePigs.length === 0) return;
      const candidate = livePigs[Math.floor(Math.random() * livePigs.length)];
      if (candidate.affection >= 80 && candidate.health >= 80) {
        const prize = 1000 + Math.floor(Math.random() * 2000);
        state.coins += prize;
        state.events.push({
          type: 'prize',
          pigId: candidate.id,
          message: `🏆 ${candidate.name} 在美食節奪冠！獲得 ${prize} 金幣！`,
        });
      } else {
        state.events.push({
          type: 'prize_fail',
          pigId: candidate.id,
          message: `😔 ${candidate.name} 參加評選，但狀態不夠好，遺憾落選。`,
        });
      }
    },
  },
];

/**
 * Schedules the next random event day on state if not set.
 * @param {Object} state
 */
export function scheduleNextEvent(state) {
  if (state.nextEventDay === null || state.nextEventDay === undefined) {
    state.nextEventDay = state.day + MIN_DAYS_BETWEEN_EVENTS +
      Math.random() * (MAX_DAYS_BETWEEN_EVENTS - MIN_DAYS_BETWEEN_EVENTS);
  }
}

/**
 * Checks if a random event should fire, picks one, and applies it.
 * Returns the triggered event definition (or null) for UI display.
 * @param {Object} state
 * @returns {GameEvent|null}
 */
export function checkAndFireEvent(state) {
  if (state.day < state.nextEventDay) return null;

  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];

  // Check inventory for countering item
  const inventory = state.inventory || {};
  let itemUsed = false;
  let altItemUsed = false;

  if (event.countersItem && inventory[event.countersItem] > 0) {
    itemUsed = true;
    // Auto-use items are consumed automatically
    const itemDef = ITEM_TYPE_MAP[event.countersItem];
    if (itemDef?.autoUse) {
      inventory[event.countersItem]--;
    }
  }
  if (event.altCounterItem && inventory[event.altCounterItem] > 0) {
    altItemUsed = true;
    const itemDef = ITEM_TYPE_MAP[event.altCounterItem];
    if (itemDef?.autoUse) inventory[event.altCounterItem]--;
  }

  event.apply(state, itemUsed, altItemUsed);

  // Schedule next event
  state.nextEventDay = state.day + MIN_DAYS_BETWEEN_EVENTS +
    Math.random() * (MAX_DAYS_BETWEEN_EVENTS - MIN_DAYS_BETWEEN_EVENTS);

  // Store triggered event for UI to show
  state.pendingEventDisplay = {
    ...event,
    itemUsed,
    altItemUsed,
  };

  return event;
}

/**
 * Applies ongoing debuff ticks (epidemic, drought, etc.).
 * @param {Object} state
 * @param {number} deltaHours
 */
export function applyActiveDebuffs(state, deltaHours) {
  const debuffs = state.activeDebuffs || {};

  if (debuffs.epidemic && state.day < debuffs.epidemic.untilDay) {
    const pen = state.pens[debuffs.epidemic.penId];
    if (pen) {
      for (const id of pen.pigIds) {
        const pig = state.pigs[id];
        if (pig?.isAlive) pig.health = Math.max(0, pig.health - 10 / 24 * deltaHours);
      }
    }
  } else if (debuffs.epidemic) {
    delete debuffs.epidemic;
  }
}
