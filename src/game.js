/**
 * @fileoverview GameEngine: initializes state, runs the tick loop, exposes
 * player actions, and emits UI update events via a simple event bus.
 */

import { createPig, sellPrice } from './entities/pig.js';
import { createPen } from './entities/pen.js';
import { PIG_TYPE_MAP } from './data/pigTypes.js';
import { FEED_TYPE_MAP } from './data/feedTypes.js';
import { PEN_TIER_MAP, PEN_TIERS } from './data/penTiers.js';
import { ITEM_TYPE_MAP } from './data/itemTypes.js';
import { GACHA_POOLS } from './data/gachaPools.js';
import { saveGame, loadGame } from './save.js';
import { elapsedMs, msToHours, msToGameDays } from './systems/timeSystem.js';
import { applyTimeDelta } from './systems/healthSystem.js';
import { checkDiseaseSpread, removeDeadPig } from './systems/diseaseSystem.js';
import { checkBreeding } from './systems/breedingSystem.js';
import { scheduleNextEvent, checkAndFireEvent, applyActiveDebuffs } from './systems/eventSystem.js';

const TICK_INTERVAL_MS = 10_000; // real-time tick every 10 seconds
const DEFAULT_PET_COOLDOWN_MS = 30 * 60 * 1000; // 30 min default
const PET_AFFECTION_DEFAULT = 10;

/** Minimal initial game state. */
function createInitialState() {
  const starterPen = createPen(1);
  const starterPig = createPig('mini');
  starterPig.penId = starterPen.id;
  starterPen.pigIds = [starterPig.id];

  return {
    coins: 500,
    day: 0,
    lastSavedAt: Date.now(),
    pigs: { [starterPig.id]: starterPig },
    pens: { [starterPen.id]: starterPen },
    inventory: { scraps: 3 },
    itemInventory: {},
    gachaPity: { pig: 0, feed: 0, pen: 0, item: 0 },
    events: [],
    activeDebuffs: {},
    activeBonuses: {},
    nextEventDay: null,
    pendingEventDisplay: null,
  };
}

export class GameEngine {
  constructor() {
    this.state = null;
    this._listeners = {};
    this._tickTimer = null;
  }

  /** Initializes the engine: loads save or creates fresh state. */
  init() {
    const saved = loadGame();
    if (saved) {
      this.state = saved;
      // Apply offline time delta
      const delta = elapsedMs(this.state.lastSavedAt);
      if (delta > 0) this._applyDelta(delta);
    } else {
      this.state = createInitialState();
    }
    scheduleNextEvent(this.state);
    this._startTick();
    this.emit('stateChanged');
  }

  // ─── Tick ────────────────────────────────────────────────────────────────

  _startTick() {
    this._lastTickAt = Date.now();
    this._tickTimer = setInterval(() => this._tick(), TICK_INTERVAL_MS);
  }

  _tick() {
    const now = Date.now();
    const delta = now - this._lastTickAt;
    this._lastTickAt = now;
    this._applyDelta(delta);
    saveGame(this.state);
    this.emit('stateChanged');
  }

  _applyDelta(deltaMs) {
    const state = this.state;
    const deltaHours = msToHours(deltaMs);
    const deltaDays = msToGameDays(deltaMs);

    applyTimeDelta(state, deltaMs);
    checkDiseaseSpread(state, deltaMs);
    checkBreeding(state, deltaDays);
    applyActiveDebuffs(state, deltaHours);
    checkAndFireEvent(state);
    this._expireDebuffsAndBonuses();
  }

  _expireDebuffsAndBonuses() {
    const { day, activeDebuffs, activeBonuses } = this.state;
    for (const key of Object.keys(activeDebuffs || {})) {
      if (day >= activeDebuffs[key].untilDay) delete activeDebuffs[key];
    }
    for (const key of Object.keys(activeBonuses || {})) {
      if (day >= activeBonuses[key].untilDay) delete activeBonuses[key];
    }
  }

  // ─── Player Actions ───────────────────────────────────────────────────────

  /** @returns {boolean} success */
  petPig(pigId) {
    const pig = this.state.pigs[pigId];
    if (!pig || !pig.isAlive) return false;

    const breed = PIG_TYPE_MAP[pig.typeId];
    const cooldownMs = (breed.special.petCooldownMin ?? 30) * 60 * 1000;
    const now = Date.now();
    if (now - pig.lastPetMs < cooldownMs) return false;

    const affectionGain = (breed.special.affectionPerPet ?? PET_AFFECTION_DEFAULT)
      * (breed.special.affectionGainMult ?? 1);

    pig.affection = Math.min(100, pig.affection + affectionGain);
    pig.lastPetMs = now;
    this._save();
    this.emit('stateChanged');
    return true;
  }

