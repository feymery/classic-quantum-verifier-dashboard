/**
 * rng.ts
 * Shared deterministic PRNG utilities.
 *
 * Single source of truth for the Lehmer LCG used by all sampling functions.
 * Having it here eliminates the identical `makeLCG` / `seededRng` copies
 * that previously lived in measurements.ts and measurements2Q.ts.
 */

/**
 * Lehmer LCG — returns a () => number in [0, 1).
 * Deterministic when `seed` is supplied; uses Math.random() otherwise.
 *
 * Constants (Numerical Recipes): a = 1664525, c = 1013904223, m = 2³²
 */
export const makeLcg = (seed?: number): (() => number) => {
  let s = seed ?? Math.floor(Math.random() * 2 ** 31);
  return () => {
    s = (1664525 * s + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
};
