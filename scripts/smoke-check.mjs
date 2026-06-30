import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const [html, css, view, boardModel, musicModel, main, leaderboard, readme, deployment, pagesWorkflow] =
  await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "src/styles.css"), "utf8"),
    readFile(resolve(root, "src/ui/gameView.js"), "utf8"),
    readFile(resolve(root, "src/game/board.js"), "utf8"),
    readFile(resolve(root, "src/game/music.js"), "utf8"),
    readFile(resolve(root, "src/main.js"), "utf8"),
    readFile(resolve(root, "src/game/leaderboard.js"), "utf8"),
    readFile(resolve(root, "README.md"), "utf8"),
    readFile(resolve(root, "DEPLOYMENT.md"), "utf8"),
    readFile(resolve(root, ".github/workflows/pages.yml"), "utf8")
  ]);

const fontStat = await stat(resolve(root, "assets/fonts/Orbitron-VariableFont_wght.ttf"));
assert.ok(fontStat.size > 0, "Orbitron variable font should exist");

const cyberBackground = await stat(resolve(root, "assets/cyberpunk-grid-bg.png"));
assert.ok(cyberBackground.size > 0, "Cyberpunk background image should exist");

const networkError = await stat(resolve(root, "assets/network-error.png"));
assert.ok(networkError.size > 0, "Network error image from the attachment should exist");

for (const track of ["glory", "extreme", "endgame"]) {
  const musicTrack = await stat(resolve(root, `assets/music/${track}.mp3`));
  assert.ok(musicTrack.size > 0, `${track} soundtrack should exist`);
}

for (const tile of ["hidden", "empty", "flag", "question", "error-triggered"]) {
  const tileStat = await stat(resolve(root, `assets/cyber-tiles/${tile}.svg`));
  assert.ok(tileStat.size > 0, `${tile} cyber tile should exist`);
}

assert.match(html, /<body data-theme="cyber">/, "Cyber theme should be the branch default");
assert.match(html, /Netrunner Protocol/, "Netrunner lore should be visible");
assert.match(html, /Hack the Cipher/, "Cipher objective should be visible");
assert.match(html, /Errors/, "Errors should replace mines in visible UI");
assert.match(html, /Safe ping/, "Safe ping should replace signal scan in visible UI");
assert.match(html, /class="leaderboard-deck"/, "Leaderboard should live in a dedicated right rail");
assert.match(html, /class="music-group"/, "Music controls should live below the leaderboard");
assert.match(html, /class="leaderboard-deck"[\s\S]*class="music-group"/, "Music controls should be inside the right rail");
assert.match(html, /<h2>Music<\/h2>/, "Music controls should exist");
assert.match(html, /id="musicPlayer"/, "Music audio element should exist");
assert.match(html, /id="musicVolumeValue"[^>]*>20%/, "Music volume should default to 20%");
assert.doesNotMatch(html, /class="music-dock"/, "Music controls should not use a floating dock");
assert.doesNotMatch(html, /id="themeControls"/, "Theme selector should be removed");
assert.doesNotMatch(html, /data-theme-choice=/, "Alternate theme buttons should be removed");
assert.match(html, /data-icon="N"/, "Cyber action icons should exist");
assert.doesNotMatch(html, /id="seedText"/, "Signal seed display should be removed");
assert.doesNotMatch(html, /id="copySeedButton"/, "Signal copy button should be removed");
assert.doesNotMatch(html, /<h2>Signal<\/h2>/, "Signal control group should be removed");
assert.doesNotMatch(html, />Mines</, "Visible UI should not say Mines");

