/**
 * @fileoverview Renders the pig pen tab: all pens and their pig cards.
 */

import { PIG_TYPE_MAP, RARITY_LABELS, RARITY_COLORS } from '../data/pigTypes.js';
import { PEN_TIER_MAP } from '../data/penTiers.js';
import { FEED_TYPES } from '../data/feedTypes.js';
import { sellPrice } from '../entities/pig.js';
import { effectiveTier } from '../entities/pen.js';
import { showModal, confirm } from './modal.js';

/**
 * @param {Object} state
 * @param {import('../game.js').GameEngine} engine
 */
export function renderPenView(state, engine) {
  const container = document.getElementById('tab-pen');
  if (!container) return;
  container.innerHTML = '';

  const pens = Object.values(state.pens);
  if (pens.length === 0) {
    container.innerHTML = '<p class="empty-msg">還沒有豬舍，去商店購買吧！</p>';
    return;
  }

  for (const pen of pens) {
    container.appendChild(buildPenCard(pen, state, engine));
  }

  // Buy new pen button
  const buyPenBtn = document.createElement('button');
  buyPenBtn.className = 'btn btn-secondary btn-wide';
  buyPenBtn.textContent = '＋ 購買新豬舍（300 金幣）';
  buyPenBtn.addEventListener('click', () => {
    if (!engine.buyNewPen()) {
      import('./modal.js').then(m => m.alert('金幣不足', '需要 300 金幣才能購買新豬舍。'));
    }
  });
  container.appendChild(buyPenBtn);
}

function buildPenCard(pen, state, engine) {
  const tier = effectiveTier(pen, state.day);
  const tierData = PEN_TIER_MAP[tier];
  const nextTier = PEN_TIER_MAP[pen.tier + 1];

  const card = document.createElement('div');
  card.className = 'pen-card';

  const cleanClass = pen.cleanliness >= 60 ? 'clean-good'
    : pen.cleanliness >= 30 ? 'clean-warn' : 'clean-bad';

  card.innerHTML = `
    <div class="pen-header">
      <span class="pen-emoji">${tierData.emoji}</span>
      <span class="pen-name">${tierData.name}</span>
      <span class="pen-tier-badge">Tier ${tier}</span>
    </div>
    <div class="pen-stats">
      <span class="${cleanClass}">🧹 乾淨度 ${Math.round(pen.cleanliness)}%</span>
      <span>🐷 ${pen.pigIds.length}/${tierData.capacity}</span>
    </div>
    <div class="pig-grid" id="pig-grid-${pen.id}"></div>
    <div class="pen-actions">
      <button class="btn btn-secondary" data-action="clean" data-pen="${pen.id}">🧹 打掃豬舍</button>
      ${nextTier ? `<button class="btn btn-secondary" data-action="upgrade" data-pen="${pen.id}">⬆️ 升級（${nextTier.upgradeCost.toLocaleString()}金）</button>` : '<span class="max-tier">⭐ 頂級豬舍</span>'}
    </div>
  `;

  card.querySelector('[data-action="clean"]').addEventListener('click', () => {
    engine.cleanPen(pen.id);
  });
  const upgradeBtn = card.querySelector('[data-action="upgrade"]');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      if (!engine.upgradePen(pen.id)) {
        import('./modal.js').then(m => m.alert('金幣不足', `需要 ${nextTier.upgradeCost.toLocaleString()} 金幣升級。`));
      }
    });
  }

  const pigGrid = card.querySelector(`#pig-grid-${pen.id}`);
  const pigs = pen.pigIds.map(id => state.pigs[id]).filter(Boolean);
  for (const pig of pigs) {
    pigGrid.appendChild(buildPigCard(pig, state, engine));
  }

  return card;
}

