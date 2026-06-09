export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let seed = "";
  const source = typeof crypto !== "undefined" ? crypto : null;

  for (let i = 0; i < 8; i += 1) {
    if (source?.getRandomValues) {
      const value = new Uint32Array(1);
      source.getRandomValues(value);
      seed += alphabet[value[0] % alphabet.length];
    } else {
      seed += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return seed;
}
