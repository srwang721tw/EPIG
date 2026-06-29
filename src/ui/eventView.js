/**
 * @fileoverview Fullscreen event alert overlay for random disasters and bonuses.
 */

/**
 * Shows a fullscreen event alert.
 * @param {Object} event - the fired event definition with itemUsed, altItemUsed
 * @param {Function} onClose
 */
export function showEventAlert(event, onClose) {
  const existing = document.getElementById('event-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'event-overlay';
  overlay.className = event.isPositive ? 'event-overlay event-positive' : 'event-overlay event-negative';

  const blocked = event.itemUsed || event.altItemUsed;
  const statusText = event.isPositive
    ? ''
    : blocked
    ? '<div class="event-status blocked">✅ 道具成功減輕了損失！</div>'
    : '<div class="event-status unblocked">⚠️ 你沒有防禦道具，損失慘重！</div>';

  overlay.innerHTML = `
    <div class="event-box">
      <div class="event-emoji">${event.emoji}</div>
      <h2 class="event-title">${event.name}</h2>
      <p class="event-desc">${event.description}</p>
      ${statusText}
      ${event.countersItem && !event.itemUsed
        ? `<div class="event-tip">💡 下次可以備好「道具抽」中的對應道具來防範！</div>`
        : ''
      }
      <button class="btn btn-primary event-close-btn">了解了</button>
    </div>
  `;

  overlay.querySelector('.event-close-btn').addEventListener('click', () => {
    overlay.remove();
    onClose?.();
  });

  document.body.appendChild(overlay);
}

/**
 * Checks state for pending event display and shows it if present.
 * @param {Object} state
 * @param {import('../game.js').GameEngine} engine
 */
export function checkPendingEvent(state, engine) {
  if (!state.pendingEventDisplay) return;
  const event = state.pendingEventDisplay;
  showEventAlert(event, () => engine.clearPendingEvent());
}