function buildPigCard(pig, state, engine) {
  const breed = PIG_TYPE_MAP[pig.typeId];
  const card = document.createElement('div');
  card.className = `pig-card${pig.isDead ? ' pig-dead' : ''}${pig.isInfected ? ' pig-infected' : ''}`;

  if (pig.isDead) {
    card.innerHTML = `
      <div class="pig-emoji">${breed.emoji}💀</div>
      <div class="pig-name">${pig.name}</div>
      <div class="pig-status dead">已死亡</div>
      <button class="btn btn-danger btn-sm" data-action="clean-dead">🗑️ 處理</button>
    `;
    card.querySelector('[data-action="clean-dead"]').addEventListener('click', () => {
      engine.cleanDeadPig(pig.id);
    });
    return card;
  }

  const rarityColor = RARITY_COLORS[breed.rarity];
  const petCooldownMs = (breed.special.petCooldownMin ?? 30) * 60 * 1000;
  const canPet = Date.now() - pig.lastPetMs >= petCooldownMs;
  const estimatedSell = sellPrice(pig);

  card.style.setProperty('--rarity-color', rarityColor);
  card.innerHTML = `
    <div class="pig-rarity-bar"></div>
    <div class="pig-emoji">${breed.emoji}${pig.isMale ? '♂' : '♀'}</div>
    <div class="pig-name">${pig.name}</div>
    <div class="pig-breed">${breed.name} · ${RARITY_LABELS[breed.rarity]}</div>
    ${pig.isBaby && pig.ageDays < 3 ? '<div class="baby-badge">🐣 小豬</div>' : ''}
    <div class="pig-bars">
      ${statBar('❤️', pig.health)}
      ${statBar('🍽️', pig.hunger)}
      ${statBar('💕', pig.affection)}
    </div>
    <button class="btn btn-primary btn-sm pig-detail-btn" data-pig="${pig.id}">查看詳細</button>
  `;

  card.querySelector('.pig-detail-btn').addEventListener('click', () => {
    showPigDetail(pig, state, engine);
  });

  return card;
}

function statBar(emoji, value) {
  const cls = value >= 60 ? 'bar-good' : value >= 30 ? 'bar-warn' : 'bar-bad';
  return `
    <div class="stat-bar-row">
      <span>${emoji}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill ${cls}" style="width:${value}%"></div>
      </div>
      <span class="stat-val">${Math.round(value)}</span>
    </div>
  `;
}

function showPigDetail(pig, state, engine) {
  const breed = PIG_TYPE_MAP[pig.typeId];
  const petCooldownMs = (breed.special.petCooldownMin ?? 30) * 60 * 1000;
  const canPet = Date.now() - pig.lastPetMs >= petCooldownMs;
  const estimate = sellPrice(pig);
  const isBaby = pig.isBaby && pig.ageDays < 3;

  const feedOptions = FEED_TYPES
    .filter(f => (state.inventory[f.id] ?? 0) > 0)
    .map(f => `<option value="${f.id}">${f.emoji} ${f.name} (庫存: ${state.inventory[f.id]})</option>`)
    .join('');

  const body = `
    <div class="pig-detail">
      <div class="detail-header">
        <span class="detail-emoji">${breed.emoji}</span>
        <div>
          <div class="detail-name">${pig.name}</div>
          <div class="detail-breed">${breed.name} · ${RARITY_LABELS[breed.rarity]} · ${pig.isMale ? '公豬♂' : '母豬♀'}</div>
          <div class="detail-age">年齡：${pig.ageDays.toFixed(1)} 天 · 預估售價：${estimate} 金幣</div>
        </div>
      </div>
      <div class="detail-special">💡 ${breed.description}</div>
      <div class="detail-flavor">「${breed.flavorText}」</div>
      ${pig.isInfected ? '<div class="infected-banner">😷 此豬已感染疾病！</div>' : ''}
      <div class="detail-bars">
        ${statBar('❤️ 健康', pig.health)}
        ${statBar('🍽️ 飽食', pig.hunger)}
        ${statBar('💕 好感', pig.affection)}
      </div>
      <div class="detail-feed">
        <label>選擇飼料：
          <select id="feed-select">${feedOptions || '<option disabled>無庫存飼料</option>'}</select>
        </label>
      </div>
    </div>
  `;

  const buttons = [
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
    ...(isBaby ? [] : [{
      label: `💰 販賣（${estimate}金）`,
      action: () => {
        confirm(`確定要賣掉 ${pig.name}？`, () => engine.sellPig(pig.id));
      },
    }]),
    { label: '關閉' },
  ];

  showModal(`${breed.emoji} ${pig.name}`, body, buttons);
}
