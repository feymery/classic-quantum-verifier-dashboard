import { theoreticalEnergy, verifierDecision } from "../physics/energy";

export const ALPHA_MAX = Math.PI / 2;
export const SNAP_THRESHOLD = 0.08; // radians — ~5% of full range

/** Verifiable limit α_c = arcsin(√0.4) ≈ 39.2° — re-exported from constants for convenience. */
export { ALPHA_THRESHOLD } from "./constants";

/** E(α) = sin²(α) — delegates to physics/energy canonical definition */
export const energy = theoreticalEnergy;

/** Map alpha [0, π/2] → slider percentage [0, 100] */
export const alphaToPercent = (alpha: number): number =>
  (alpha / ALPHA_MAX) * 100;

/** Map slider percentage [0, 100] → alpha [0, π/2] */
export const percentToAlpha = (pct: number): number => (pct / 100) * ALPHA_MAX;

/**
 * Snap a raw alpha value to the nearest key alpha if within threshold.
 * Returns the raw value unchanged if no key is close enough.
 */
export const snapToKey = (
  value: number,
  keyValues: number[],
  threshold = SNAP_THRESHOLD,
): number => {
  let closest: number | null = null;
  let minDist = Infinity;

  for (const key of keyValues) {
    const dist = Math.abs(value - key);
    if (dist < threshold && dist < minDist) {
      minDist = dist;
      closest = key;
    }
  }

  return closest !== null ? closest : value;
};

/** Return the index of the nearest key alpha, or -1 if none is within threshold */
export const nearestKeyIndex = (
  value: number,
  keyValues: number[],
  threshold = SNAP_THRESHOLD,
): number => {
  let best = -1;
  let minDist = Infinity;

  keyValues.forEach((key, i) => {
    const dist = Math.abs(value - key);
    if (dist < threshold && dist < minDist) {
      minDist = dist;
      best = i;
    }
  });

  return best;
};

/** Human-readable alpha label: fractions of π when exact, decimal otherwise */
export const formatAlpha = (alpha: number): string => {
  const map: [number, string][] = [
    [0, "0"],
    [Math.PI / 6, "π/6"],
    [Math.PI / 4, "π/4"],
    [Math.PI / 3, "π/3"],
    [0.9273, "α★"],
    [Math.PI / 2, "π/2"],
  ];
  for (const [val, label] of map) {
    if (Math.abs(alpha - val) < 0.001) return label;
  }
  return alpha.toFixed(4);
};

/** Verifier accept/reject — delegates to physics/energy canonical definition */
export { verifierDecision };
