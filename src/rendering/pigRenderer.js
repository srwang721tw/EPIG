/**
 * @fileoverview Draws individual pigs on a 2D canvas context (top-down view).
 * Each breed has unique colors, markings, and size. All coordinates are in
 * canvas pixels relative to the pen canvas origin.
 */

/**
 * Visual breed definitions: body color, ear color, snout color, markings.
 * @type {Object<string, Object>}
 */
export const BREED_VISUALS = {
  mini: {
    bodyColor: '#ffb6c1',
    earColor: '#ff8fa3',
    snoutColor: '#ff8fa3',
    eyeColor: '#5a2a2a',
    size: 0.75,
    markings: null,
    shadow: 'rgba(255,100,120,0.25)',
  },
  native: {
    bodyColor: '#c8a070',
    earColor: '#a07848',
    snoutColor: '#a07848',
    eyeColor: '#3a2010',
    size: 1.0,
    markings: null,
    shadow: 'rgba(120,80,30,0.25)',
  },
  lazy: {
    bodyColor: '#c0b090',
    earColor: '#908060',
    snoutColor: '#908060',
    eyeColor: '#504030',
    size: 1.1,
    markings: 'stripe',
    shadow: 'rgba(100,90,50,0.25)',
  },
  clean: {
    bodyColor: '#e8f4ff',
    earColor: '#b0d0f0',
    snoutColor: '#b0d0f0',
    eyeColor: '#204080',
    size: 0.95,
    markings: 'shimmer',
    shadow: 'rgba(80,160,240,0.2)',
  },
  black: {
    bodyColor: '#303030',
    earColor: '#181818',
    snoutColor: '#604040',
    eyeColor: '#ff4040',
    size: 1.1,
    markings: null,
    shadow: 'rgba(0,0,0,0.35)',
  },
  panda: {
    bodyColor: '#f8f8f8',
    earColor: '#202020',
    snoutColor: '#d0c0c0',
    eyeColor: '#101010',
    size: 1.05,
    markings: 'panda',
    shadow: 'rgba(0,0,0,0.2)',
  },
  musk: {
    bodyColor: '#d8b0e8',
    earColor: '#b080c8',
    snoutColor: '#b080c8',
    eyeColor: '#602080',
    size: 0.95,
    markings: 'sparkle',
    shadow: 'rgba(160,80,220,0.25)',
  },
  shennong: {
    bodyColor: '#a8c878',
    earColor: '#708050',
    snoutColor: '#708050',
    eyeColor: '#204010',
    size: 1.0,
    markings: 'leaf',
    shadow: 'rgba(80,130,40,0.25)',
  },
  idol: {
    bodyColor: '#ffd0e8',
    earColor: '#ff90c0',
    snoutColor: '#ff90c0',
    eyeColor: '#c01060',
    size: 0.9,
    markings: 'star',
    shadow: 'rgba(255,80,160,0.25)',
  },
  ironpig: {
    bodyColor: '#c87040',
    earColor: '#904020',
    snoutColor: '#904020',
    eyeColor: '#ff2020',
    size: 1.15,
    markings: 'scar',
    shadow: 'rgba(150,60,20,0.3)',
  },
  dragon: {
    bodyColor: '#60c870',
    earColor: '#30a840',
    snoutColor: '#208030',
    eyeColor: '#ffd700',
    size: 1.2,
    markings: 'wing',
    shadow: 'rgba(30,180,80,0.3)',
  },
  pigotaro: {
    bodyColor: '#70a8ff',
    earColor: '#4070d0',
    snoutColor: '#4070d0',
    eyeColor: '#ffffff',
    size: 1.0,
    markings: 'swirl',
    shadow: 'rgba(60,120,240,0.25)',
  },
};

const BASE_SIZE = 22; // base radius in pixels

/**
 * Draws a single pig at (cx, cy) facing direction `angle` (radians).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {string} typeId - pig breed id
 * @param {boolean} isMale
 * @param {string} state - 'walk' | 'eat' | 'sleep' | 'idle' | 'breed'
 * @param {number} angle - facing direction in radians
 * @param {number} t - animation time (ms) for oscillation
 * @param {boolean} isDead
 * @param {boolean} isInfected
 */
