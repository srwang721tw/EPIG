/**
 * @fileoverview Shop tab: buy pigs and feed directly.
 */

import { PIG_TYPES } from '../data/pigTypes.js';
import { FEED_TYPES } from '../data/feedTypes.js';
import { RARITY_LABELS, RARITY_COLORS } from '../data/pigTypes.js';
import { FEED_RARITY_LABELS } from '../data/feedTypes.js';
import { alert } from './modal.js';

const FEED_RARITY_COLORS = {
  1: '#a8c8a0',
  2: '#7eb8e0',
  3: '#b07fc8',
  4: '#e8a830',
  5: '#ff6b9d',
};

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
    <div id="shop-feed" class="shop-grid"></div>
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
  card.style.setProperty('--rarity-color', RARITY_COLORS[breed.rarity]);
  const canAfford = state.coins >= breed.buyPrice;

  card.innerHTML = `
    <div class="shop-rarity-bar"></div>
    <div class="shop-emoji">${breed.emoji}</div>
    <div class="shop-name">${breed.name}</div>
    <div class="shop-rarity">${RARITY_LABELS[breed.rarity]}</div>
    <div class="shop-desc">${breed.description}</div>
    <div class="shop-flavor">「${breed.flavorText}」</div>
    <button class="btn ${canAfford ? 'btn-primary' : 'btn-disabled'} btn-sm shop-buy-btn">
      💰 ${breed.buyPrice.toLocaleString()} 金幣
    </button>
  `;

  if (canAfford) {
    card.querySelector('.shop-buy-btn').addEventListener('click', () => {
      if (!engine.buyPig(breed.id)) {
        alert('購買失敗', '金幣不足，或所有豬舍都滿了。請先升級豬舍或購買新豬舍。');
      }
    });
  }

  return card;
}

function buildShopFeedCard(feed, state, engine) {
  const card = document.createElement('div');
  card.className = 'shop-card shop-card-sm';
  card.style.setProperty('--rarity-color', FEED_RARITY_COLORS[feed.rarity] ?? '#aaa');
  const canAfford = state.coins >= feed.price;
  const stock = state.inventory[feed.id] ?? 0;

  card.innerHTML = `
    <div class="shop-rarity-bar"></div>
    <div class="shop-emoji">${feed.emoji}</div>
    <div class="shop-name">${feed.name}</div>
    <div class="shop-rarity">${FEED_RARITY_LABELS[feed.rarity]}</div>
    <div class="feed-stats">
      飽食 +${feed.hungerRestore}
      ${feed.healthBonus ? ` ❤️+${feed.healthBonus}` : ''}
      ${feed.affectionBonus ? ` 💕+${feed.affectionBonus}` : ''}
    </div>
    <div class="shop-flavor">「${feed.flavorText}」</div>
    <div class="feed-stock">庫存：${stock}</div>
    <div class="feed-buy-row">
      <button class="btn ${canAfford ? 'btn-primary' : 'btn-disabled'} btn-sm" data-qty="1">×1 ${feed.price}金</button>
      <button class="btn ${state.coins >= feed.price * 5 ? 'btn-secondary' : 'btn-disabled'} btn-sm" data-qty="5">×5 ${feed.price * 5}金</button>
    </div>
  `;

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