for (const id of [
  "helpButton",
  "helpModal",
  "helpCloseButton",
  "customFieldForm",
  "customRows",
  "customCols",
  "customMines",
  "customMineLimit",
  "scaleControls",
  "runnerName",
  "runnerNameHint",
  "leaderboardMode",
  "leaderboardList",
  "musicToggleButton",
  "musicTrackSelect",
  "musicVolume",
  "musicVolumeValue"
]) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} should exist in index.html`);
}

for (const copy of [
  "Runner alias",
  "New cipher",
  "Daily cipher",
  "Safe ping",
  "Mark mode",
  "Custom field",
  "Scale",
  "Leaderboard",
  "Music"
]) {
  assert.match(html, new RegExp(copy), `Help copy should mention ${copy}`);
}

assert.doesNotMatch(html, /<dt>Signal<\/dt>/, "Help copy should not mention signal sharing");

assert.match(view, /openHelp/, "Help modal should have open behavior");
assert.match(view, /closeHelp/, "Help modal should have close behavior");
assert.match(view, /syncMineLimit/, "Custom mine limit should update from dimensions");
assert.match(view, /getMaxMines/, "Custom mine max should use board model rules");
assert.match(view, /onCustomField/, "Custom board submission should call app state");
assert.match(view, /onScaleChange/, "Scale controls should call app state");
assert.match(view, /requireRunnerName/, "Runner alias should be required before sessions");
assert.match(view, /renderLeaderboard/, "Leaderboard should render from app state");
assert.match(view, /setMusicVolume/, "Music volume should update the audio element");
assert.match(view, /toggleMusic/, "Music playback should be user controlled");
assert.match(view, /musicPlayer\.addEventListener\("ended",\s*playNextMusicTrack\)/, "Music should advance when a track ends");
assert.match(view, /function playNextMusicTrack/, "Music should define auto-next playback");
assert.match(view, /getNextMusicTrack\(musicTracks,\s*musicTrackSelect\.value\)/, "Music auto-next should use the tested next-track helper");
assert.match(view, /onMusicTrackChange\?\.\(nextTrack\.id\)/, "Music auto-next should persist the new track");
assert.doesNotMatch(view, /copySeedButton/, "Signal copy wiring should be removed");
assert.doesNotMatch(view, /themeControls/, "Theme control wiring should be removed");
assert.doesNotMatch(view, /onThemeChange/, "Theme switching callback should be removed");
assert.match(view, /function fitControlLabels/, "Control buttons should auto-fit their labels");
assert.match(view, /\.music-group button/, "Auto-fit should include right-rail music buttons");
assert.match(view, /scrollWidth > button\.clientWidth/, "Auto-fit should check button text width");
assert.match(view, /document\.fonts\?\.ready\.then\(fitControlLabels\)/, "Auto-fit should rerun after fonts load");
assert.match(css, /\.help-button/, "Floating help button styles should exist");
assert.match(css, /\.help-dialog/, "Help dialog styles should exist");
assert.match(css, /@font-face\s*{[^}]*font-family:\s*"Orbitron"/s, "Orbitron font face should be declared");
assert.match(css, /font-family:\s*"Orbitron"/, "Orbitron should be the site font");
assert.match(css, /body\[data-theme="cyber"\]/, "Cyber theme styles should exist");
assert.match(css, /cyberpunk-grid-bg\.png/, "Cyber background should be referenced by CSS");
assert.match(css, /network-error\.png/, "Network error asset should be used for error cells");
assert.match(css, /linear-gradient\(135deg,\s*rgba\(255,\s*253,\s*234,\s*0\.36\)/, "Opened cells should be lighter than hidden cells");
assert.match(css, /\.leaderboard-deck/, "Leaderboard rail styles should exist");
assert.match(css, /\.leaderboard-list/, "Leaderboard styles should exist");
assert.match(css, /\.music-group\s*{[^}]*margin-top:\s*auto/s, "Music group should pin to the lower part of the right rail");
assert.match(css, /\.music-group\s*{[^}]*border-top:\s*1px solid var\(--line\)/s, "Music group should keep a divider from leaderboard content");
assert.doesNotMatch(css, /\.music-dock\s*{[^}]*position:\s*fixed/s, "Music controls should not be fixed to the viewport");
assert.match(css, /\.music-panel/, "Music panel styles should exist");
assert.match(css, /accent-color:\s*var\(--accent\)/, "Music volume slider should use theme accent color");
assert.match(css, /\.input-error/, "Runner alias validation styles should exist");
assert.match(css, /assets\/cyber-tiles\/hidden\.svg/, "Cyber tile assets should be used");
assert.match(css, /@keyframes titleGlitch/, "Cyber title glitch animation should exist");
assert.match(css, /@keyframes cellReveal/, "Cell reveal animation should exist");
assert.match(css, /@keyframes breachFlash/, "Error breach animation should exist");
assert.match(css, /\.board\[data-status="lost"\] \.cell\.mine::after/, "Loss state should visibly outline all error cells");
assert.match(css, /\.modal-backdrop\[data-state="lost"\]/, "Loss modal should not hide the revealed error field");
assert.match(css, /body\[data-board-scale="compact"\] \.board/, "Compact board scale should exist");
assert.match(css, /body\[data-board-scale="large"\] \.board/, "Large board scale should exist");
assert.match(css, /color-mix\(in srgb,\s*var\(--panel\) 72%,\s*transparent\)/, "Cyber panels should let the background show through");
assert.match(css, /backdrop-filter:\s*blur\(5px\)/, "Transparent cyber panels should keep text readable");
assert.match(css, /body\[data-theme="cyber"\] \.game-layout\s*{[^}]*grid-template-columns:\s*310px minmax\(0,\s*1fr\) 280px/s, "Cyber layout should place controls left and leaderboard right");
assert.match(css, /body\[data-theme="cyber"\] \.action-grid\s*{[^}]*grid-template-columns:\s*1fr/s, "Cyber action controls should have room for labels");
assert.match(css, /\.control-deck\s*{[^}]*font-weight:\s*400/s, "Right menu should use regular text weight");
assert.match(css, /\.control-deck h2\s*{[^}]*font-weight:\s*800/s, "Right menu headings should stay bold");
assert.match(css, /\.control-deck \.segment,[\s\S]*?font-weight:\s*400/s, "Right menu controls should use regular weight");
assert.match(css, /white-space:\s*nowrap/, "Control labels should stay on one line");
assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/, "Control labels should not break inside words");
assert.match(boardModel, /maxMineRatio:\s*0\.7/, "Custom mine ratio should be capped at 70%");
assert.match(boardModel, /normalizeCustomConfig/, "Custom config should be normalized in game model");
assert.match(musicModel, /export function getNextMusicTrack/, "Music model should expose next-track logic");
assert.match(musicModel, /nextIndex % tracks\.length/, "Music model should wrap to the first track");
assert.match(main, /cipher-sweeper-board-scale/, "Board scale should persist locally");
assert.match(main, /cipher-sweeper-custom-config/, "Custom board config should persist locally");
assert.match(main, /cipher-sweeper-leaderboards/, "Leaderboards should persist locally");
assert.match(main, /cipher-sweeper-music-volume/, "Music volume should persist locally");
assert.match(main, /DEFAULT_MUSIC_VOLUME\s*=\s*20/, "Music volume should default to 20%");
assert.match(main, /assets\/music\/glory\.mp3/, "Music track assets should be registered");
assert.match(main, /recordWinIfNeeded/, "Winning runs should be recorded");
assert.match(leaderboard, /getModeKey/, "Leaderboard mode keys should exist");
assert.match(leaderboard, /addLeaderboardEntry/, "Leaderboard insertion should exist");
assert.match(leaderboard, /normalizeRunnerName/, "Runner names should be normalized");
assert.match(readme, /Play Online/, "README should explain where the deployed link goes");
assert.match(readme, /DEPLOYMENT\.md/, "README should point to deployment instructions");
assert.match(deployment, /GitHub Pages/, "Deployment guide should cover GitHub Pages");
assert.match(deployment, /Settings > Pages/, "Deployment guide should explain where to find the Pages URL");
assert.match(pagesWorkflow, /actions\/checkout@v7/, "Pages workflow should use the current checkout action");
assert.match(pagesWorkflow, /actions\/setup-node@v6/, "Pages workflow should use the current setup-node action");
assert.match(pagesWorkflow, /actions\/configure-pages@v6/, "Pages workflow should configure GitHub Pages");
assert.match(pagesWorkflow, /actions\/upload-pages-artifact@v5/, "Pages workflow should upload the Pages artifact");
assert.match(pagesWorkflow, /actions\/deploy-pages@v5/, "Pages workflow should deploy GitHub Pages");
assert.match(pagesWorkflow, /npm run check/, "Pages workflow should run full validation");
assert.match(pagesWorkflow, /path:\s*dist/, "Pages workflow should publish the dist artifact");

const previousHostPattern = new RegExp("ring" + "central", "i");
for (const fileContent of [readme, deployment, pagesWorkflow]) {
  assert.doesNotMatch(fileContent, previousHostPattern, "Public deployment files should not mention the previous host");
}

const cellSizeMatch = css.match(/--cell-size:\s*clamp\(([^)]+)\)/);
assert.ok(cellSizeMatch, "Board cell size clamp should exist");

const maxCellSize = Number.parseFloat(cellSizeMatch[1].split(",").at(-1));
assert.ok(
  maxCellSize <= 36,
  `Standard board max cell size should stay at or below 36px; found ${maxCellSize}px`
);

console.log("Smoke check passed");
