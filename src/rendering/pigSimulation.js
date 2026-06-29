/**
 * @fileoverview Visual-only pig simulation for the canvas pen view.
 * Manages pig positions, movement, and behavioral states entirely
 * separately from game state. Game state is read for hints (hunger,
 * health, affection) but the simulation never writes to game state.
 */

const WANDER_SPEED = 28;   // px per second
const EAT_SPEED   = 40;
const SLEEP_SPEED = 10;
const BREED_SPEED = 35;

/**
 * @typedef {Object} VisualPig
 * @property {string} pigId
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} angle
 * @property {string} behavior - 'wander' | 'eat' | 'sleep' | 'idle' | 'breed'
 * @property {number} stateTimer - ms remaining in current state
 * @property {string|null} targetPigId - for breed behavior
 */

export class PenSimulation {
  /**
   * @param {number} width - canvas width
   * @param {number} height - canvas height
   * @param {{id: string, feedTroughArea: Object, sleepArea: Object}} layout
   */
  constructor(width, height, layout) {
    this.w = width;
    this.h = height;
    this.layout = layout;
    /** @type {Map<string, VisualPig>} */
    this.pigs = new Map();
  }

  /**
   * Syncs visual pigs with the current game state pig list for this pen.
   * Adds new pigs, removes gone ones, keeps existing positions.
   * @param {Object[]} gamePigs - pig objects from game state for this pen
   */
  sync(gamePigs) {
    const currentIds = new Set(gamePigs.map(p => p.id));

    // Remove pigs no longer in pen
    for (const id of this.pigs.keys()) {
      if (!currentIds.has(id)) this.pigs.delete(id);
    }

    // Add new pigs at random positions
    for (const pig of gamePigs) {
      if (!this.pigs.has(pig.id)) {
        const margin = 40;
        this.pigs.set(pig.id, {
          pigId: pig.id,
          x: margin + Math.random() * (this.w - margin * 2),
          y: margin + Math.random() * (this.h - margin * 2),
          vx: 0,
          vy: 0,
          angle: Math.random() * Math.PI * 2,
          behavior: 'idle',
          stateTimer: 0,
          targetPigId: null,
        });
      }
    }
  }

  /**
   * Steps the simulation forward by deltaMs.
   * @param {number} deltaMs
   * @param {Object[]} gamePigs - current game pig objects (for state hints)
   */
  update(deltaMs, gamePigs) {
    const dt = deltaMs / 1000;
    const pigMap = Object.fromEntries(gamePigs.map(p => [p.id, p]));

    for (const [id, vp] of this.pigs) {
      const gp = pigMap[id];
      if (!gp) continue;

      vp.stateTimer -= deltaMs;

      // Pick behavior when timer expires
      if (vp.stateTimer <= 0) {
        this._pickBehavior(vp, gp, gamePigs);
      }

      // Move according to behavior
      this._move(vp, gp, dt, gamePigs);

      // Clamp to canvas bounds
      const margin = 30;
      vp.x = Math.max(margin, Math.min(this.w - margin, vp.x));
      vp.y = Math.max(margin, Math.min(this.h - margin, vp.y));
    }
  }

  _pickBehavior(vp, gp, gamePigs) {
    if (!gp.isAlive) {
      vp.behavior = 'idle';
      vp.stateTimer = 9999999;
      return;
    }

    const roll = Math.random();

    // Dead/infected: stay still
    if (gp.isDead) { vp.behavior = 'idle'; vp.stateTimer = 9999999; return; }

    // Hungry → go eat
    if (gp.hunger < 40 && roll < 0.6) {
      vp.behavior = 'eat';
      vp.stateTimer = 4000 + Math.random() * 4000;
      return;
    }

    // Low health → sleep
    if (gp.health < 35 && roll < 0.55) {
      vp.behavior = 'sleep';
      vp.stateTimer = 6000 + Math.random() * 6000;
      return;
    }

    // High affection + opposite sex present → breed behavior
    if (gp.affection > 70 && gp.ageDays >= 3 && !gp.isBaby) {
      const partner = gamePigs.find(p =>
        p.id !== gp.id && p.isAlive && p.isMale !== gp.isMale &&
        p.affection > 70 && p.ageDays >= 3
      );
      if (partner && roll < 0.3) {
        vp.behavior = 'breed';
        vp.targetPigId = partner.id;
        vp.stateTimer = 3000 + Math.random() * 2000;
        return;
      }
    }

    // Default wander or idle
    if (roll < 0.55) {
      vp.behavior = 'wander';
      vp.angle = Math.random() * Math.PI * 2;
      vp.stateTimer = 2000 + Math.random() * 3000;
    } else {
      vp.behavior = 'idle';
      vp.stateTimer = 1000 + Math.random() * 2500;
    }
  }

  _move(vp, gp, dt, gamePigs) {
    if (!gp.isAlive || gp.isDead) { vp.vx = 0; vp.vy = 0; return; }

    switch (vp.behavior) {
      case 'wander': {
        // Occasionally nudge direction
        if (Math.random() < 0.02) {
          vp.angle += (Math.random() - 0.5) * 0.8;
        }
        const speed = WANDER_SPEED;
        vp.vx = Math.cos(vp.angle) * speed;
        vp.vy = Math.sin(vp.angle) * speed;
        vp.x += vp.vx * dt;
        vp.y += vp.vy * dt;
        // Bounce off walls
        const margin = 35;
        if (vp.x < margin || vp.x > this.w - margin) { vp.vx *= -1; vp.angle = Math.PI - vp.angle; vp.x += vp.vx * dt; }
        if (vp.y < margin || vp.y > this.h - margin) { vp.vy *= -1; vp.angle = -vp.angle; vp.y += vp.vy * dt; }
        break;
      }
      case 'eat': {
        const trough = this.layout.foodTrough;
        const tx = trough.x + trough.w / 2;
        const ty = trough.y + trough.h / 2;
        this._moveToward(vp, tx, ty, EAT_SPEED, dt);
        break;
      }
      case 'sleep': {
        const sleep = this.layout.sleepArea;
        const tx = sleep.x + sleep.w / 2;
        const ty = sleep.y + sleep.h / 2;
        this._moveToward(vp, tx, ty, SLEEP_SPEED, dt);
        break;
      }
      case 'breed': {
        if (!vp.targetPigId) break;
        const targetVP = this.pigs.get(vp.targetPigId);
        if (targetVP) {
          this._moveToward(vp, targetVP.x, targetVP.y, BREED_SPEED, dt);
        }
        break;
      }
      case 'idle':
      default:
        vp.vx = 0;
        vp.vy = 0;
        break;
    }
  }

  _moveToward(vp, tx, ty, speed, dt) {
    const dx = tx - vp.x;
    const dy = ty - vp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 8) { vp.vx = 0; vp.vy = 0; return; }
    const nx = dx / dist;
    const ny = dy / dist;
    vp.x += nx * speed * dt;
    vp.y += ny * speed * dt;
    vp.angle = Math.atan2(ny, nx) + Math.PI / 2;
  }
}