  /**
   * Feed a pig one unit of the specified feed type.
   * @param {string} pigId
   * @param {string} feedId
   * @returns {boolean} success
   */
  feedPig(pigId, feedId) {
    const pig = this.state.pigs[pigId];
    const feed = FEED_TYPE_MAP[feedId];
    if (!pig || !pig.isAlive || !feed) return false;

    const stock = this.state.inventory[feedId] ?? 0;
    if (stock <= 0) return false;

    this.state.inventory[feedId]--;

    let hungerRestore = feed.hungerRestore;
    let healthBonus = feed.healthBonus;
    let affectionBonus = feed.affectionBonus;

    // 神農豬: treat all feed as rare-level minimum
    const breed = PIG_TYPE_MAP[pig.typeId];
    if (breed.special.upgradeFeedToRare) {
      hungerRestore = Math.max(hungerRestore, 45);
      healthBonus = Math.max(healthBonus, 3);
      affectionBonus = Math.max(affectionBonus, 2);
    }

    pig.hunger = Math.min(100, pig.hunger + hungerRestore);
    pig.health = Math.min(100, pig.health + healthBonus);
    pig.affection = Math.min(100, pig.affection + affectionBonus);

    // Track feed quality for sell price
    pig.totalFeedQuality += feed.rarity;
    pig.feedCount++;

    this._save();
    this.emit('stateChanged');
    return true;
  }

  /**
   * Sell a live pig.
   * @param {string} pigId
   * @returns {number} coins earned (0 if failed)
   */
  sellPig(pigId) {
    const pig = this.state.pigs[pigId];
    if (!pig || !pig.isAlive) return 0;
    if (pig.isBaby && pig.ageDays < 3) return 0;

    let price = sellPrice(pig);

    // Apply market bonus/debuff
    const { activeBonuses, activeDebuffs } = this.state;
    if (activeBonuses?.fair) price = Math.round(price * activeBonuses.fair.multiplier);
    if (activeDebuffs?.marketCrash) price = Math.round(price * activeDebuffs.marketCrash.multiplier);

    this.state.coins += price;
    const pen = pig.penId ? this.state.pens[pig.penId] : null;
    if (pen) pen.pigIds = pen.pigIds.filter(id => id !== pigId);
    delete this.state.pigs[pigId];

    this._save();
    this.emit('stateChanged');
    return price;
  }

  /**
   * Buy feed from the shop.
   * @param {string} feedId
   * @param {number} qty
   * @returns {boolean} success
   */
  buyFeed(feedId, qty = 1) {
    const feed = FEED_TYPE_MAP[feedId];
    if (!feed) return false;
    const cost = feed.price * qty;
    if (this.state.coins < cost) return false;

    this.state.coins -= cost;
    this.state.inventory[feedId] = (this.state.inventory[feedId] ?? 0) + qty;
    this._save();
    this.emit('stateChanged');
    return true;
  }

  /**
   * Buy a new pig from the shop.
   * @param {string} typeId
   * @returns {string|null} new pig id, or null if failed
   */
  buyPig(typeId) {
    const breed = PIG_TYPE_MAP[typeId];
    if (!breed) return null;
    if (this.state.coins < breed.buyPrice) return null;

    // Find a pen with space
    const pen = this._findPenWithSpace();
    if (!pen) return null;

    this.state.coins -= breed.buyPrice;
    const pig = createPig(typeId);
    pig.penId = pen.id;
    pen.pigIds.push(pig.id);
    this.state.pigs[pig.id] = pig;

    this._save();
    this.emit('stateChanged');
    return pig.id;
  }

  /**
   * Upgrade a pen to the next tier.
   * @param {string} penId
   * @returns {boolean} success
   */
  upgradePen(penId) {
    const pen = this.state.pens[penId];
    if (!pen) return false;
    const nextTier = pen.tier + 1;
    const tierData = PEN_TIER_MAP[nextTier];
    if (!tierData) return false;
    if (this.state.coins < tierData.upgradeCost) return false;

    this.state.coins -= tierData.upgradeCost;
    pen.tier = nextTier;
    this._save();
    this.emit('stateChanged');
    return true;
  }

