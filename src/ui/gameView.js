import { CUSTOM_LIMITS, getMaxMines, normalizeCustomConfig } from "../game/board.js";
import { getNextMusicTrack } from "../game/music.js";

export function mountGame(options) {
  const boardElement = document.querySelector("#board");
  const runnerNameInput = document.querySelector("#runnerName");
  const runnerNameHint = document.querySelector("#runnerNameHint");
  const statusText = document.querySelector("#statusText");
  const mineCounter = document.querySelector("#mineCounter");
  const timeCounter = document.querySelector("#timeCounter");
  const safeCounter = document.querySelector("#safeCounter");
  const scanCounter = document.querySelector("#scanCounter");
  const presetControls = document.querySelector("#presetControls");
  const customFieldForm = document.querySelector("#customFieldForm");
  const customRowsInput = document.querySelector("#customRows");
  const customColsInput = document.querySelector("#customCols");
  const customMinesInput = document.querySelector("#customMines");
  const customMineLimit = document.querySelector("#customMineLimit");
  const customFieldButton = document.querySelector("#customFieldButton");
  const scaleControls = document.querySelector("#scaleControls");
  const scanButton = document.querySelector("#scanButton");
  const markModeButton = document.querySelector("#markModeButton");
  const resultModal = document.querySelector("#resultModal");
  const resultTitle = document.querySelector("#resultTitle");
  const resultText = document.querySelector("#resultText");
  const resultKicker = document.querySelector("#resultKicker");
  const helpButton = document.querySelector("#helpButton");
  const helpModal = document.querySelector("#helpModal");
  const helpCloseButton = document.querySelector("#helpCloseButton");
  const leaderboardMode = document.querySelector("#leaderboardMode");
  const leaderboardList = document.querySelector("#leaderboardList");
  const musicPlayer = document.querySelector("#musicPlayer");
  const musicToggleButton = document.querySelector("#musicToggleButton");
  const musicTrackSelect = document.querySelector("#musicTrackSelect");
  const musicVolume = document.querySelector("#musicVolume");
  const musicVolumeValue = document.querySelector("#musicVolumeValue");

  const musicTracks = options.musicTracks ?? [];
  let markMode = false;
  let musicPlaying = false;
  let timer = null;

  setCustomInputs(options.initialCustomConfig ?? normalizeCustomConfig());
  setMusicControls();

  presetControls.replaceChildren(
    ...Object.values(options.presets).map((preset) => {
      const button = document.createElement("button");
      button.className = "segment";
      button.type = "button";
      button.dataset.preset = preset.id;
      button.textContent = preset.label;
      return button;
    })
  );

  bindEvents();
  startTimer();

  function render() {
    const game = options.getGame();
    const safeTotal = game.config.rows * game.config.cols - game.config.mines;

    boardElement.style.setProperty("--rows", game.config.rows);
    boardElement.style.setProperty("--cols", game.config.cols);
    boardElement.setAttribute("aria-rowcount", String(game.config.rows));
    boardElement.setAttribute("aria-colcount", String(game.config.cols));
    boardElement.dataset.status = game.status;

    mineCounter.textContent = formatCounter(game.config.mines - game.flags);
    timeCounter.textContent = formatCounter(options.getElapsedSeconds(game));
    safeCounter.textContent = formatCounter(safeTotal - game.revealed);
    scanCounter.textContent = formatCounter(game.scansLeft);

    statusText.textContent = getStatusText(game);
    scanButton.disabled = game.status !== "playing" || game.scansLeft <= 0;
    markModeButton.setAttribute("aria-pressed", String(markMode));
    markModeButton.classList.toggle("active", markMode);
    customFieldButton.classList.toggle("active", Boolean(game.config.custom));
    customFieldButton.textContent = game.config.custom ? "Rebuild field" : "Build field";

    renderSegments(presetControls, "[data-preset]", game.config.id);
    renderSegments(scaleControls, "[data-scale]", document.body.dataset.boardScale ?? "standard");
    renderMusicControls();
    syncMineLimit();
    fitControlLabels();
    renderBoard(game);
    renderLeaderboard();
    renderResult(game);
  }

  function renderBoard(game) {
    const existing = boardElement.children.length === game.board.length;

    if (!existing) {
      const cells = game.board.map((cell) => createCellButton(cell, game.config.cols));
      boardElement.replaceChildren(...cells);
    }

    for (const cell of game.board) {
      const button = boardElement.children[cell.index];
      button.className = getCellClass(cell);
      button.disabled = game.status === "won" || game.status === "lost";
      button.textContent = getCellText(cell);
      button.setAttribute("aria-label", getCellLabel(cell));
      button.setAttribute("aria-pressed", String(cell.flagged));
      button.dataset.tile = getCellTile(cell);
    }
  }

  function renderResult(game) {
    if (game.status !== "won" && game.status !== "lost") {
      resultModal.hidden = true;
      return;
    }

    const elapsed = options.getElapsedSeconds(game);
    resultModal.hidden = false;
    resultModal.dataset.state = game.status;
    resultKicker.textContent = game.status === "won" ? "Cipher cracked" : "Trace detected";
    resultTitle.textContent = game.status === "won" ? "Access granted" : "Network errors exposed";
    resultText.textContent =
      game.status === "won"
        ? `Cipher cracked in ${elapsed}s with ${game.moves} probes.`
        : `The run failed after ${game.moves} probes. Error nodes are now visible on the grid.`;
  }

  function bindEvents() {
    boardElement.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");

      if (!cell) {
        return;
      }

      const index = Number(cell.dataset.index);

      if (markMode) {
        options.onFlag(index);
        return;
      }

      options.onReveal(index);
    });

    boardElement.addEventListener("contextmenu", (event) => {
      const cell = event.target.closest(".cell");

      if (!cell) {
        return;
      }

      event.preventDefault();
      options.onFlag(Number(cell.dataset.index));
    });

    boardElement.addEventListener("dblclick", (event) => {
      const cell = event.target.closest(".cell");

      if (!cell) {
        return;
      }

      options.onChord(Number(cell.dataset.index));
    });

    boardElement.addEventListener("keydown", (event) => {
      const cell = event.target.closest(".cell");

      if (!cell) {
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        options.onFlag(Number(cell.dataset.index));
      }
    });

    document.querySelector("#newGameButton").addEventListener("click", options.onNewGame);
    document.querySelector("#modalNewGameButton").addEventListener("click", options.onNewGame);
    document.querySelector("#dailyButton").addEventListener("click", options.onDailyGame);
    scanButton.addEventListener("click", options.onScan);
    musicToggleButton.addEventListener("click", toggleMusic);
    musicTrackSelect.addEventListener("change", () => {
      const selectedTrack = setMusicTrack(musicTrackSelect.value, musicPlaying);
      options.onMusicTrackChange?.(selectedTrack.id);
    });
    musicVolume.addEventListener("input", () => {
      const volume = setMusicVolume(musicVolume.value);
      options.onMusicVolumeChange?.(volume);
    });
    musicPlayer.addEventListener("play", () => {
      musicPlaying = true;
      renderMusicControls();
    });
    musicPlayer.addEventListener("pause", () => {
      musicPlaying = false;
      renderMusicControls();
    });
    musicPlayer.addEventListener("ended", playNextMusicTrack);
    helpButton.addEventListener("click", openHelp);
    helpCloseButton.addEventListener("click", closeHelp);
    helpModal.addEventListener("click", (event) => {
      if (event.target === helpModal) {
        closeHelp();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !helpModal.hidden) {
        closeHelp();
      }
    });

    markModeButton.addEventListener("click", () => {
      markMode = !markMode;
      render();
    });

    runnerNameInput.addEventListener("input", () => {
      runnerNameInput.classList.remove("input-error");
      runnerNameHint.textContent = "Required before each cipher run.";
    });

    presetControls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-preset]");

      if (button) {
        options.onPresetChange(button.dataset.preset);
      }
    });

    customFieldForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const config = normalizeCustomConfig(getCustomInputConfig());
      setCustomInputs(config);
      options.onCustomField(config);
    });

    for (const input of [customRowsInput, customColsInput, customMinesInput]) {
      input.addEventListener("input", syncMineLimit);
    }

    scaleControls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-scale]");

      if (button) {
        options.onScaleChange(button.dataset.scale);
      }
    });

    window.addEventListener("resize", fitControlLabels);
    document.fonts?.ready.then(fitControlLabels);
  }

  function openHelp() {
    helpModal.hidden = false;
    helpCloseButton.focus();
  }

  function closeHelp() {
    helpModal.hidden = true;
    helpButton.focus();
  }

  function startTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      const game = options.getGame();

      if (game.status === "playing") {
        timeCounter.textContent = formatCounter(options.getElapsedSeconds(game));
      }
    }, 500);
  }

  function setMusicControls() {
    if (musicTracks.length === 0) {
      musicToggleButton.disabled = true;
      musicTrackSelect.disabled = true;
      musicVolume.disabled = true;
      return;
    }

    musicTrackSelect.replaceChildren(
      ...musicTracks.map((track) => {
        const option = document.createElement("option");
        option.value = track.id;
        option.textContent = track.label;
        return option;
      })
    );

    const selectedTrack = setMusicTrack(options.initialMusicTrackId, false);
    musicTrackSelect.value = selectedTrack.id;
    setMusicVolume(options.initialMusicVolume ?? 20);
    renderMusicControls();
  }

  function setMusicTrack(trackId, shouldResume) {
    const track = getMusicTrack(trackId);
    const wasPlaying = shouldResume && !musicPlayer.paused;

    musicTrackSelect.value = track.id;
    musicPlayer.src = track.src;
    musicPlayer.load();

    if (wasPlaying) {
      void playMusic();
    }

    return track;
  }

  function setMusicVolume(value) {
    const volume = clampVolume(value);
    musicVolume.value = String(volume);
    musicVolumeValue.textContent = `${volume}%`;
    musicPlayer.volume = volume / 100;
    return volume;
  }

  async function toggleMusic() {
    if (musicPlaying) {
      musicPlayer.pause();
      return;
    }

    await playMusic();
  }

  async function playMusic() {
    if (musicTracks.length === 0) {
      return;
    }

    try {
      await musicPlayer.play();
      musicPlaying = true;
    } catch {
      musicPlaying = false;
    }

    renderMusicControls();
  }

  function playNextMusicTrack() {
    const nextTrack = getNextMusicTrack(musicTracks, musicTrackSelect.value);

    if (!nextTrack) {
      return;
    }

    setMusicTrack(nextTrack.id, false);
    options.onMusicTrackChange?.(nextTrack.id);
    void playMusic();
  }

  function renderMusicControls() {
    musicToggleButton.classList.toggle("active", musicPlaying);
    musicToggleButton.dataset.icon = musicPlaying ? "II" : "P";
    musicToggleButton.textContent = musicPlaying ? "Pause music" : "Play music";
    musicToggleButton.setAttribute("aria-pressed", String(musicPlaying));
    musicToggleButton.setAttribute(
      "aria-label",
      musicPlaying ? "Pause cyberpunk soundtrack" : "Start cyberpunk soundtrack"
    );
    fitControlLabels();
  }

  function getMusicTrack(trackId) {
    return musicTracks.find((track) => track.id === trackId) ?? musicTracks[0];
  }

  return {
    getRunnerName,
    render,
    requireRunnerName
  };

  function getRunnerName() {
    return runnerNameInput.value.trim().replace(/\s+/g, " ").slice(0, 18);
  }

  function requireRunnerName() {
    const name = getRunnerName();

    if (name) {
      runnerNameInput.value = name;
      runnerNameInput.classList.remove("input-error");
      runnerNameHint.textContent = "Required before each cipher run.";
      return name;
    }

    runnerNameInput.classList.add("input-error");
    runnerNameHint.textContent = "Enter a runner alias before starting.";
    runnerNameInput.focus();
    return "";
  }

  function renderLeaderboard() {
    const game = options.getGame();
    const entries = options.getLeaderboard(game.config);
    leaderboardMode.textContent = options.getModeLabel(game.config);

    if (entries.length === 0) {
      const item = document.createElement("li");
      item.className = "leaderboard-empty";
      item.textContent = "No clean runs yet";
      leaderboardList.replaceChildren(item);
      return;
    }

    leaderboardList.replaceChildren(
      ...entries.map((entry) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const result = document.createElement("strong");
        const moves = document.createElement("span");

        name.textContent = entry.name;
        result.textContent = `${entry.seconds}s`;
        moves.textContent = `${entry.moves} probes`;

        item.append(name, result, moves);
        return item;
      })
    );
  }

  function setCustomInputs(config) {
    customRowsInput.min = String(CUSTOM_LIMITS.minRows);
    customRowsInput.max = String(CUSTOM_LIMITS.maxRows);
    customColsInput.min = String(CUSTOM_LIMITS.minCols);
    customColsInput.max = String(CUSTOM_LIMITS.maxCols);
    customMinesInput.min = String(CUSTOM_LIMITS.minMines);
    customRowsInput.value = String(config.rows);
    customColsInput.value = String(config.cols);
    customMinesInput.value = String(config.mines);
    syncMineLimit();
  }

  function getCustomInputConfig() {
    return {
      rows: customRowsInput.value,
      cols: customColsInput.value,
      mines: customMinesInput.value
    };
  }

  function syncMineLimit() {
    const rows = clampInputValue(customRowsInput, CUSTOM_LIMITS.minRows, CUSTOM_LIMITS.maxRows);
    const cols = clampInputValue(customColsInput, CUSTOM_LIMITS.minCols, CUSTOM_LIMITS.maxCols);
    const maxMines = getMaxMines(rows, cols);
    const currentMines = Number.parseInt(customMinesInput.value, 10);

    customMinesInput.max = String(maxMines);
    customMineLimit.textContent = `Max errors: ${maxMines} (70%)`;

    if (Number.isFinite(currentMines) && currentMines > maxMines) {
      customMinesInput.value = String(maxMines);
    }
  }
}