export function drawPig(ctx, cx, cy, typeId, isMale, state, angle, t, isDead, isInfected) {
  const vis = BREED_VISUALS[typeId] ?? BREED_VISUALS.mini;
  const r = BASE_SIZE * vis.size;

  ctx.save();
  ctx.translate(cx, cy);

  if (isDead) {
    drawDeadPig(ctx, vis, r);
    ctx.restore();
    return;
  }

  // Apply walk bobbing
  const bob = state === 'walk' ? Math.sin(t / 120) * 1.5 : 0;
  ctx.translate(0, bob);

  if (state === 'sleep') {
    ctx.rotate(Math.PI / 2); // lying on side
  } else {
    ctx.rotate(angle);
  }

  // Drop shadow
  ctx.save();
  ctx.scale(1, 0.4);
  ctx.beginPath();
  ctx.ellipse(2, r * 1.1, r * 0.85, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = vis.shadow;
  ctx.fill();
  ctx.restore();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.85, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = vis.bodyColor;
  ctx.fill();
  ctx.strokeStyle = darken(vis.bodyColor, 0.2);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Markings
  drawMarkings(ctx, vis, r, t, isMale);

  // Ears (at top of body = front when facing up)
  drawEars(ctx, vis, r);

  // Snout
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.45, r * 0.32, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = vis.snoutColor;
  ctx.fill();
  // Nostrils
  ctx.fillStyle = darken(vis.snoutColor, 0.3);
  ctx.beginPath();
  ctx.ellipse(-r * 0.1, -r * 0.45, r * 0.07, r * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.1, -r * 0.45, r * 0.07, r * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (only when awake)
  if (state !== 'sleep') {
    const blink = Math.sin(t / 2800) > 0.97;
    drawEyes(ctx, vis, r, blink);
  } else {
    // Closed sleep eyes
    ctx.strokeStyle = vis.eyeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.2, r * 0.08, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.2, r * 0.08, Math.PI, 0);
    ctx.stroke();
    // ZZZ
    ctx.restore();
    ctx.save();
    ctx.font = `${Math.max(8, r * 0.55)}px serif`;
    ctx.fillStyle = '#8080c0';
    ctx.fillText('z', r * 0.8 + Math.sin(t / 800) * 2, -r * 0.5 + Math.sin(t / 1000) * 3);
  }

  // Gender indicator (tiny ♂/♀ above head)
  ctx.restore();
  ctx.save();
  ctx.font = `${Math.max(7, r * 0.45)}px sans-serif`;
  ctx.fillStyle = isMale ? '#70a0ff' : '#ff80b0';
  ctx.textAlign = 'center';
  ctx.fillText(isMale ? '♂' : '♀', 0, -r * 1.3);

  // Infected indicator
  if (isInfected) {
    ctx.font = `${Math.max(8, r * 0.5)}px serif`;
    ctx.fillText('😷', 0, -r * 1.8);
  }

  ctx.restore();
}

function drawEars(ctx, vis, r) {
  // Left ear
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, r * 0.62, r * 0.22, r * 0.18, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = vis.earColor;
  ctx.fill();
  ctx.strokeStyle = darken(vis.earColor, 0.2);
  ctx.lineWidth = 1;
  ctx.stroke();
  // Right ear
  ctx.beginPath();
  ctx.ellipse(r * 0.45, r * 0.62, r * 0.22, r * 0.18, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = vis.earColor;
  ctx.fill();
  ctx.stroke();
}

function drawEyes(ctx, vis, r, blink) {
  if (blink) {
    ctx.strokeStyle = vis.eyeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.32, -r * 0.2);
    ctx.lineTo(-r * 0.18, -r * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.18, -r * 0.2);
    ctx.lineTo(r * 0.32, -r * 0.2);
    ctx.stroke();
    return;
  }
  ctx.fillStyle = vis.eyeColor;
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.2, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r * 0.25, -r * 0.2, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.23, r * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r * 0.28, -r * 0.23, r * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

function drawMarkings(ctx, vis, r, t, isMale) {
  const m = vis.markings;
  if (!m) return;

  if (m === 'panda') {
    // Black eye patches
    ctx.fillStyle = '#202020';
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, -r * 0.18, r * 0.22, r * 0.18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.28, -r * 0.18, r * 0.22, r * 0.18, 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (m === 'sparkle') {
    // Sparkle dots
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + t / 1500;
      const sx = Math.cos(a) * r * 0.55;
      const sy = Math.sin(a) * r * 0.55;
      ctx.fillStyle = `rgba(255,220,255,${0.5 + 0.5 * Math.sin(t / 400 + i)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (m === 'star') {
    // Pink star on forehead
    ctx.fillStyle = '#ff6090';
    drawStar(ctx, 0, r * 0.15, r * 0.12, 5);
  } else if (m === 'leaf') {
    // Green leaf veins
    ctx.strokeStyle = 'rgba(40,100,20,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(0, r * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.1);
    ctx.lineTo(r * 0.3, -r * 0.1);
    ctx.stroke();
  } else if (m === 'scar') {
    // Battle scars
    ctx.strokeStyle = 'rgba(150,40,20,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.3);
    ctx.lineTo(-r * 0.1, r * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.2, r * 0.2);
    ctx.lineTo(r * 0.5, r * 0.4);
    ctx.stroke();
  } else if (m === 'wing') {
    // Dragon wings (tiny)
    ctx.save();
    ctx.fillStyle = 'rgba(30,160,60,0.6)';
    ctx.strokeStyle = '#20a040';
    ctx.lineWidth = 1;
    // Left wing
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, 0);
    ctx.quadraticCurveTo(-r * 1.2, -r * 0.5, -r * 0.8, r * 0.3);
    ctx.quadraticCurveTo(-r * 0.6, r * 0.1, -r * 0.3, 0);
    ctx.fill();
    ctx.stroke();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(r * 0.3, 0);
    ctx.quadraticCurveTo(r * 1.2, -r * 0.5, r * 0.8, r * 0.3);
    ctx.quadraticCurveTo(r * 0.6, r * 0.1, r * 0.3, 0);
    ctx.fill();
    ctx.stroke();
    // Gold scale spots
    ctx.fillStyle = 'rgba(220,180,30,0.5)';
    for (const [ox, oy] of [[-0.2, 0.2], [0.2, 0.2], [0, -0.1]]) {
      ctx.beginPath();
      ctx.arc(ox * r, oy * r, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (m === 'swirl') {
    // Blue swirl
    ctx.strokeStyle = 'rgba(40,80,200,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, Math.PI, Math.PI * 2.5);
    ctx.stroke();
  } else if (m === 'stripe') {
    // Lazy stripe (horizontal)
    ctx.strokeStyle = 'rgba(100,80,40,0.25)';
    ctx.lineWidth = r * 0.18;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.lineTo(r * 0.7, 0);
    ctx.stroke();
  } else if (m === 'shimmer') {
    // Clean shimmer highlight
    ctx.fillStyle = 'rgba(200,240,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.3, r * 0.25, r * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDeadPig(ctx, vis, r) {
  ctx.globalAlpha = 0.55;
  ctx.rotate(Math.PI / 2);
  // Body lying flat
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fillStyle = vis.bodyColor;
  ctx.fill();
  ctx.strokeStyle = '#a0a0a0';
  ctx.lineWidth = 1;
  ctx.stroke();
  // X eyes
  ctx.strokeStyle = '#606060';
  ctx.lineWidth = 2;
  for (const [ex, ey] of [[-r * 0.25, -r * 0.25], [r * 0.25, -r * 0.25]]) {
    ctx.beginPath();
    ctx.moveTo(ex - r * 0.08, ey - r * 0.08);
    ctx.lineTo(ex + r * 0.08, ey + r * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex + r * 0.08, ey - r * 0.08);
    ctx.lineTo(ex - r * 0.08, ey + r * 0.08);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawStar(ctx, cx, cy, r, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.4;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Darkens a hex/rgb color string by a fraction.
 * @param {string} color - CSS color
 * @param {number} amount - 0–1
 * @returns {string}
 */
function darken(color, amount) {
  // Parse hex
  const m = color.match(/^#([0-9a-f]{6})$/i);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, ((n >> 16) & 0xff) * (1 - amount)) | 0;
  const g = Math.max(0, ((n >> 8) & 0xff) * (1 - amount)) | 0;
  const b = Math.max(0, (n & 0xff) * (1 - amount)) | 0;
  return `rgb(${r},${g},${b})`;
}
