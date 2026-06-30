# Cipher Sweeper

Cipher Sweeper is a stylized browser Minesweeper game built for the AI-Native Engineering Challenge. The player is a netrunner cracking a hostile cipher grid: safe nodes reveal clues, network errors are hidden traps, and a failed probe exposes every error node on the field.

## Play Online

Play the deployed GitHub Pages version here:

- [Open Cipher Sweeper](https://dizii.github.io/cybersweeper_game/)

No clone, install, build, or local server is required for reviewers.

## Game Description

- Three board sizes: Junior, Middle, and Senior.
- Custom boards support user-defined rows, columns, and network errors.
- Custom errors are capped at 70% of the field.
- Board scale can be set to Compact, Standard, or Large.
- Runner alias is required before a cipher run.
- Local leaderboards track the fastest clean runs per mode.
- Cyberpunk soundtrack controls include three bundled tracks and default to 20% volume.
- First reveal always creates a safe opening.
- Right-click cycles hidden nodes through flag, question mark, and clear states.
- Double-clicking an open numbered node attempts a chord reveal.
- Safe ping highlights a safe hidden node with limited charges.
- Seeded generation keeps daily and randomized runs reproducible internally.
- Daily cipher generates a date-based challenge seed.
- A fixed cyberpunk-inspired visual mode keeps the experiment focused.
- Custom cyber tile SVGs and the attached network-error image redraw the board as a neon cipher grid.

## Local Development

The deployed Pages link above is the primary way to play. For local development, no package installation is required; the project uses browser ES modules and Node.js built-in tooling.

```bash
npm test
npm run build
npm start
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) after starting the local server.

## Scripts

- `npm start`: serve the game locally.
- `npm test`: run Node.js unit tests for game logic.
- `npm run smoke`: run lightweight UI structure checks.
- `npm run build`: copy the static app into `dist/`.
- `npm run check`: run unit tests, smoke checks, and build.

## Deployment

The project includes a GitHub Pages workflow in `.github/workflows/pages.yml`. It runs the full local validation command, builds the static site into `dist/`, uploads the Pages artifact, and publishes it from `main`.

See `DEPLOYMENT.md` for the GitHub Pages publishing checklist.

## Assets

Cyber tile images live in `assets/cyber-tiles/` and are original SVG assets for the experimental visual mode. `assets/network-error.png` is the attached network-error marker used for hidden errors. Soundtrack files live in `assets/music/` and are user-provided no-copyright cyberpunk tracks. The earlier provided tile art remains in `assets/tiles/` for reference.

The UI uses the Orbitron variable font from `assets/fonts/`, bundled with its OFL license.

## Challenge Deliverables

- `SPEC.md`: rules, scope, requirements, and acceptance criteria.
- `ARCHITECTURE.md`: stack, design decisions, and AI-native workflow.
- `RETROSPECTIVE.md`: living retrospective for the AI-native development process.
- `DEPLOYMENT.md`: GitHub Pages publishing instructions.
