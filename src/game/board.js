import { createRng } from "./rng.js";

export const PRESETS = Object.freeze({
  scout: Object.freeze({
    id: "scout",
    label: "Junior",
    rows: 9,
    cols: 9,
    mines: 10,
    scans: 3
  }),
  relay: Object.freeze({
    id: "relay",
    label: "Middle",
    rows: 14,
    cols: 14,
    mines: 32,
    scans: 3
  }),
  core: Object.freeze({
    id: "core",
    label: "Senior",
    rows: 16,
    cols: 24,
    mines: 76,
    scans: 2
  })
});

export const CUSTOM_LIMITS = Object.freeze({
  minRows: 6,
  maxRows: 40,
  minCols: 6,
  maxCols: 60,
  minMines: 1,
  maxMineRatio: 0.7,
  defaultRows: 16,
  defaultCols: 24,
  defaultMines: 76,
  scans: 3
});

export function getPreset(presetId = "relay") {
  return PRESETS[presetId] ?? PRESETS.relay;
}

export function getMaxMines(rows, cols) {
  return Math.max(CUSTOM_LIMITS.minMines, Math.floor(rows * cols * CUSTOM_LIMITS.maxMineRatio));
}

export function normalizeCustomConfig(input = {}) {
  const rows = clampInteger(
    input.rows ?? CUSTOM_LIMITS.defaultRows,
    CUSTOM_LIMITS.minRows,
    CUSTOM_LIMITS.maxRows
  );
  const cols = clampInteger(
    input.cols ?? CUSTOM_LIMITS.defaultCols,
    CUSTOM_LIMITS.minCols,
    CUSTOM_LIMITS.maxCols
  );
  const maxMines = getMaxMines(rows, cols);
  const mines = clampInteger(input.mines ?? CUSTOM_LIMITS.defaultMines, CUSTOM_LIMITS.minMines, maxMines);

  return Object.freeze({
    id: "custom",
    label: "Custom",
    rows,
    cols,
    mines,
    scans: CUSTOM_LIMITS.scans,
    custom: true
  });
}

export function toIndex(row, col, cols) {
  return row * cols + col;
}

export function toRowCol(index, cols) {
  return {
    row: Math.floor(index / cols),
    col: index % cols
  };
}

export function getNeighbors(index, rows, cols) {
  const { row, col } = toRowCol(index, cols);
  const neighbors = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        neighbors.push(toIndex(nextRow, nextCol, cols));
      }
    }
  }

  return neighbors;
}

export function createEmptyBoard(rows, cols) {
  return Array.from({ length: rows * cols }, (_, index) => {
    const { row, col } = toRowCol(index, cols);
    return {
      index,
      row,
      col,
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
      questioned: false,
      scanned: false,
      exploded: false
    };
  });
}

export function buildBoard({ rows, cols, mines, seed, safeIndex }) {
  if (mines >= rows * cols) {
    throw new Error("Mine count must be smaller than board size.");
  }

  const board = createEmptyBoard(rows, cols);
  const safeZone = new Set([safeIndex, ...getNeighbors(safeIndex, rows, cols)]);
  let candidates = board
    .map((cell) => cell.index)
    .filter((index) => !safeZone.has(index));

  if (candidates.length < mines) {
    candidates = board.map((cell) => cell.index).filter((index) => index !== safeIndex);
  }

  const rng = createRng(`${seed}:${rows}x${cols}:${mines}:${safeIndex}`);

  for (let mineIndex = 0; mineIndex < mines; mineIndex += 1) {
    const pick = mineIndex + Math.floor(rng() * (candidates.length - mineIndex));
    [candidates[mineIndex], candidates[pick]] = [candidates[pick], candidates[mineIndex]];
    board[candidates[mineIndex]].mine = true;
  }

  for (const cell of board) {
    if (cell.mine) {
      continue;
    }

    cell.adjacent = getNeighbors(cell.index, rows, cols).filter(
      (neighborIndex) => board[neighborIndex].mine
    ).length;
  }

  return board;
}

function clampInteger(value, min, max) {
  const fallback = Number.isFinite(min) ? min : 0;
  const number = Number.parseInt(value ?? fallback, 10);
  const safeNumber = Number.isFinite(number) ? number : fallback;
  return Math.min(max, Math.max(min, safeNumber));
}
