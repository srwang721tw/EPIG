/**
 * @fileoverview Renders the pig pen tab: each pen as an animated canvas view.
 */

import { PIG_TYPE_MAP, RARITY_LABELS, RARITY_COLORS } from '../data/pigTypes.js';
import { PEN_TIER_MAP } from '../data/penTiers.js';
import { FEED_TYPES } from '../data/feedTypes.js';
import { sellPrice } from '../entities/pig.js';
import { effectiveTier } from '../entities/pen.js';
import { showModal, confirm } from './modal.js';
import { PenCanvas } from '../rendering/penCanvas.js';

/** @type {Map<string, PenCanvas>} */
const penCanvases = new Map();

/**
 * @param {Object} state
 * @param {import('../game.js').GameEngine} engine
 */
export function renderPenView(state, engine) {
  const container = document.getElementById('tab-pen');
  if (!container) return;

  // Destroy canvases for pens that no longer exist
  for (const [penId, pc] of penCanvases) {
    if (!state.pens[penId]) { pc.destroy(); penCanvases.delete(penId); }
  }

  // Track which pen-card elements already exist
  const existingCards = new Map(
    [...container.querySelectorAll('.pen-card')].map(el => [el.dataset.penId, el])
  );

  // Remove cards for deleted pens
  for (const [penId, el] of existingCards) {
    if (!state.pens[penId]) el.remove();
  }

  const pens = Object.values(state.pens);
  if (pens.length === 0) {
    container.innerHTML = '<p class="empty-msg">還沒有豬舍，去商店購買吧！</p>';
    return;
  }

  for (const pen of pens) {
    if (existingCards.has(pen.id)) {
      // Update stats only — don't rebuild the whole card
      updatePenCardStats(pen, state);
      // Tell canvas to use latest state
      const pc = penCanvases.get(pen.id);
      if (pc) pc.updateState(state);
    } else {
      const card = buildPenCard(pen, state, engine);
      // Insert before the "buy pen" button if it exists
      const buyBtn = container.querySelector('.btn-buy-pen');
      if (buyBtn) container.insertBefore(card, buyBtn);
      else container.appendChild(card);
    }
  }

  // Ensure "buy pen" button exists at bottom
  if (!container.querySelector('.btn-buy-pen')) {
    const buyPenBtn = document.createElement('button');
    buyPenBtn.className = 'btn btn-secondary btn-wide btn-buy-pen';
    buyPenBtn.textContent = '＋ 購買新豬舍（300 金幣）';
    buyPenBtn.addEventListener('click', () => {
      if (!engine.buyNewPen()) {
        import('./modal.js').then(m => m.alert('金幣不足', '需要 300 金幣才能購買新豬舍。'));
      }
    });
    container.appendChild(buyPenBtn);
  }
}

function buildPenCard(pen, state, engine) {
  const tier = effectiveTier(pen, state.day);
  const tierData = PEN_TIER_MAP[tier];
  const nextTier = PEN_TIER_MAP[pen.tier + 1];

  const card = document.createElement('div');
  card.className = 'pen-card';
  card.dataset.penId = pen.id;

  const cleanClass = pen.cleanliness >= 60 ? 'clean-good' : pen.cleanliness >= 30 ? 'clean-warn' : 'clean-bad';
  const livePigs = pen.pigIds.filter(id => state.pigs[id]?.isAlive).length;

  card.innerHTML = `
    <div class="pen-header">
      <span class="pen-name">${tierData.name}</span>
      <span class="pen-tier-badge">Tier ${tier}</span>
    </div>
    <div class="pen-stats" data-pen-stats="${pen.id}">
      <span class="${cleanClass}" data-cleanliness>🧹 乾淨度 ${Math.round(pen.cleanliness)}%</span>
      <span data-pigcount>🐷 ${livePigs}/${tierData.capacity}</span>
    </div>
    <div class="pen-canvas-wrap" id="pen-canvas-wrap-${pen.id}"></div>
    <div class="pen-actions">
      <button class="btn btn-secondary" data-action="clean" data-pen="${pen.id}">🧹 打掃豬舍</button>
      ${nextTier
        ? `<button class="btn btn-secondary" data-action="upgrade" data-pen="${pen.id}">⬆️ 升級（${nextTier.upgradeCost.toLocaleString()}金）</button>`
        : '<span class="max-tier">⭐ 頂級豬舍</span>'}
    </div>
  `;

  card.querySelector('[data-action="clean"]').addEventListener('click', () => engine.cleanPen(pen.id));
  const upgradeBtn = card.querySelector('[data-action="upgrade"]');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      if (!engine.upgradePen(pen.id)) {
        import('./modal.js').then(m => m.alert('金幣不足', `需要 ${nextTier.upgradeCost.toLocaleString()} 金幣升級。`));
      }
    });
  }

  // Create canvas
  const wrap = card.querySelector(`#pen-canvas-wrap-${pen.id}`);
  const pc = new PenCanvas(pen, state);
  pc.onPigClick(pigId => showPigDetail(state.pigs[pigId], state, engine));
  penCanvases.set(pen.id, pc);
  wrap.appendChild(pc.canvas);

  return card;
}

