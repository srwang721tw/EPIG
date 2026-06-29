/**
 * @fileoverview Gacha pull UI with card-flip animation and item inventory tab.
 */

import { GACHA_POOLS } from '../data/gachaPools.js';
import { PIG_TYPE_MAP, RARITY_LABELS, RARITY_COLORS } from '../data/pigTypes.js';
import { FEED_TYPE_MAP, FEED_RARITY_LABELS } from '../data/feedTypes.js';
import { PEN_TIER_MAP } from '../data/penTiers.js';
import { ITEM_TYPE_MAP } from '../data/itemTypes.js';
import { alert } from './modal.js';

/**
 * @param {Object} state
 * @param {import('../game.js').GameEngine} engine
 */
export function renderGachaView(state, engine) {
  const container = document.getElementById('tab-gacha');
  if (!container) return;
  container.innerHTML = `
    <div id="gacha-pools" class="gacha-pools"></div>
    <div id="gacha-result" class="gacha-result hidden"></div>
    <h3 class="section-title">🎒 道具背包</h3>
    <div id="item-inventory" class="item-inventory"></div>
  `;

  const poolsEl = container.querySelector('#gacha-pools');
  for (const pool of Object.values(GACHA_POOLS)) {
    poolsEl.appendChild(buildPoolCard(pool, state, engine));
  }

  renderItemInventory(state, container.querySelector('#item-inventory'));
}

function buildPoolCard(pool, state, engine) {
  const pity = state.gachaPity[pool.id] ?? 0;
  const pityMax = pool.superPityThreshold ?? pool.pityThreshold;
  const card = document.createElement('div');
  card.className = 'gacha-pool-card';

  card.innerHTML = `
    <div class="gacha-pool-header">
      <span class="gacha-pool-emoji">${pool.emoji}</span>
      <span class="gacha-pool-name">${pool.name}</span>
    </div>
    <div class="gacha-pity">保底進度：${pity}/${pityMax}</div>
    <div class="gacha-btns">
      <button class="btn btn-primary gacha-single" data-pool="${pool.id}">
        單抽 ${pool.singleCost}金
      </button>
      <button class="btn btn-secondary gacha-ten" data-pool="${pool.id}">
        十連 ${pool.tenCost}金
      </button>
    </div>
  `;

  card.querySelector('.gacha-single').addEventListener('click', () => doGacha(pool.id, 1, state, engine));
  card.querySelector('.gacha-ten').addEventListener('click', () => doGacha(pool.id, 10, state, engine));

  return card;
}

function doGacha(poolId, count, state, engine) {
  const pool = GACHA_POOLS[poolId];
  const cost = count === 10 ? pool.tenCost : pool.singleCost;
  if (state.coins < cost) {
    alert('金幣不足', `需要 ${cost} 金幣才能抽卡。`);
    return;
  }
  const results = engine.gachaPull(poolId, count);
  showGachaResults(results, poolId);
}

function showGachaResults(results, poolId) {
  const resultEl = document.getElementById('gacha-result');
  if (!resultEl) return;
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = '';

  const title = document.createElement('h3');
  title.className = 'gacha-result-title';
  title.textContent = '🎊 抽卡結果！';
  resultEl.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'gacha-result-grid';

  for (const result of results) {
    grid.appendChild(buildResultCard(result, poolId));
  }

  resultEl.appendChild(grid);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-primary';
  closeBtn.textContent = '收下！';
  closeBtn.addEventListener('click', () => {
    resultEl.classList.add('hidden');
    resultEl.innerHTML = '';
  });
  resultEl.appendChild(closeBtn);

  resultEl.scrollIntoView({ behavior: 'smooth' });
}

function buildResultCard(result, poolId) {
  const card = document.createElement('div');
  card.className = 'result-card flip-in';

  let emoji = '❓';
  let name = '';
  let rarityLabel = '';
  let color = '#aaa';
  let extra = '';

  if (poolId === 'pig') {
    const breed = PIG_TYPE_MAP[result.value];
    emoji = breed.emoji;
    name = breed.name;
    rarityLabel = RARITY_LABELS[breed.rarity];
    color = RARITY_COLORS[breed.rarity];
    if (result.noSpace) extra = '<div class="result-extra warn">⚠️ 豬舍已滿，豬豬走失了…</div>';
    // Dragon flies!
    if (breed.id === 'dragon') card.classList.add('legendary-glow');
  } else if (poolId === 'feed') {
    const feed = FEED_TYPE_MAP[result.value];
    emoji = feed.emoji;
    name = feed.name;
    rarityLabel = FEED_RARITY_LABELS[feed.rarity];
    extra = '<div class="result-extra">×3 份</div>';
  } else if (poolId === 'pen') {
    const tier = PEN_TIER_MAP[result.value];
    emoji = tier.emoji;
    name = tier.name;
    rarityLabel = `Tier ${tier.tier}`;
  } else if (poolId === 'item') {
    const item = ITEM_TYPE_MAP[result.value];
    emoji = item.emoji;
    name = item.name;
    rarityLabel = '道具';
  }

  card.style.setProperty('--result-color', color);
  card.innerHTML = `
    <div class="result-color-bar"></div>
    <div class="result-emoji">${emoji}</div>
    <div class="result-name">${name}</div>
    <div class="result-rarity">${rarityLabel}</div>
    ${extra}
  `;
  return card;
}

function renderItemInventory(state, container) {
  if (!container) return;
  container.innerHTML = '';
  const items = Object.entries(state.itemInventory ?? {}).filter(([, qty]) => qty > 0);

  if (items.length === 0) {
    container.innerHTML = '<p class="empty-msg">背包是空的，去道具池抽看看！</p>';
    return;
  }

  for (const [id, qty] of items) {
    const item = ITEM_TYPE_MAP[id];
    if (!item) continue;
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <span class="item-emoji">${item.emoji}</span>
      <div class="item-info">
        <div class="item-name">${item.name} ×${qty}</div>
        <div class="item-desc">${item.description}</div>
        ${!item.autoUse ? `<button class="btn btn-sm btn-secondary" data-item="${id}">手動使用</button>` : '<span class="auto-badge">自動觸發</span>'}
      </div>
    `;
    const useBtn = card.querySelector('[data-item]');
    if (useBtn) {
      useBtn.addEventListener('click', () => {
        import('../game.js'); // no-op, engine passed via closure not imported
      });
    }
    container.appendChild(card);
  }
}
