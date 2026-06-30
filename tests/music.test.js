import assert from "node:assert/strict";
import { test } from "node:test";

import { getNextMusicTrack } from "../src/game/music.js";

const tracks = [
  { id: "glory", label: "GLORY" },
  { id: "extreme", label: "EXTREME" },
  { id: "endgame", label: "ENDGAME" }
];

test("music auto-next advances to the following track", () => {
  assert.equal(getNextMusicTrack(tracks, "glory").id, "extreme");
  assert.equal(getNextMusicTrack(tracks, "extreme").id, "endgame");
});

test("music auto-next wraps from the last track", () => {
  assert.equal(getNextMusicTrack(tracks, "endgame").id, "glory");
});

test("music auto-next falls back to the first track for unknown state", () => {
  assert.equal(getNextMusicTrack(tracks, "missing").id, "glory");
  assert.equal(getNextMusicTrack([], "glory"), null);
});
