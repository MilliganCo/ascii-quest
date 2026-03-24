/**
 * Returns a function that generates deterministic pseudo-random numbers 0-1
 * using a Linear Congruential Generator (LCG).
 */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function (): number {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Deterministic 2D noise returning a value 0-1 based on (x*73856093)^(y*19349663)^seed.
 */
export function noise2D(x: number, y: number, seed: number): number {
  const h = ((x * 73856093) ^ (y * 19349663) ^ seed) >>> 0;
  return seededRandom(h)();
}
