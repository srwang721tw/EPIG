/**
 * @fileoverview Top HUD bar: coins, day counter, notification badge.
 */

/**
 * @param {Object} state
 */
export function renderHud(state) {
  const dayEl = document.getElementById('hud-day');
  const coinsEl = document.getElementById('hud-coins');
  const notifEl = document.getElementById('hud-notif');

  if (dayEl) dayEl.textContent = `第 ${Math.floor(state.day)} 天`;
  if (coinsEl) coinsEl.textContent = `💰 ${state.coins.toLocaleString()} 金幣`;

  // Notification badge: count dead pigs not yet removed
  const deadCount = Object.values(state.pigs).filter(p => p.isDead).length;
  if (notifEl) {
    notifEl.textContent = deadCount > 0 ? `⚠️ ${deadCount}` : '';
    notifEl.style.display = deadCount > 0 ? 'inline' : 'none';
  }
}