function updatePenCardStats(pen, state) {
  const tier = effectiveTier(pen, state.day);
  const tierData = PEN_TIER_MAP[tier];
  const cleanClass = pen.cleanliness >= 60 ? 'clean-good' : pen.cleanliness >= 30 ? 'clean-warn' : 'clean-bad';
  const livePigs = pen.pigIds.filter(id => state.pigs[id]?.isAlive).length;

  const statsEl = document.querySelector(`[data-pen-stats="${pen.id}"]`);
  if (!statsEl) return;
  const cleanEl = statsEl.querySelector('[data-cleanliness]');
  const countEl = statsEl.querySelector('[data-pigcount]');
  if (cleanEl) {
    cleanEl.className = cleanClass;
    cleanEl.textContent = `🧹 乾淨度 ${Math.round(pen.cleanliness)}%`;
  }
  if (countEl) countEl.textContent = `🐷 ${livePigs}/${tierData.capacity}`;
}

// ─── Pig Detail Modal ─────────────────────────────────────────────────────

function showPigDetail(pig, state, engine) {
  if (!pig) return;
  const breed = PIG_TYPE_MAP[pig.typeId];
  const petCooldownMs = (breed.special.petCooldownMin ?? 30) * 60 * 1000;
  const canPet = Date.now() - pig.lastPetMs >= petCooldownMs;
  const estimate = sellPrice(pig);
  const isBaby = pig.isBaby && pig.ageDays < 3;

  const feedOptions = FEED_TYPES
    .filter(f => (state.inventory[f.id] ?? 0) > 0)
    .map(f => `<option value="${f.id}">${f.name} (庫存: ${state.inventory[f.id]})</option>`)
    .join('');

  const rarityColor = RARITY_COLORS[breed.rarity];

  const body = `
    <div class="pig-detail">
      <div class="detail-header" style="border-left: 4px solid ${rarityColor}; padding-left: 10px;">
        <div class="detail-pig-preview" id="detail-pig-canvas-wrap"></div>
        <div>
          <div class="detail-name">${pig.name}</div>
          <div class="detail-breed" style="color:${rarityColor}">${breed.name} · ${RARITY_LABELS[breed.rarity]}</div>
          <div class="detail-age">${pig.isMale ? '公豬♂' : '母豬♀'} · 年齡 ${pig.ageDays.toFixed(1)} 天</div>
          <div class="detail-age">預估售價：<strong>${estimate}</strong> 金幣</div>
        </div>
      </div>
      <div class="detail-special">💡 ${breed.description}</div>
      <div class="detail-flavor">「${breed.flavorText}」</div>
      ${pig.isInfected ? '<div class="infected-banner">😷 此豬已感染疾病！需要盡快清理死豬。</div>' : ''}
      ${isBaby ? '<div class="baby-info">🐣 小豬還需要 ${(3 - pig.ageDays).toFixed(1)} 天才能販賣。</div>' : ''}
      <div class="detail-bars">
        ${statBar('❤️ 健康', pig.health)}
        ${statBar('🍽️ 飽食', pig.hunger)}
        ${statBar('💕 好感', pig.affection)}
      </div>
      ${pig.isDead ? '<div class="dead-notice">💀 此豬已死亡，請盡快處理以防疾病蔓延！</div>' : `
      <div class="detail-feed">
        <label>選擇飼料：
          <select id="feed-select">${feedOptions || '<option disabled>無庫存飼料</option>'}</select>
        </label>
      </div>`}
    </div>
  `;

  const buttons = pig.isDead
    ? [
        { label: '🗑️ 處理屍體', primary: true, action: () => engine.cleanDeadPig(pig.id) },
        { label: '關閉' },
      ]
    : [
        {
          label: canPet ? '🤗 摸摸豬' : '⏳ 冷卻中',
          primary: true,
          action: canPet ? () => {
            engine.petPig(pig.id);
            showPigDetail(state.pigs[pig.id], state, engine);
          } : null,
        },
        {
          label: '🍴 餵食',
          action: () => {
            const sel = document.getElementById('feed-select');
            if (!sel?.value) return;
            if (!engine.feedPig(pig.id, sel.value)) {
              import('./modal.js').then(m => m.alert('無法餵食', '飼料庫存不足。'));
            } else {
              showPigDetail(state.pigs[pig.id], state, engine);
            }
          },
        },
        ...(!isBaby ? [{
          label: `💰 販賣（${estimate}金）`,
          action: () => confirm(`確定要賣掉 ${pig.name}？`, () => engine.sellPig(pig.id)),
        }] : []),
        { label: '關閉' },
      ];

  showModal(`${breed.name} — ${pig.name}`, body, buttons);

  // Render mini pig preview in modal using canvas
  requestAnimationFrame(() => {
    const wrap = document.getElementById('detail-pig-canvas-wrap');
    if (!wrap) return;
    const c = document.createElement('canvas');
    c.width = 80; c.height = 80;
    c.style.cssText = 'display:block;';
    wrap.appendChild(c);
    const ctx = c.getContext('2d');
    import('../rendering/pigRenderer.js').then(({ drawPig: dp }) => {
      let t = 0;
      function animatePreview() {
        ctx.clearRect(0, 0, 80, 80);
        dp(ctx, 40, 40, pig.typeId, pig.isMale, pig.isDead ? 'dead' : 'idle', 0, t, pig.isDead, pig.isInfected);
        t += 16;
        if (document.getElementById('detail-pig-canvas-wrap')) {
          requestAnimationFrame(animatePreview);
        }
      }
      animatePreview();
    });
  });
}

function statBar(label, value) {
  const cls = value >= 60 ? 'bar-good' : value >= 30 ? 'bar-warn' : 'bar-bad';
  return `
    <div class="stat-bar-row">
      <span class="stat-label">${label}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill ${cls}" style="width:${value}%"></div>
      </div>
      <span class="stat-val">${Math.round(value)}</span>
    </div>
  `;
}
