/**
 * @fileoverview Draws illustrated feed item icons on a canvas context.
 * Each icon is drawn programmatically to match the feed name.
 */

/**
 * Draws a feed icon onto ctx centered at (cx, cy) with given radius.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} feedId
 * @param {number} cx
 * @param {number} cy
 * @param {number} r - icon radius
 */
export function drawFeedIcon(ctx, feedId, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  switch (feedId) {
    case 'scraps':      drawScraps(ctx, r); break;
    case 'peels':       drawPeels(ctx, r); break;
    case 'veggies':     drawVeggies(ctx, r); break;
    case 'sweetpotato': drawSweetPotato(ctx, r); break;
    case 'truffle':     drawTruffle(ctx, r); break;
    case 'wagyu':       drawWagyu(ctx, r); break;
    case 'lobster':     drawLobster(ctx, r); break;
    case 'abalone':     drawAbalone(ctx, r); break;
    case 'buddha_jump': drawBuddhaJump(ctx, r); break;
    default:            drawGenericBowl(ctx, r); break;
  }
  ctx.restore();
}

function drawGenericBowl(ctx, r) {
  ctx.fillStyle = '#c8a060';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.2, r * 0.85, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawScraps(ctx, r) {
  // Gray bin
  ctx.fillStyle = '#909090';
  ctx.beginPath();
  ctx.roundRect(-r * 0.6, -r * 0.4, r * 1.2, r * 0.9, r * 0.1);
  ctx.fill();
  ctx.strokeStyle = '#606060';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Lid
  ctx.fillStyle = '#707070';
  ctx.beginPath();
  ctx.roundRect(-r * 0.65, -r * 0.55, r * 1.3, r * 0.2, r * 0.05);
  ctx.fill();
  // Smell lines
  ctx.strokeStyle = 'rgba(100,180,80,0.6)';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.25, -r * 0.6);
    ctx.quadraticCurveTo(i * r * 0.25 + r * 0.1, -r * 0.85, i * r * 0.25, -r * 1.05);
    ctx.stroke();
  }
}

function drawPeels(ctx, r) {
  // Orange peel arc
  ctx.strokeStyle = '#ff8020';
  ctx.lineWidth = r * 0.18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, r * 0.1, r * 0.55, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
  // Banana curve
  ctx.strokeStyle = '#f0d020';
  ctx.lineWidth = r * 0.15;
  ctx.beginPath();
  ctx.moveTo(-r * 0.3, r * 0.3);
  ctx.quadraticCurveTo(r * 0.1, -r * 0.5, r * 0.4, -r * 0.2);
  ctx.stroke();
  // Apple core
  ctx.fillStyle = '#c03020';
  ctx.beginPath();
  ctx.ellipse(-r * 0.1, r * 0.35, r * 0.2, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawVeggies(ctx, r) {
  // Bowl
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.3, r * 0.75, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Lettuce
  ctx.fillStyle = '#70c040';
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.3 + r * 0.1, r * 0.3, r * 0.2, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // Carrot
  ctx.fillStyle = '#ff8030';
  ctx.beginPath();
  ctx.moveTo(r * 0.15, -r * 0.15);
  ctx.lineTo(r * 0.35, r * 0.3);
  ctx.lineTo(-r * 0.05, r * 0.3);
  ctx.closePath();
  ctx.fill();
  // Carrot top
  ctx.strokeStyle = '#40a020';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r * 0.15, -r * 0.15);
  ctx.lineTo(r * 0.1, -r * 0.45);
  ctx.stroke();
}

function drawSweetPotato(ctx, r) {
  // Purple/orange sweet potato
  ctx.fillStyle = '#d06030';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.8, r * 0.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a04020';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Skin texture
  ctx.strokeStyle = '#c05020';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 0.1);
  ctx.bezierCurveTo(-r * 0.2, -r * 0.3, r * 0.2, r * 0.2, r * 0.5, -r * 0.1);
  ctx.stroke();
  // Steam bowl
  ctx.fillStyle = '#f0e8d0';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.55, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  // Steam
  ctx.strokeStyle = 'rgba(200,180,160,0.7)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.2, r * 0.2);
    ctx.quadraticCurveTo(i * r * 0.2 + r * 0.1, -r * 0.1, i * r * 0.2, -r * 0.35);
    ctx.stroke();
  }
}

