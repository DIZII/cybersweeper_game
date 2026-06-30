export const LEADERBOARD_LIMIT = 8;

export function getModeKey(config) {
  if (config.custom) {
    return `custom:${config.rows}x${config.cols}:${config.mines}`;
  }

  return `preset:${config.id}`;
}

export function getModeLabel(config) {
  if (config.custom) {
    return `Custom ${config.rows}x${config.cols} / ${config.mines}`;
  }

  return config.label;
}

export function createLeaderboardEntry({ name, game, elapsedSeconds, completedAt = Date.now() }) {
  return {
    completedAt,
    errors: game.config.mines,
    modeKey: getModeKey(game.config),
    moves: game.moves,
    name: normalizeRunnerName(name),
    seconds: elapsedSeconds
  };
}

export function addLeaderboardEntry(entries, entry, limit = LEADERBOARD_LIMIT) {
  return [...entries, entry]
    .filter(isValidEntry)
    .sort(compareEntries)
    .slice(0, limit);
}

export function normalizeRunnerName(name) {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 18);
}

function compareEntries(left, right) {
  return (
    left.seconds - right.seconds ||
    left.moves - right.moves ||
    left.errors - right.errors ||
    right.completedAt - left.completedAt
  );
}

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry.name === "string" &&
    entry.name.length > 0 &&
    Number.isFinite(entry.seconds) &&
    Number.isFinite(entry.moves) &&
    Number.isFinite(entry.completedAt)
  );
}
