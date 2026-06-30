import { PRESETS, normalizeCustomConfig } from "./game/board.js";
import {
  createGame,
  getElapsedSeconds,
  revealAround,
  revealCell,
  scanSafeCell,
  toggleFlag
} from "./game/engine.js";
import { createSeed, dailySeed } from "./game/rng.js";
import {
  addLeaderboardEntry,
  createLeaderboardEntry,
  getModeKey,
  getModeLabel
} from "./game/leaderboard.js";
import { mountGame } from "./ui/gameView.js";

const PRESET_STORAGE_KEY = "cipher-sweeper-preset";
const FIELD_MODE_STORAGE_KEY = "cipher-sweeper-field-mode";
const CUSTOM_CONFIG_STORAGE_KEY = "cipher-sweeper-custom-config";
const BOARD_SCALE_STORAGE_KEY = "cipher-sweeper-board-scale";
const LEADERBOARD_STORAGE_KEY = "cipher-sweeper-leaderboards";
const MUSIC_TRACK_STORAGE_KEY = "cipher-sweeper-music-track";
const MUSIC_VOLUME_STORAGE_KEY = "cipher-sweeper-music-volume";
const DEFAULT_MUSIC_VOLUME = 20;
const BOARD_SCALES = new Set(["compact", "standard", "large"]);
const MUSIC_TRACKS = [
  {
    id: "glory",
    label: "GLORY",
    src: "assets/music/glory.mp3"
  },
  {
    id: "extreme",
    label: "EXTREME",
    src: "assets/music/extreme.mp3"
  },
  {
    id: "endgame",
    label: "ENDGAME",
    src: "assets/music/endgame.mp3"
  }
];

const savedPreset = localStorage.getItem(PRESET_STORAGE_KEY) ?? "relay";
const savedScale = localStorage.getItem(BOARD_SCALE_STORAGE_KEY);
const savedMusicTrack = getSavedMusicTrack();
const customConfig = loadCustomConfig();
document.body.dataset.theme = "cyber";
document.body.dataset.boardScale = BOARD_SCALES.has(savedScale) ? savedScale : "standard";

let game = createGame(getInitialGameOptions());
let activeRunnerName = "";
let leaderboards = loadLeaderboards();

const view = mountGame({
  presets: PRESETS,
  initialCustomConfig: customConfig,
  musicTracks: MUSIC_TRACKS,
  initialMusicTrackId: savedMusicTrack.id,
  initialMusicVolume: loadMusicVolume(),
  getGame: () => game,
  getElapsedSeconds,
  getLeaderboard: (config) => leaderboards[getModeKey(config)] ?? [],
  getModeLabel,
  onReveal(index) {
    if (!ensureRunnerForReadySession()) {
      return;
    }

    const previousGame = game;
    game = revealCell(game, index);
    recordWinIfNeeded(previousGame, game);
    view.render();
  },
  onChord(index) {
    const previousGame = game;
    game = revealAround(game, index);
    recordWinIfNeeded(previousGame, game);
    view.render();
  },
  onFlag(index) {
    game = toggleFlag(game, index);
    view.render();
  },
  onScan() {
    game = scanSafeCell(game);
    view.render();
  },
  onNewGame() {
    startSession(getCurrentGameOptions(createSeed(game.config.id)));
  },
  onDailyGame() {
    startSession(getCurrentGameOptions(dailySeed()));
  },
  onPresetChange(presetId) {
    const runnerName = view.requireRunnerName();

    if (!runnerName) {
      return;
    }

    localStorage.setItem(PRESET_STORAGE_KEY, presetId);
    localStorage.setItem(FIELD_MODE_STORAGE_KEY, presetId);
    activeRunnerName = runnerName;
    game = createGame({
      presetId,
      seed: createSeed(presetId)
    });
    view.render();
  },
  onCustomField(config) {
    const runnerName = view.requireRunnerName();

    if (!runnerName) {
      return;
    }

    const normalizedConfig = normalizeCustomConfig(config);
    localStorage.setItem(CUSTOM_CONFIG_STORAGE_KEY, JSON.stringify(normalizedConfig));
    localStorage.setItem(FIELD_MODE_STORAGE_KEY, "custom");
    activeRunnerName = runnerName;
    game = createGame({
      config: normalizedConfig,
      seed: createSeed("custom")
    });
    view.render();
  },
  onScaleChange(scale) {
    if (!BOARD_SCALES.has(scale)) {
      return;
    }

    document.body.dataset.boardScale = scale;
    localStorage.setItem(BOARD_SCALE_STORAGE_KEY, scale);
    view.render();
  },
  onMusicTrackChange(trackId) {
    if (MUSIC_TRACKS.some((track) => track.id === trackId)) {
      localStorage.setItem(MUSIC_TRACK_STORAGE_KEY, trackId);
    }
  },
  onMusicVolumeChange(volume) {
    localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(clampMusicVolume(volume)));
  }
});

view.render();

function startSession(options) {
  const runnerName = view.requireRunnerName();

  if (!runnerName) {
    return;
  }

  activeRunnerName = runnerName;
  game = createGame(options);
  view.render();
}

function ensureRunnerForReadySession() {
  if (activeRunnerName) {
    return true;
  }

  const runnerName = view.requireRunnerName();

  if (!runnerName) {
    return false;
  }

  activeRunnerName = runnerName;
  return true;
}

function recordWinIfNeeded(previousGame, nextGame) {
  if (previousGame.status === "won" || nextGame.status !== "won") {
    return;
  }

  const key = getModeKey(nextGame.config);
  const entry = createLeaderboardEntry({
    name: activeRunnerName,
    game: nextGame,
    elapsedSeconds: getElapsedSeconds(nextGame),
    completedAt: nextGame.endedAt ?? Date.now()
  });

  leaderboards = {
    ...leaderboards,
    [key]: addLeaderboardEntry(leaderboards[key] ?? [], entry)
  };
  saveLeaderboards(leaderboards);
}

function getInitialGameOptions() {
  const savedFieldMode = localStorage.getItem(FIELD_MODE_STORAGE_KEY);

  if (savedFieldMode === "custom") {
    return {
      config: customConfig,
      seed: createSeed("custom")
    };
  }

  const presetId = PRESETS[savedPreset] ? savedPreset : "relay";
  return {
    presetId,
    seed: createSeed(presetId)
  };
}

function getCurrentGameOptions(seed) {
  if (game.config.custom) {
    return {
      config: game.config,
      seed
    };
  }

  return {
    presetId: game.config.id,
    seed
  };
}

function loadCustomConfig() {
  try {
    const storedConfig = JSON.parse(localStorage.getItem(CUSTOM_CONFIG_STORAGE_KEY) ?? "null");
    return normalizeCustomConfig(storedConfig ?? {});
  } catch {
    return normalizeCustomConfig();
  }
}

function loadLeaderboards() {
  try {
    const stored = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY) ?? "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

function saveLeaderboards(nextLeaderboards) {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(nextLeaderboards));
}

function getSavedMusicTrack() {
  const savedTrackId = localStorage.getItem(MUSIC_TRACK_STORAGE_KEY);
  return MUSIC_TRACKS.find((track) => track.id === savedTrackId) ?? MUSIC_TRACKS[0];
}

function loadMusicVolume() {
  return clampMusicVolume(localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY));
}

function clampMusicVolume(value) {
  const volume = Number.parseInt(value, 10);

  if (!Number.isFinite(volume)) {
    return DEFAULT_MUSIC_VOLUME;
  }

  return Math.min(100, Math.max(0, volume));
}