function drawTruffle(ctx, r) {
  // Dark lumpy truffle
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
  ctx.fill();
  // Bumps
  ctx.fillStyle = '#2a1a0a';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const br = r * (0.2 + Math.random() * 0.15);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35, br, 0, Math.PI * 2);
    ctx.fill();
  }
  // Shine spot
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, -r * 0.25, r * 0.2, r * 0.12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Gold flakes
  ctx.fillStyle = 'rgba(220,180,30,0.8)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-r * 0.3 + i * r * 0.2, r * 0.3, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWagyu(ctx, r) {
  // Steak
  ctx.fillStyle = '#8b2020';
  ctx.beginPath();
  ctx.roundRect(-r * 0.7, -r * 0.35, r * 1.4, r * 0.7, r * 0.2);
  ctx.fill();
  // Fat marbling
  ctx.strokeStyle = 'rgba(255,220,180,0.7)';
  ctx.lineWidth = r * 0.12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 0.1);
  ctx.bezierCurveTo(-r * 0.1, -r * 0.25, r * 0.2, r * 0.1, r * 0.5, -r * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r * 0.3, r * 0.15);
  ctx.bezierCurveTo(r * 0.1, -r * 0.05, r * 0.3, r * 0.2, r * 0.6, r * 0.1);
  ctx.stroke();
  // Seared border
  ctx.strokeStyle = '#4a0808';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-r * 0.7, -r * 0.35, r * 1.4, r * 0.7, r * 0.2);
  ctx.stroke();
  // Grill marks
  ctx.strokeStyle = 'rgba(30,10,10,0.5)';
  ctx.lineWidth = r * 0.1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.35 - r * 0.1, -r * 0.3);
    ctx.lineTo(i * r * 0.35 + r * 0.1, r * 0.3);
    ctx.stroke();
  }
}

function drawLobster(ctx, r) {
  // Body
  ctx.fillStyle = '#e03020';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.4, r * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b02010';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Tail segments
  for (let i = 1; i <= 3; i++) {
    ctx.fillStyle = `rgba(220,${50 + i * 10},20,0.9)`;
    ctx.beginPath();
    ctx.ellipse(0, r * (0.45 + i * 0.25), r * (0.38 - i * 0.04), r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b02010';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Claws
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#e03020';
    ctx.beginPath();
    ctx.ellipse(side * r * 0.7, -r * 0.3, r * 0.35, r * 0.22, side * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b02010';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Claw gap
    ctx.strokeStyle = '#b02010';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(side * (r * 0.7 + r * 0.15), -r * 0.3);
    ctx.lineTo(side * (r * 0.7 + r * 0.35), -r * 0.25);
    ctx.stroke();
  }
  // Antennae
  ctx.strokeStyle = '#d02010';
  ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * r * 0.2, -r * 0.65);
    ctx.lineTo(side * r * 0.8, -r * 1.1);
    ctx.stroke();
  }
  // Eyes
  ctx.fillStyle = '#101010';
  ctx.beginPath();
  ctx.arc(-r * 0.15, -r * 0.6, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r * 0.15, -r * 0.6, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

function drawAbalone(ctx, r) {
  // Shell (ear-shaped)
  ctx.fillStyle = '#e0c890';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.1, r * 0.9, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  // Iridescent inner shell
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.1, 0, 0, 0, r * 0.7);
  grad.addColorStop(0, 'rgba(180,240,200,0.7)');
  grad.addColorStop(0.4, 'rgba(120,180,240,0.5)');
  grad.addColorStop(0.8, 'rgba(200,160,220,0.4)');
  grad.addColorStop(1, 'rgba(240,200,140,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.1, r * 0.8, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  // Shell ridges
  ctx.strokeStyle = 'rgba(160,130,60,0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI + Math.PI * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.1);
    ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.5 + r * 0.1);
    ctx.stroke();
  }
  // Small breathing holes
  ctx.fillStyle = '#808050';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-r * 0.5 + i * r * 0.32, -r * 0.25, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  // Soup bowl
  ctx.strokeStyle = '#c0a060';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, r * 0.1, r * 0.9, 0, Math.PI);
  ctx.stroke();
}

function drawBuddhaJump(ctx, r) {
  // Claypot
  ctx.fillStyle = '#8b4513';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.15, r * 0.8, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a2d0a';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Lid
  ctx.fillStyle = '#a0522d';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.35, r * 0.82, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a2d0a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Lid knob
  ctx.fillStyle = '#c07040';
  ctx.beginPath();
  ctx.arc(0, -r * 0.52, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Glow / steam aura
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.1);
  glow.addColorStop(0, 'rgba(255,220,100,0.15)');
  glow.addColorStop(0.6, 'rgba(255,160,40,0.08)');
  glow.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
  ctx.fill();
  // Steam wisps
  ctx.strokeStyle = 'rgba(255,230,180,0.6)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.25, -r * 0.6);
    ctx.quadraticCurveTo(i * r * 0.25 + r * 0.15, -r * 0.9, i * r * 0.25 - r * 0.05, -r * 1.2);
    ctx.stroke();
  }
  // Gold shimmer on pot
  ctx.strokeStyle = 'rgba(220,180,40,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, r * 0.15, r * 0.7, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
}
