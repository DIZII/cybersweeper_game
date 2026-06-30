# Cipher Sweeper Deployment

This project is ready to publish through GitHub Pages so reviewers can play it from a link without cloning the repository.

## GitHub Repository Setup

1. Create or open the repository:
   `https://github.com/DIZII/cybersweeper_game`
2. Push all source files, documentation, tests, and assets to the `main` branch.
3. In the repository settings, open **Pages** and set **Build and deployment** to **GitHub Actions**.
4. Make sure the default branch contains `.github/workflows/pages.yml`.

## Required Repository Files

The challenge-required files are included:

- `README.md`
- `SPEC.md`
- `ARCHITECTURE.md`
- `RETROSPECTIVE.md`

Supporting project files are included:

- `index.html`
- `src/`
- `assets/`
- `tests/`
- `scripts/`
- `package.json`
- `.github/workflows/pages.yml`

## Local Validation Before Push

Run this before pushing:

```bash
npm run check
```

This runs:

- Node.js unit tests
- UI/source smoke checks
- Static build into `dist/`

## GitHub Pages Workflow

The `.github/workflows/pages.yml` file defines a Pages deployment:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - run: npm run check
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v5
```

The local build writes the complete static app to `dist/`. The workflow uploads `dist/` as the GitHub Pages artifact and publishes it from the `main` branch.

## How To Get The Playable Link

1. Push to `main`.
2. Open the repository **Actions** tab and wait for **Deploy GitHub Pages** to pass.
3. Open **Settings > Pages** to confirm the live URL.
4. Add that URL to the `README.md` **Play Online** section if it changes.

Current deployed URL:

- [https://dizii.github.io/cybersweeper_game/](https://dizii.github.io/cybersweeper_game/)

## Expected Reviewer Flow

After Pages is enabled, a reviewer should be able to:

1. Open `README.md`.
2. Click the GitHub Pages link.
3. Play Cipher Sweeper directly in the browser.

No clone, install, build, or local server should be required.
