/**
 * @fileoverview Coordinates all UI panels and tab switching.
 */

import { renderHud } from './hud.js';
import { renderPenView } from './penView.js';
import { renderShopView } from './shopView.js';
import { renderGachaView } from './gachaView.js';
import { checkPendingEvent } from './eventView.js';

const TABS = ['pen', 'shop', 'gacha'];

export class UIManager {
  constructor(engine) {
    this.engine = engine;
    this.activeTab = 'pen';
  }

  init() {
    this._bindTabs();
    this.engine.on('stateChanged', () => this.render());
    this.render();
  }

  render() {
    const { state } = this.engine;
    renderHud(state);
    this._renderActiveTab(state);
    checkPendingEvent(state, this.engine);
  }

  _renderActiveTab(state) {
    if (this.activeTab === 'pen') renderPenView(state, this.engine);
    else if (this.activeTab === 'shop') renderShopView(state, this.engine);
    else if (this.activeTab === 'gacha') renderGachaView(state, this.engine);
  }

  _bindTabs() {
    for (const tab of TABS) {
      const btn = document.getElementById(`tab-btn-${tab}`);
      if (!btn) continue;
      btn.addEventListener('click', () => {
        this.activeTab = tab;
        this._updateTabHighlight();
        this._renderActiveTab(this.engine.state);
      });
    }
    this._updateTabHighlight();
  }

  _updateTabHighlight() {
    for (const tab of TABS) {
      const btn = document.getElementById(`tab-btn-${tab}`);
      const panel = document.getElementById(`tab-${tab}`);
      if (btn) btn.classList.toggle('tab-active', tab === this.activeTab);
      if (panel) panel.classList.toggle('hidden', tab !== this.activeTab);
    }
  }
}