function clampInputValue(input, min, max) {
  const value = Number.parseInt(input.value, 10);

  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function clampVolume(value) {
  const volume = Number.parseInt(value, 10);

  if (!Number.isFinite(volume)) {
    return 20;
  }

  return Math.min(100, Math.max(0, volume));
}

function fitControlLabels() {
  for (const button of document.querySelectorAll(".control-deck button, .music-group button")) {
    if (button.offsetParent == null) {
      continue;
    }

    button.style.fontSize = "";

    const computed = window.getComputedStyle(button);
    const minimumSize = 10;
    let currentSize = Number.parseFloat(computed.fontSize) || 16;

    while (
      currentSize > minimumSize &&
      (button.scrollWidth > button.clientWidth || button.scrollHeight > button.clientHeight)
    ) {
      currentSize -= 0.5;
      button.style.fontSize = `${currentSize}px`;
    }
  }
}

function createCellButton(cell, cols) {
  const button = document.createElement("button");
  button.className = "cell";
  button.type = "button";
  button.dataset.index = cell.index;
  button.setAttribute("role", "gridcell");
  button.setAttribute("aria-rowindex", String(cell.row + 1));
  button.setAttribute("aria-colindex", String(cell.col + 1));
  button.style.gridColumn = String((cell.index % cols) + 1);
  return button;
}

function getCellClass(cell) {
  const classes = ["cell"];

  if (cell.revealed) {
    classes.push("revealed");
  }

  if (cell.flagged) {
    classes.push("flagged");
  }

  if (cell.questioned) {
    classes.push("questioned");
  }

  if (cell.mine && cell.revealed) {
    classes.push("mine");
  }

  if (cell.exploded) {
    classes.push("exploded");
  }

  if (cell.scanned) {
    classes.push("scanned");
  }

  return classes.join(" ");
}

function getCellText(cell) {
  if (cell.flagged && !cell.revealed) {
    return "!";
  }

  if (cell.questioned && !cell.revealed) {
    return "?";
  }

  if (cell.mine && cell.revealed) {
    return "x";
  }

  if (cell.revealed && cell.adjacent > 0) {
    return String(cell.adjacent);
  }

  return "";
}

function getCellTile(cell) {
  if (cell.flagged && !cell.revealed) {
    return "flag";
  }

  if (cell.questioned && !cell.revealed) {
    return "question";
  }

  if (!cell.revealed) {
    return "hidden";
  }

  if (cell.mine && cell.exploded) {
    return "error-triggered";
  }

  if (cell.mine) {
    return "error";
  }

  if (cell.adjacent > 0) {
    return String(cell.adjacent);
  }

  return "empty";
}

function getCellLabel(cell) {
  if (cell.flagged && !cell.revealed) {
    return `Flagged node ${cell.row + 1}, ${cell.col + 1}`;
  }

  if (cell.questioned && !cell.revealed) {
    return `Question-marked node ${cell.row + 1}, ${cell.col + 1}`;
  }

  if (!cell.revealed) {
    return `Hidden node ${cell.row + 1}, ${cell.col + 1}`;
  }

  if (cell.mine) {
    return `Network error at node ${cell.row + 1}, ${cell.col + 1}`;
  }

  return `Safe node ${cell.row + 1}, ${cell.col + 1}, ${cell.adjacent} adjacent errors`;
}

function renderSegments(container, selector, activeValue) {
  for (const button of container.querySelectorAll(selector)) {
    const value = button.dataset.preset ?? button.dataset.scale;
    button.classList.toggle("active", value === activeValue);
    button.setAttribute("aria-pressed", String(value === activeValue));
  }
}

function getStatusText(game) {
  if (game.status === "won") {
    return "Cipher cracked";
  }

  if (game.status === "lost") {
    return "Trace detected";
  }

  if (game.status === "playing") {
    return "Hack in progress";
  }

  return "Cipher awaiting breach";
}

function formatCounter(value) {
  return String(Math.max(0, value)).padStart(3, "0");
}
