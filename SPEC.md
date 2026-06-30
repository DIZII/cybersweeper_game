# Cipher Sweeper Specification

## Objective

Build a small but complete browser Minesweeper-inspired netrunner game with a polished visual identity, deterministic game logic, tests, and challenge documentation.

## Game Rules

Cipher Sweeper follows classic Minesweeper rules with cyberpunk naming:

- The board contains hidden cells and a fixed number of network errors.
- Revealing a network error ends the game.
- Revealing a safe cell shows the number of adjacent errors.
- Revealing a safe cell with zero adjacent errors expands to nearby safe cells.
- Players may flag hidden cells as suspected errors.
- Players may question-mark uncertain hidden cells.
- The player wins when all non-error cells are revealed.

Project-specific rules:

- The first reveal is always safe.
- The first reveal also protects neighboring cells when the board has enough space.
- A seeded board is generated only after the first reveal, using the seed and first cell index.
- Safe ping highlights one safe hidden cell and consumes one ping charge.
- Daily cipher uses a date-based seed for the current local day.

## Scope

### In Scope

- Static browser game.
- Three board presets.
- Custom board dimensions and error count.
- Board scale controls.
- Runner alias entry before each run.
- Local leaderboard per preset and custom board configuration.
- Local cyberpunk soundtrack playback with track selection and volume control.
- Left-click reveal.
- Right-click flag.
- Right-click question mark cycle.
- Double-click chord reveal.
- Timer, error counter, safe-cell counter, and ping counter.
- Win/loss modal.
- Loss state reveals every network error on the field.
- Unit tests for core game logic.
- GitHub Pages-ready static build.

### Out of Scope

- Multiplayer.
- Backend persistence.
- Account system.
- Global leaderboard.
- Animated replay export.
- Mobile app packaging.

## Functional Requirements

1. A player can start a new randomized cipher.
2. A player can start a daily cipher.
3. A player can choose between Junior, Middle, and Senior presets.
4. A player can reveal hidden cells.
5. A player can flag and unflag hidden cells.
6. A player can question-mark uncertain hidden cells.
7. The game prevents revealed cells from being marked.
8. The game prevents flagged cells from being revealed.
9. The first reveal never exposes a network error.
10. The game expands empty safe regions.
11. The game detects win and loss states.
12. The game reveals all network errors after loss.
13. The game auto-flags errors after win.
14. The game provides limited safe ping hints.
15. The game records winning runs in a local leaderboard for the current mode.
16. The game lets the player start or pause bundled music and adjust volume.
17. The UI remains playable without external services.

## Acceptance Criteria

- `npm test` passes.
- `npm run build` creates a complete static app in `dist/`.
- The GitHub Pages workflow publishes the static app from the `main` branch.
- The game can be played from a local static server.
- A new game starts in the ready state.
- The first clicked cell is safe for every preset.
- A network error reveal ends the game with a loss state.
- Revealing all safe cells ends the game with a win state.
- Seeded games reproduce the same error layout for the same first reveal.
- Winning runs are ranked by time, then probe count, per mode.
- Music volume defaults to 20% and can be changed by the player.
- The repository contains `README.md`, `SPEC.md`, `ARCHITECTURE.md`, `RETROSPECTIVE.md`, and `DEPLOYMENT.md`.
