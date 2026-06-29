/**
 * @fileoverview Shop tab: buy pigs and feed directly.
 * Feed items rendered with canvas icons.
 */

import { PIG_TYPES, RARITY_LABELS, RARITY_COLORS } from '../data/pigTypes.js';
import { FEED_TYPES, FEED_RARITY_LABELS } from '../data/feedTypes.js';
import { PEN_TIERS } from '../data/penTiers.js';
import { drawFeedIcon } from '../rendering/feedIcons.js';
import { alert } from './modal.js';
import { drawPig } from '../rendering/pigRenderer.js';

const FEED_RARITY_COLORS = { 1:'#a8c8a0', 2:'#7eb8e0', 3:'#b07fc8', 4:'#e8a830', 5:'#ff6b9d' };

/**
 * @param {Object} state
 * @param {import('../game.js').GameEngine} engine
 */
export function renderShopView(state, engine) {
  const container = document.getElementById('tab-shop');
  if (!container) return;
  container.innerHTML = `
    <h3 class="section-title">🐷 購買豬豬</h3>
    <div id="shop-pigs" class="shop-grid"></div>
    <h3 class="section-title">🌾 購買飼料</h3>
    <div id="shop-feed" class="shop-grid shop-grid-feed"></div>
  `;

  const pigGrid = container.querySelector('#shop-pigs');
  for (const breed of PIG_TYPES) {
    pigGrid.appendChild(buildShopPigCard(breed, state, engine));
  }

  const feedGrid = container.querySelector('#shop-feed');
  for (const feed of FEED_TYPES) {
    feedGrid.appendChild(buildShopFeedCard(feed, state, engine));
  }
}

function buildShopPigCard(breed, state, engine) {
  const card = document.createElement('div');
  card.className = 'shop-card';
  const rarityColor = RARITY_COLORS[breed.rarity];
  card.style.setProperty('--rarity-color', rarityColor);
  const canAfford = state.coins >= breed.buyPrice;

  card.innerHTML = `
    <div class="shop-rarity-bar"></div>
    <canvas class="shop-pig-canvas" width="70" height="70"></canvas>
    <div class="shop-name">${breed.name}</div>
    <div class="shop-rarity" style="color:${rarityColor}">${RARITY_LABELS[breed.rarity]}</div>
    <div class="shop-desc">${breed.description}</div>
    <div class="shop-flavor">「${breed.flavorText}」</div>
    <button class="btn ${canAfford ? 'btn-primary' : 'btn-disabled'} btn-sm shop-buy-btn">
      💰 ${breed.buyPrice.toLocaleString()} 金幣
    </button>
  `;

  // Animate pig preview on canvas
  const pigCanvas = card.querySelector('.shop-pig-canvas');
  const pctx = pigCanvas.getContext('2d');
  let t = 0;
  let rafId;
  function animatePig() {
    pctx.clearRect(0, 0, 70, 70);
    drawPig(pctx, 35, 38, breed.id, breed.genderBias >= 0.5, 'idle', 0, t, false, false);
    t += 16;
    rafId = requestAnimationFrame(animatePig);
  }
  animatePig();
  // Stop animation when card is removed (via IntersectionObserver)
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId) animatePig();
  }).observe(card);

  if (canAfford) {
    card.querySelector('.shop-buy-btn').addEventListener('click', () => {
      if (!engine.buyPig(breed.id)) {
        alert('購買失敗', '金幣不足，或所有豬舍都已滿。請先升級豬舍或購買新豬舍。');
      }
    });
  }

  return card;
}

function buildShopFeedCard(feed, state, engine) {
  const card = document.createElement('div');
  card.className = 'shop-card shop-card-feed';
  const rarityColor = FEED_RARITY_COLORS[feed.rarity] ?? '#aaa';
  card.style.setProperty('--rarity-color', rarityColor);
  const canAfford = state.coins >= feed.price;
  const stock = state.inventory[feed.id] ?? 0;

  card.innerHTML = `
    <div class="shop-rarity-bar"></div>
    <canvas class="shop-feed-canvas" width="70" height="70"></canvas>
    <div class="shop-name">${feed.name}</div>
    <div class="shop-rarity" style="color:${rarityColor}">${FEED_RARITY_LABELS[feed.rarity]}</div>
    <div class="feed-stats">飽食 +${feed.hungerRestore}${feed.healthBonus ? ` ❤️+${feed.healthBonus}` : ''}${feed.affectionBonus ? ` 💕+${feed.affectionBonus}` : ''}</div>
    <div class="shop-flavor">「${feed.flavorText}」</div>
    <div class="feed-stock">庫存：${stock}</div>
    <div class="feed-buy-row">
      <button class="btn ${canAfford ? 'btn-primary' : 'btn-disabled'} btn-sm" data-qty="1">×1 ${feed.price}金</button>
      <button class="btn ${state.coins >= feed.price * 5 ? 'btn-secondary' : 'btn-disabled'} btn-sm" data-qty="5">×5 ${(feed.price * 5).toLocaleString()}金</button>
    </div>
  `;

  // Draw feed icon on canvas
  const feedCanvas = card.querySelector('.shop-feed-canvas');
  const fctx = feedCanvas.getContext('2d');
  drawFeedIcon(fctx, feed.id, 35, 38, 26);

  card.querySelectorAll('[data-qty]').forEach(btn => {
    const qty = parseInt(btn.dataset.qty, 10);
    if (state.coins >= feed.price * qty) {
      btn.addEventListener('click', () => {
        if (!engine.buyFeed(feed.id, qty)) {
          alert('金幣不足', `購買 ${qty} 份 ${feed.name} 需要 ${feed.price * qty} 金幣。`);
        }
      });
    }
  });

  return card;
}
