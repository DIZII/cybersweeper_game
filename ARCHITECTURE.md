# Cipher Sweeper Architecture

## Technology Stack

- Browser ES modules for runtime code.
- Plain HTML and CSS for UI structure and styling.
- Node.js built-in test runner for unit tests.
- Node.js static server for local development.
- GitHub Pages-compatible static build output.
- User-provided network-error PNG plus SVG tile assets for the cipher board.
- User-provided no-copyright MP3 files for the local cyberpunk soundtrack.

No framework or package install is required for the MVP. This keeps the project easy to run, easy to review, and resilient in restricted environments.

## Architecture Overview

```text
index.html
  src/main.js
    src/game/engine.js
      src/game/board.js
      src/game/rng.js
    src/game/leaderboard.js
    src/ui/gameView.js
  src/styles.css
tests/engine.test.js
tests/leaderboard.test.js
scripts/build.mjs
scripts/serve.mjs
.github/workflows/pages.yml
DEPLOYMENT.md
```

## Major Design Decisions

### Separate Game Engine from UI

The Minesweeper-style rules live in `src/game`. UI code calls pure-ish engine operations such as `revealCell`, `toggleFlag`, `revealAround`, and `scanSafeCell`. This makes the rules testable without a browser.

### Generate Errors After First Reveal

The board starts empty and is generated only after the first reveal. This guarantees a safe first click while keeping seeded boards reproducible by combining the seed, board dimensions, error count, and first cell index.

### Use Static Web Technology

The challenge rewards end-to-end completion and documentation. A static app avoids dependency and deployment overhead while still supporting a polished browser game, tests, and GitHub Pages deployment.

### Add One Distinctive Mechanic

Safe ping makes the project feel less like a basic Minesweeper clone. It is intentionally small: it highlights a safe hidden cell but does not reveal it, so the core game remains Minesweeper-like.

### Use Image Tiles for Board State

The board uses SVG tiles for hidden cells, revealed cells, flags, and question marks, plus the attached network-error PNG for error nodes. The UI still sets text labels through `aria-label`, so visual assets do not replace accessible state.

### Store Local Leaderboards

Leaderboards are stored in `localStorage` and keyed by mode. Presets use stable preset ids, while custom boards include rows, columns, and error count in the key. The leaderboard model is isolated in `src/game/leaderboard.js` so sorting and name normalization are unit-testable without a browser.

### Keep Audio Static and User-Started

The soundtrack uses bundled MP3 assets in `assets/music/` and a plain HTML audio element. Playback starts only after the player presses the music control, which keeps the app compatible with browser autoplay policies. Track and volume preferences are stored in `localStorage`, with volume defaulting to 20%.

## AI Tooling Used

- ChatGPT/Codex for extracting the challenge brief from the provided document.
- Codex for project planning, implementation, test creation, and documentation drafting.

## Agent Workflow

1. Read challenge requirements.
2. Select a scoped game concept.
3. Define MVP and unique differentiators.
4. Implement a testable game engine.
5. Build the browser UI.
6. Add validation scripts and documentation.
7. Run tests and iterate on failures.

## Validation Strategy

- Unit tests cover deterministic board generation, first-click safety, flag behavior, flood fill, scan behavior, chord behavior, custom boards, and leaderboard sorting.
- Static build verifies that browser, image, font, and music assets are packaged into `dist/`.
- CI uploads the `dist/` output as the GitHub Pages artifact.
- Local server verifies the game can be launched without a framework-specific runtime.