  /**
   * Buy a new pen (starts at tier 1).
   * @returns {string|null} new pen id or null if insufficient funds
   */
  buyNewPen() {
    const cost = 300;
    if (this.state.coins < cost) return null;
    this.state.coins -= cost;
    const pen = createPen(1);
    this.state.pens[pen.id] = pen;
    this._save();
    this.emit('stateChanged');
    return pen.id;
  }

  /**
   * Clean a pen (restore cleanliness to 100).
   * @param {string} penId
   */
  cleanPen(penId) {
    const pen = this.state.pens[penId];
    if (!pen) return;
    pen.cleanliness = 100;
    this._save();
    this.emit('stateChanged');
  }

  /**
   * Remove a dead pig from a pen.
   * @param {string} pigId
   */
  cleanDeadPig(pigId) {
    removeDeadPig(pigId, this.state);
    this._save();
    this.emit('stateChanged');
  }

  /**
   * Perform a gacha pull.
   * @param {string} poolId - 'pig' | 'feed' | 'pen' | 'item'
   * @param {number} count - 1 or 10
   * @returns {Array<{type: string, id: string|number}>} results
   */
  gachaPull(poolId, count = 1) {
    const pool = GACHA_POOLS[poolId];
    if (!pool) return [];
    const cost = count === 10 ? pool.tenCost : pool.singleCost;
    if (this.state.coins < cost) return [];

    this.state.coins -= cost;
    const results = [];
    const pity = this.state.gachaPity;

    for (let i = 0; i < count; i++) {
      pity[poolId]++;

      const isSuperPity = pool.superPityThreshold && pity[poolId] >= pool.superPityThreshold;
      const isPity = pity[poolId] >= pool.pityThreshold;

      let result;
      if (isSuperPity) {
        result = pool.pityDraw(true);
        pity[poolId] = 0;
      } else if (isPity) {
        result = pool.pityDraw(false);
        pity[poolId] = 0;
      } else {
        result = pool.draw();
      }

      results.push({ type: poolId, value: result });

      // Add to inventory
      if (poolId === 'pig') {
        // Pig goes to first pen with space, or nowhere if no space
        const pen = this._findPenWithSpace();
        if (pen) {
          const pig = createPig(result);
          pig.penId = pen.id;
          pen.pigIds.push(pig.id);
          this.state.pigs[pig.id] = pig;
          results[results.length - 1].pigId = pig.id;
        } else {
          results[results.length - 1].noSpace = true;
        }
      } else if (poolId === 'feed') {
        this.state.inventory[result] = (this.state.inventory[result] ?? 0) + 3;
      } else if (poolId === 'pen') {
        const pen = createPen(result);
        this.state.pens[pen.id] = pen;
        results[results.length - 1].penId = pen.id;
      } else if (poolId === 'item') {
        this.state.itemInventory[result] = (this.state.itemInventory[result] ?? 0) + 1;
        // Also add to inventory for event system compatibility
        this.state.inventory[result] = (this.state.inventory[result] ?? 0) + 1;
      }
    }

    this._save();
    this.emit('stateChanged');
    return results;
  }

  /**
   * Manually use an item from inventory.
   * @param {string} itemId
   * @returns {boolean}
   */
  useItem(itemId) {
    if ((this.state.inventory[itemId] ?? 0) <= 0) return false;
    this.state.inventory[itemId]--;
    this.state.itemInventory[itemId] = Math.max(0, (this.state.itemInventory[itemId] ?? 1) - 1);
    this._save();
    this.emit('stateChanged');
    return true;
  }

  /** Clears pending event display after UI has shown it. */
  clearPendingEvent() {
    this.state.pendingEventDisplay = null;
    this.state.events = [];
  }

  // ─── Event Bus ────────────────────────────────────────────────────────────

  on(event, cb) {
    (this._listeners[event] = this._listeners[event] || []).push(cb);
  }

  emit(event, data) {
    for (const cb of (this._listeners[event] || [])) cb(data);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  _findPenWithSpace() {
    for (const pen of Object.values(this.state.pens)) {
      const tier = PEN_TIER_MAP[pen.tier];
      const livePigs = pen.pigIds.filter(id => this.state.pigs[id]?.isAlive);
      if (livePigs.length < tier.capacity) return pen;
    }
    return null;
  }

  _save() {
    saveGame(this.state);
  }
}
