# Cipher Sweeper Retrospective

This retrospective captures the AI-native development process used to build Cipher Sweeper for the AI-Native Engineering Challenge.

## AI Tools Used

- ChatGPT for initial ideation and challenge interpretation.
- Codex for repository inspection, implementation, test writing, documentation, and iterative UI refinement.
- Built-in image generation for the cyberpunk-inspired background.

## Development Workflow

1. Extracted the challenge requirements from the provided DOCX.
2. Compared candidate games for scope, uniqueness, and demo value.
3. Selected a stylized Minesweeper variant after Connect Four appeared too common among participants.
4. Started with a lightweight static architecture to reduce setup friction.
5. Built core game logic separately from UI so tests could drive confidence.
6. Iterated on visual direction with user feedback: first a hand-drawn Minesweeper look, then a cyberpunk netrunner/cipher theme.
7. Added deployability through GitHub Pages so reviewers can play from a link.

## What Worked Well

- The challenge brief was easy to convert into concrete deliverables.
- Minesweeper has compact rules but enough edge cases to make testing meaningful.
- Separating game logic from rendering made the implementation easier to validate.
- The AI workflow was especially useful for fast iteration across UI, tests, and docs.
- Keeping the project dependency-free made local validation and GitHub Pages deployment straightforward.

## What Did Not Work Well

- The visual polish requirements compete with keeping the game small.
- Minesweeper has subtle edge cases around first-click safety, flood fill, flags, and chord reveal.
- Browser preview/server state required occasional manual checking because a stopped local server can look like an application failure.
- The theme evolved significantly, so some names and documentation needed cleanup after the core mechanics were already working.

## Surprises and Discoveries

- A no-dependency static app is enough for a polished game and GitHub Pages deployment.
- Seeded board generation needs to include the first revealed cell to preserve both reproducibility and first-click safety.
- Local leaderboards can provide replay value without backend persistence.
- Prompting for a player alias before each run creates a clearer leaderboard story than recording anonymous scores.

## Estimated Percentage of AI-Generated Code

Approximate estimate: 90%.

Most source code, tests, and documentation were drafted or edited through Codex. Human direction was strongest around product taste, feature selection, naming, visual feedback, and acceptance decisions.

## Time Spent

Approximate time: one extended implementation session plus several short iterative refinement passes.

The largest time investments were visual refinement, custom board controls, leaderboard behavior, and deployment/documentation readiness.

## What I Would Do Differently Next Time

- Decide earlier whether to optimize for GitHub Pages simplicity or framework familiarity.
- Add visual regression screenshots once the core mechanics are stable.
- Lock the game lore and naming earlier to reduce later cleanup.
- Add a small browser-based interaction test if the project grows beyond static smoke checks.

## Key Lessons Learned

- AI-native work benefits from a narrow MVP and explicit acceptance criteria.
- A familiar game can feel distinct when the theme and one or two mechanics are thoughtfully scoped.
- Tests are most useful when they cover game invariants rather than UI implementation details.
- Deployment should be treated as part of the product, not as a final afterthought.
- The retrospective is most useful when updated during the project, not reconstructed only at the end.
