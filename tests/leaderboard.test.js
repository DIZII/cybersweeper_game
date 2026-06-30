import assert from "node:assert/strict";
import test from "node:test";
import {
  addLeaderboardEntry,
  createLeaderboardEntry,
  getModeKey,
  getModeLabel,
  normalizeRunnerName
} from "../src/game/leaderboard.js";
import { normalizeCustomConfig, PRESETS } from "../src/game/board.js";
import { createGame } from "../src/game/engine.js";

test("leaderboard mode keys separate presets and custom boards", () => {
  const customConfig = normalizeCustomConfig({ rows: 12, cols: 18, mines: 50 });

  assert.equal(getModeKey(PRESETS.scout), "preset:scout");
  assert.equal(getModeLabel(PRESETS.scout), "Junior");
  assert.equal(getModeKey(customConfig), "custom:12x18:50");
  assert.equal(getModeLabel(customConfig), "Custom 12x18 / 50");
});

test("leaderboard entries sort by time, then moves", () => {
  const entries = addLeaderboardEntry(
    [
      { completedAt: 1, errors: 10, modeKey: "preset:scout", moves: 20, name: "A", seconds: 42 },
      { completedAt: 2, errors: 10, modeKey: "preset:scout", moves: 18, name: "B", seconds: 42 }
    ],
    { completedAt: 3, errors: 10, modeKey: "preset:scout", moves: 40, name: "C", seconds: 30 }
  );

  assert.deepEqual(
    entries.map((entry) => entry.name),
    ["C", "B", "A"]
  );
});

test("leaderboard entry normalizes runner names", () => {
  const game = {
    ...createGame({ presetId: "scout", seed: "leader" }),
    config: PRESETS.scout,
    moves: 12
  };
  const entry = createLeaderboardEntry({
    completedAt: 1000,
    elapsedSeconds: 25,
    game,
    name: "  net   runner  alias  beyond-limit "
  });

  assert.equal(entry.name, normalizeRunnerName("net runner alias beyond-limit"));
  assert.equal(entry.name.length <= 18, true);
  assert.equal(entry.seconds, 25);
  assert.equal(entry.moves, 12);
});
