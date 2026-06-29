/**
 * @fileoverview Draws pen floor/wall backgrounds by tier (top-down view).
 */

/**
 * Draws the pen background for a given tier onto the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - canvas width
 * @param {number} h - canvas height
 * @param {number} tier
 */
export function drawPenBackground(ctx, w, h, tier) {
  switch (tier) {
    case 1: drawWoodPlanks(ctx, w, h); break;
    case 2: drawStoneCourt(ctx, w, h); break;
    case 3: drawConcreteTiles(ctx, w, h); break;
    case 4: drawOnsenFloor(ctx, w, h); break;
    case 5: drawMarbleLobby(ctx, w, h); break;
    case 6: drawGardenTerrace(ctx, w, h); break;
    case 7: drawSpaceStation(ctx, w, h); break;
    default: drawWoodPlanks(ctx, w, h);
  }
  // Draw fence border on all tiers
  drawFence(ctx, w, h, tier);
}

function drawWoodPlanks(ctx, w, h) {
  ctx.fillStyle = '#d4a870';
  ctx.fillRect(0, 0, w, h);
  // Plank lines
  ctx.strokeStyle = '#b88848';
  ctx.lineWidth = 1.5;
  const planks = 8;
  for (let i = 0; i <= planks; i++) {
    const x = (i / planks) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  // Wood grain
  ctx.strokeStyle = 'rgba(100,60,20,0.15)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 20; i++) {
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + 4, w * 0.7, y - 4, w, y + 2);
    ctx.stroke();
  }
}

function drawStoneCourt(ctx, w, h) {
  ctx.fillStyle = '#c0b090';
  ctx.fillRect(0, 0, w, h);
  // Stone tiles
  ctx.strokeStyle = '#908060';
  ctx.lineWidth = 1.5;
  const cols = 5, rows = 5;
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, (r / rows) * h);
    ctx.lineTo(w, (r / rows) * h);
    ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    // Staggered for odd rows
    ctx.beginPath();
    ctx.moveTo((c / cols) * w, 0);
    ctx.lineTo((c / cols) * w, h);
    ctx.stroke();
  }
  // Subtle dirt patches
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(100,80,40,0.08)';
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, 15 + Math.random() * 20, 10 + Math.random() * 15, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawConcreteTiles(ctx, w, h) {
  ctx.fillStyle = '#e8e0d8';
  ctx.fillRect(0, 0, w, h);
  // Tile grid
  const tileSize = 36;
  ctx.strokeStyle = '#c8c0b8';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += tileSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += tileSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

function drawOnsenFloor(ctx, w, h) {
  // Warm stone with wet sheen
  ctx.fillStyle = '#d8c8a8';
  ctx.fillRect(0, 0, w, h);
  // Wet patches (water reflection)
  for (let i = 0; i < 4; i++) {
    const gx = (0.2 + i * 0.2) * w;
    const gy = (0.3 + Math.sin(i * 1.5) * 0.2) * h;
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 40);
    grad.addColorStop(0, 'rgba(180,210,230,0.35)');
    grad.addColorStop(1, 'rgba(180,210,230,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(gx, gy, 40, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Tile joints
  ctx.strokeStyle = '#b8a888';
  ctx.lineWidth = 1;
  const ts = 42;
  for (let x = 0; x < w; x += ts) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += ts) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

function drawMarbleLobby(ctx, w, h) {
  ctx.fillStyle = '#f4f0e8';
  ctx.fillRect(0, 0, w, h);
  // Marble veins
  ctx.strokeStyle = 'rgba(160,150,140,0.3)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    const sx = Math.random() * w;
    ctx.moveTo(sx, 0);
    ctx.bezierCurveTo(sx + 30 * (Math.random() - 0.5), h * 0.3, sx + 60 * (Math.random() - 0.5), h * 0.6, sx + 20 * (Math.random() - 0.5), h);
    ctx.stroke();
  }
  // Gold tile border
  ctx.strokeStyle = 'rgba(200,170,80,0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  // Inner tile grid
  ctx.strokeStyle = 'rgba(180,165,150,0.2)';
  ctx.lineWidth = 0.5;
  const ts = 50;
  for (let x = 0; x < w; x += ts) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += ts) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

function drawGardenTerrace(ctx, w, h) {
  // Dark polished wood
  ctx.fillStyle = '#605040';
  ctx.fillRect(0, 0, w, h);
  // Wood grain
  ctx.strokeStyle = 'rgba(80,60,30,0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    const y = (i / 15) * h + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.25, y + 3, w * 0.75, y - 3, w, y + 1);
    ctx.stroke();
  }
  // Potted plants decoration (corners)
  drawPlant(ctx, 18, 18, 12);
  drawPlant(ctx, w - 18, 18, 12);
  drawPlant(ctx, 18, h - 18, 12);
  drawPlant(ctx, w - 18, h - 18, 12);
}

function drawSpaceStation(ctx, w, h) {
  // Dark space floor
  ctx.fillStyle = '#181828';
  ctx.fillRect(0, 0, w, h);
  // Grid lines (holographic)
  ctx.strokeStyle = 'rgba(60,180,255,0.2)';
  ctx.lineWidth = 1;
  const ts = 30;
  for (let x = 0; x < w; x += ts) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += ts) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // Star dots
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // Glowing center pad
  const cg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.35);
  cg.addColorStop(0, 'rgba(60,180,255,0.12)');
  cg.addColorStop(1, 'rgba(60,180,255,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, w, h);
}

function drawFence(ctx, w, h, tier) {
  const colors = ['#a07040', '#909090', '#c8c0b8', '#c0b090', '#d0c090', '#504030', '#304060'];
  const fenceColor = colors[Math.min(tier - 1, colors.length - 1)];
  const thickness = tier >= 5 ? 6 : tier >= 3 ? 5 : 4;
  ctx.strokeStyle = fenceColor;
  ctx.lineWidth = thickness;
  ctx.strokeRect(thickness / 2, thickness / 2, w - thickness, h - thickness);
  // Fence posts (corners)
  ctx.fillStyle = fenceColor;
  const ps = thickness * 2;
  for (const [px, py] of [[0, 0], [w - ps, 0], [0, h - ps], [w - ps, h - ps]]) {
    ctx.fillRect(px, py, ps, ps);
  }
}

function drawPlant(ctx, cx, cy, r) {
  ctx.fillStyle = '#8b6030';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.5, r * 0.5, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#40a040';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5 - r * 0.2, r * 0.5, r * 0.3, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws food trough area indicator.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {boolean} hasFood
 */
export function drawFoodTrough(ctx, x, y, w, hasFood) {
  const h = 18;
  // Trough body
  ctx.fillStyle = '#8b6030';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 5);
  ctx.fill();
  ctx.strokeStyle = '#604820';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Food fill
  if (hasFood) {
    ctx.fillStyle = '#c89060';
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 3);
    ctx.fill();
    // Small food bits
    ctx.fillStyle = '#a07040';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x + 8 + i * ((w - 16) / 3), y + h / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draws a sleeping area indicator (straw mat).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
export function drawSleepArea(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(210,180,100,0.5)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  // Straw lines
  ctx.strokeStyle = 'rgba(160,120,40,0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const sy = y + 4 + i * (h / 5);
    ctx.beginPath();
    ctx.moveTo(x + 4, sy);
    ctx.lineTo(x + w - 4, sy + 2);
    ctx.stroke();
  }
}
