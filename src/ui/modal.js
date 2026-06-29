/**
 * @fileoverview Reusable modal component.
 */

/**
 * Shows a modal with arbitrary HTML content.
 * @param {string} title
 * @param {string} bodyHtml
 * @param {Array<{label: string, action: Function, primary?: boolean}>} buttons
 */
export function showModal(title, bodyHtml, buttons = []) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h2 class="modal-title">${title}</h2>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-buttons"></div>
    </div>
  `;

  const btnContainer = overlay.querySelector('.modal-buttons');
  for (const btn of buttons) {
    const el = document.createElement('button');
    el.textContent = btn.label;
    el.className = btn.primary ? 'btn btn-primary' : 'btn btn-secondary';
    el.addEventListener('click', () => {
      closeModal();
      btn.action?.();
    });
    btnContainer.appendChild(el);
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
}

export function closeModal() {
  document.getElementById('modal-overlay')?.remove();
}

/**
 * Simple confirm dialog.
 * @param {string} message
 * @param {Function} onConfirm
 */
export function confirm(message, onConfirm) {
  showModal('確認', `<p>${message}</p>`, [
    { label: '確定', action: onConfirm, primary: true },
    { label: '取消' },
  ]);
}

/**
 * Simple alert.
 * @param {string} title
 * @param {string} message
 */
export function alert(title, message) {
  showModal(title, `<p>${message}</p>`, [{ label: '好的', primary: true }]);
}
