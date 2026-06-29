/**
 * @fileoverview Manages a canvas element for one pen, running an rAF loop
 * that renders animated pigs, pen background, food trough, and sleep area.
 */

import { drawPenBackground, drawFoodTrough, drawSleepArea } from './penBackground.js';
import { drawPig } from './pigRenderer.js';
import { PenSimulation } from './pigSimulation.js';
import { PIG_TYPE_MAP } from '../data/pigTypes.js';

const CANVAS_W = 340;
const CANVAS_H = 220;

// Fixed layout zones within canvas
const FOOD_TROUGH = { x: 14, y: 10, w: 90, h: 18 };
const SLEEP_AREA  = { x: CANVAS_W - 104, y: 10, w: 90, h: 40 };

export class PenCanvas {
  /**
   * @param {Object} pen - pen state object
   * @param {Object} state - full game state (read-only reference)
   */
  constructor(pen, state) {
    this.penId = pen.id;
    this.state = state;

    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.canvas.style.cssText = `width:100%;border-radius:10px;display:block;cursor:pointer;`;
    this.canvas.title = '點擊豬豬查看詳細';

    this.ctx = this.canvas.getContext('2d');
    this.sim = new PenSimulation(CANVAS_W, CANVAS_H, {
      foodTrough: { x: FOOD_TROUGH.x, y: FOOD_TROUGH.y, w: FOOD_TROUGH.w, h: FOOD_TROUGH.h },
      sleepArea:  { x: SLEEP_AREA.x,  y: SLEEP_AREA.y,  w: SLEEP_AREA.w,  h: SLEEP_AREA.h },
    });

    this._rafId = null;
    this._lastTime = performance.now();
    this._clickCb = null;

    this.canvas.addEventListener('click', e => this._handleClick(e));
    this._syncAndStart();
  }

  /** Starts the animation loop. */
  _syncAndStart() {
    const pen = this.state.pens[this.penId];
    if (!pen) return;
    const pigs = pen.pigIds.map(id => this.state.pigs[id]).filter(Boolean);
    this.sim.sync(pigs);
    this._loop();
  }

  _loop() {
    const now = performance.now();
    const dt = Math.min(now - this._lastTime, 100);
    this._lastTime = now;

    const pen = this.state.pens[this.penId];
    if (!pen) { this.destroy(); return; }

    const pigs = pen.pigIds.map(id => this.state.pigs[id]).filter(Boolean);
    this.sim.sync(pigs);
    this.sim.update(dt, pigs);
    this._render(pen, pigs, now);

    this._rafId = requestAnimationFrame(() => this._loop());
  }

  _render(pen, pigs, t) {
    const ctx = this.ctx;
    const { effectiveTier } = { effectiveTier: p => p.tier }; // simplified; pen.tier is used
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    drawPenBackground(ctx, CANVAS_W, CANVAS_H, pen.tier);

    // Food trough
    const hasFood = pigs.some(p => {
      const inv = this.state.inventory;
      return Object.values(inv).some(qty => qty > 0);
    });
    drawFoodTrough(ctx, FOOD_TROUGH.x, FOOD_TROUGH.y, FOOD_TROUGH.w, hasFood);

    // Sleep area label
    drawSleepArea(ctx, SLEEP_AREA.x, SLEEP_AREA.y, SLEEP_AREA.w, SLEEP_AREA.h);

    // Zone labels
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(80,50,20,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('食槽', FOOD_TROUGH.x + FOOD_TROUGH.w / 2, FOOD_TROUGH.y + FOOD_TROUGH.h + 11);
    ctx.fillText('休息區', SLEEP_AREA.x + SLEEP_AREA.w / 2, SLEEP_AREA.y + SLEEP_AREA.h + 11);

    // Pigs
    for (const pig of pigs) {
      const vp = this.sim.pigs.get(pig.id);
      if (!vp) continue;
      drawPig(
        ctx,
        vp.x, vp.y,
        pig.typeId,
        pig.isMale,
        pig.isDead ? 'dead' : vp.behavior,
        vp.angle,
        t,
        pig.isDead,
        pig.isInfected
      );

      // Name label below pig
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = 'rgba(60,30,30,0.85)';
      ctx.textAlign = 'center';
      ctx.fillText(pig.name, vp.x, vp.y + 30);
    }

    // Cleanliness warning overlay
    if (pen.cleanliness < 30) {
      ctx.fillStyle = 'rgba(100,60,0,0.18)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      // Dirt spots
      ctx.fillStyle = 'rgba(80,50,10,0.15)';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.ellipse(
          (i * 47) % CANVAS_W, (i * 31 + 20) % CANVAS_H,
          12 + (i % 3) * 5, 8 + (i % 3) * 3, i * 0.5, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  /** Handles click: finds the pig nearest to click point and fires callback. */
  _handleClick(e) {
    if (!this._clickCb) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let nearest = null;
    let nearestDist = 35; // click radius in canvas px

    for (const [id, vp] of this.sim.pigs) {
      const dx = mx - vp.x;
      const dy = my - vp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = id;
      }
    }

    if (nearest) this._clickCb(nearest);
  }

  /**
   * Registers a callback for pig clicks.
   * @param {Function} cb - called with pigId
   */
  onPigClick(cb) {
    this._clickCb = cb;
  }

  /** Updates state reference (call when game state changes). */
  updateState(state) {
    this.state = state;
  }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }
}
