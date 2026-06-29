/**
 * @fileoverview Entry point: bootstraps engine and UI.
 */

import { GameEngine } from './game.js';
import { UIManager } from './ui/uiManager.js';

const engine = new GameEngine();
const ui = new UIManager(engine);

engine.init();
ui.init();
