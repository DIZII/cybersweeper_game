export function hashString(input) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createRng(seed) {
  let state = hashString(String(seed)) || 1;

  return function rng() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeed(prefix = "signal") {
  const random =
    globalThis.crypto?.getRandomValues != null
      ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
      : Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function dailySeed(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `daily-${year}-${month}-${day}`;
}
