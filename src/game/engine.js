import {
  buildBoard,
  createEmptyBoard,
  getNeighbors,
  getPreset,
  normalizeCustomConfig
} from "./board.js";
import { createSeed } from "./rng.js";

export function createGame(options = {}) {
  const config = options.config ? normalizeCustomConfig(options.config) : getPreset(options.presetId);
  const seed = options.seed ?? createSeed(config.id);

  return {
    config,
    seed,
    board: createEmptyBoard(config.rows, config.cols),
    generated: false,
    status: "ready",
    startedAt: null,
    endedAt: null,
    moves: 0,
    flags: 0,
    revealed: 0,
    scansLeft: config.scans,
    lastScanIndex: null
  };
}

export function revealCell(game, index, now = Date.now()) {
  if (!canAct(game) || !game.board[index] || game.board[index].flagged) {
    return game;
  }

  let next = cloneGame(game);

  if (!next.generated) {
    next.board = buildBoard({
      rows: next.config.rows,
      cols: next.config.cols,
      mines: next.config.mines,
      seed: next.seed,
      safeIndex: index
    });
    next.generated = true;
    next.status = "playing";
    next.startedAt = now;
  }

  const target = next.board[index];

  if (target.revealed || target.flagged) {
    return game;
  }

  next.moves += 1;
  next.lastScanIndex = null;
  clearScans(next.board);

  if (target.mine) {
    target.revealed = true;
    target.exploded = true;
    revealAllMines(next.board);
    next.status = "lost";
    next.endedAt = now;
    return next;
  }

  next = revealSafeRegion(next, index);
  return applyWinIfComplete(next, now);
}

export function toggleFlag(game, index) {
  if (!canAct(game) || !game.board[index] || game.board[index].revealed) {
    return game;
  }

  const next = cloneGame(game);
  const cell = next.board[index];

  if (cell.flagged) {
    cell.flagged = false;
    cell.questioned = true;
    next.flags -= 1;
    next.lastScanIndex = null;
    clearScans(next.board);
    return next;
  }

  if (cell.questioned) {
    cell.questioned = false;
    next.lastScanIndex = null;
    clearScans(next.board);
    return next;
  }

  if (next.flags >= next.config.mines) {
    return game;
  }

  cell.flagged = true;
  next.lastScanIndex = null;
  next.flags += 1;
  clearScans(next.board);
  return next;
}

export function revealAround(game, index, now = Date.now()) {
  if (!canAct(game) || !game.generated) {
    return game;
  }

  const source = game.board[index];

  if (!source?.revealed || source.adjacent === 0) {
    return game;
  }

  const neighbors = getNeighbors(index, game.config.rows, game.config.cols);
  const flags = neighbors.filter((neighborIndex) => game.board[neighborIndex].flagged).length;

  if (flags !== source.adjacent) {
    return game;
  }

  return neighbors.reduce((current, neighborIndex) => {
    if (current.status !== "playing" || current.board[neighborIndex].flagged) {
      return current;
    }

    return revealCell(current, neighborIndex, now);
  }, game);
}

export function scanSafeCell(game) {
  if (game.status !== "playing" || !game.generated || game.scansLeft <= 0) {
    return game;
  }

  const safeCells = game.board.filter(
    (cell) => !cell.mine && !cell.revealed && !cell.flagged && !cell.questioned
  );

  if (safeCells.length === 0) {
    return game;
  }

  const next = cloneGame(game);
  clearScans(next.board);

  const safest = safeCells
    .map((cell) => ({
      index: cell.index,
      risk: getHiddenNeighborCount(game, cell.index)
    }))
    .sort((left, right) => left.risk - right.risk || left.index - right.index)[0];

  next.board[safest.index].scanned = true;
  next.lastScanIndex = safest.index;
  next.scansLeft -= 1;
  return next;
}

export function getElapsedSeconds(game, now = Date.now()) {
  if (!game.startedAt) {
    return 0;
  }

  const end = game.endedAt ?? now;
  return Math.floor((end - game.startedAt) / 1000);
}

function cloneGame(game) {
  return {
    ...game,
    board: game.board.map((cell) => ({ ...cell }))
  };
}

function canAct(game) {
  return game.status === "ready" || game.status === "playing";
}

function clearScans(board) {
  for (const cell of board) {
    cell.scanned = false;
  }
}

function revealAllMines(board) {
  for (const cell of board) {
    if (cell.mine) {
      cell.revealed = true;
    }
  }
}

function revealSafeRegion(game, startIndex) {
  const queue = [startIndex];
  const visited = new Set();

  while (queue.length > 0) {
    const index = queue.shift();

    if (visited.has(index)) {
      continue;
    }

    visited.add(index);

    const cell = game.board[index];

    if (!cell || cell.revealed || cell.flagged || cell.mine) {
      continue;
    }

    cell.revealed = true;
    game.revealed += 1;

    if (cell.adjacent === 0) {
      queue.push(...getNeighbors(index, game.config.rows, game.config.cols));
    }
  }

  return game;
}

function applyWinIfComplete(game, now) {
  const requiredSafeCells = game.config.rows * game.config.cols - game.config.mines;

  if (game.revealed !== requiredSafeCells) {
    return game;
  }

  for (const cell of game.board) {
    if (cell.mine) {
      cell.flagged = true;
    }
  }

  return {
    ...game,
    status: "won",
    endedAt: now,
    flags: game.config.mines
  };
}

function getHiddenNeighborCount(game, index) {
  return getNeighbors(index, game.config.rows, game.config.cols).filter((neighborIndex) => {
    const neighbor = game.board[neighborIndex];
    return !neighbor.revealed && !neighbor.flagged;
  }).length;
}
