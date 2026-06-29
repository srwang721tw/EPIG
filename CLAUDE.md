# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

No build step required. Serve the root directory with any static HTTP server:

```bash
npx serve -p 3737 .
# or
python3 -m http.server 3737
```

Then open `http://localhost:3737`. The game uses ES Modules so it **must** be served over HTTP (not `file://`).

## Architecture

Pure client-side PWA: HTML + CSS + Vanilla JavaScript (ES Modules). No framework, no bundler. Game state lives entirely in `localStorage`.

### Data Flow

```
main.js → GameEngine (game.js) → Systems → State mutation → UIManager re-renders
```

- **GameEngine** owns the single mutable `state` object and exposes player action methods (`petPig`, `feedPig`, `sellPig`, `gachaPull`, etc.)
- **Systems** (`src/systems/`) are pure functions that mutate state in place; called by GameEngine on each tick and on offline catch-up
- **UI** (`src/ui/`) reads state and calls engine methods; never mutates state directly
- **GameEngine** emits `stateChanged` event after every mutation; UIManager listens and re-renders the active tab

### State Shape

```js
{
  coins, day, lastSavedAt,
  pigs: { [pigId]: PigObject },
  pens: { [penId]: PenObject },
  inventory: { [feedId]: qty },        // feed stock
  itemInventory: { [itemId]: qty },    // disaster items
  gachaPity: { pig, feed, pen, item }, // pull counters for pity system
  activeDebuffs: {},                   // market crash, drought, epidemic
  activeBonuses: {},                   // fair, etc.
  nextEventDay, pendingEventDisplay,
  events: []                           // transient log, cleared after UI shows
}
```

### Tick Loop

Real-time: every 10 seconds in-browser. On page load, `elapsedMs()` from `timeSystem.js` computes offline delta (capped at 8 real hours) and applies it via `applyTimeDelta()`.

### Key Constants

- 1 game day = 2 real hours (`MS_PER_GAME_DAY` in `timeSystem.js`)
- Tick interval = 10s (`TICK_INTERVAL_MS` in `game.js`)
- Hunger decay = 5/hr, affection decay = 1/hr (`healthSystem.js`)
- Disease grace period = 30 min (`diseaseSystem.js`)

## Code Style

Google Style Docstrings on all exported functions. KISS / DRY / SOLID. No TypeScript — use JSDoc `@typedef` and `@param` for type hints.

## Game Content

All tunable data (pig breeds, feed types, pen tiers, items, event definitions) lives in `src/data/`. Modify those files to balance/add content without touching logic.

## Deployment

GitHub Pages from the `main` branch root. After pushing, enable Pages in repo settings → "Deploy from branch" → `main` / `(root)`.
