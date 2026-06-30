import assert from "node:assert/strict";
import test from "node:test";
import { getMaxMines, getNeighbors, normalizeCustomConfig, PRESETS } from "../src/game/board.js";
import {
  createGame,
  revealAround,
  revealCell,
  scanSafeCell,
  toggleFlag
} from "../src/game/engine.js";

test("first reveal generates a deterministic safe board", () => {
  const first = revealCell(createGame({ presetId: "scout", seed: "alpha" }), 40, 1000);
  const second = revealCell(createGame({ presetId: "scout", seed: "alpha" }), 40, 1000);

  assert.equal(first.generated, true);
  assert.equal(first.board[40].mine, false);
  assert.equal(first.status, "playing");
  assert.equal(first.board.filter((cell) => cell.mine).length, PRESETS.scout.mines);
  assert.deepEqual(
    first.board.map((cell) => cell.mine),
    second.board.map((cell) => cell.mine)
  );
});

test("first click protects the clicked cell and its neighbors when possible", () => {
  const game = revealCell(createGame({ presetId: "relay", seed: "safe-zone" }), 99, 1000);
  const protectedCells = [99, ...getNeighbors(99, game.config.rows, game.config.cols)];

  assert.equal(protectedCells.some((index) => game.board[index].mine), false);
});

test("flagged cells cannot be revealed", () => {
  let game = createGame({ presetId: "scout", seed: "flag-test" });
  game = toggleFlag(game, 12);
  const afterReveal = revealCell(game, 12, 1000);

  assert.equal(afterReveal.board[12].revealed, false);
  assert.equal(afterReveal.flags, 1);
});

test("marking cycles through flag, question mark, and clear", () => {
  let game = createGame({ presetId: "scout", seed: "mark-cycle" });
  game = toggleFlag(game, 12);

  assert.equal(game.board[12].flagged, true);
  assert.equal(game.board[12].questioned, false);
  assert.equal(game.flags, 1);

  game = toggleFlag(game, 12);

  assert.equal(game.board[12].flagged, false);
  assert.equal(game.board[12].questioned, true);
  assert.equal(game.flags, 0);

  game = toggleFlag(game, 12);

  assert.equal(game.board[12].flagged, false);
  assert.equal(game.board[12].questioned, false);
  assert.equal(game.flags, 0);
});

test("revealing an empty cell expands through safe region", () => {
  let game = revealCell(createGame({ presetId: "scout", seed: "flood-fill" }), 0, 1000);

  if (game.board[0].adjacent !== 0) {
    const zero = game.board.find((cell) => !cell.mine && cell.adjacent === 0);
    game = revealCell(createGame({ presetId: "scout", seed: "flood-fill" }), zero.index, 1000);
  }

  assert.ok(game.revealed > 1);
});

test("scan marks a safe hidden cell and consumes one charge", () => {
  let game = revealCell(createGame({ presetId: "relay", seed: "scan" }), 30, 1000);
  game = scanSafeCell(game);

  assert.equal(game.scansLeft, PRESETS.relay.scans - 1);
  assert.equal(game.lastScanIndex != null, true);
  assert.equal(game.board[game.lastScanIndex].mine, false);
  assert.equal(game.board[game.lastScanIndex].scanned, true);
});

test("revealing a mine ends the game", () => {
  let game = revealCell(createGame({ presetId: "scout", seed: "loss" }), 40, 1000);
  const mine = game.board.find((cell) => cell.mine);
  game = revealCell(game, mine.index, 2000);

  assert.equal(game.status, "lost");
  assert.equal(game.board.filter((cell) => cell.mine && cell.revealed).length, PRESETS.scout.mines);
});

test("revealing every safe cell wins the game", () => {
  let game = revealCell(createGame({ presetId: "scout", seed: "win" }), 40, 1000);

  for (const cell of game.board) {
    if (game.status === "won") {
      break;
    }

    if (!cell.mine && !game.board[cell.index].revealed) {
      game = revealCell(game, cell.index, 2000);
    }
  }

  assert.equal(game.status, "won");
  assert.equal(game.flags, PRESETS.scout.mines);
});

test("chording reveals neighbors only when flags match the clue", () => {
  let game = revealCell(createGame({ presetId: "scout", seed: "chord" }), 40, 1000);
  const clue = game.board.find((cell) => cell.revealed && cell.adjacent > 0);

  if (!clue) {
    assert.ok(game.revealed > 0);
    return;
  }

  const before = game.revealed;
  game = revealAround(game, clue.index, 1000);
  assert.equal(game.revealed, before);
});

test("custom boards clamp mines to seventy percent of cells", () => {
  const config = normalizeCustomConfig({ rows: 10, cols: 10, mines: 99 });

  assert.equal(getMaxMines(10, 10), 70);
  assert.equal(config.mines, 70);
});

test("custom boards use requested dimensions and generate safely", () => {
  const config = normalizeCustomConfig({ rows: 8, cols: 12, mines: 24 });
  const game = revealCell(createGame({ config, seed: "custom-grid" }), 13, 1000);

  assert.equal(game.config.custom, true);
  assert.equal(game.config.rows, 8);
  assert.equal(game.config.cols, 12);
  assert.equal(game.config.mines, 24);
  assert.equal(game.board.length, 96);
  assert.equal(game.board[13].mine, false);
  assert.equal(game.board.filter((cell) => cell.mine).length, 24);
});
