/**
 * BiasedAmplitudesTrap.helpers.ts
 * Shot noise simulation and detection threshold logic for Trap 3.
 */

import { makeLcg } from "../../../../utils/rng";
import { stepProbabilities } from "./BiasedAmplitudesTrap.physics";
import { DETECTION_THRESHOLD } from "./BiasedAmplitudesTrap.types";

// ── Shot noise ────────────────────────────────────────────────────────────────

/**
 * Returns noisy step probabilities [p0, p1, p2] for display.
 * Deterministic given (delta, shots) — uses seeded LCG so bars
 * don't jump on every render.
 */
export function noisyStepProbs(
  delta: number,
  shots: number,
): [number, number, number] {
  const rng = makeLcg(Math.round(delta * 1000) * 10000 + shots);
  const probs = stepProbabilities(delta);
  return probs.map((p) => {
    const noise = ((rng() - 0.5) * 2) / Math.sqrt(shots);
    return Math.max(0, p + noise);
  }) as [number, number, number];
}

// ── Detection threshold ───────────────────────────────────────────────────────

/** True when the measured energy is at or above the detection threshold. */
export function isDetected(energy: number): boolean {
  return energy >= DETECTION_THRESHOLD;
}

/**
 * Minimum shot count required to statistically distinguish bias δ from 0.
 * Derived from: noise ≈ 1/√shots  ⟹  shots ≥ 1/δ².
 * Capped at 10 000.
 */
export function minShotsToDetect(delta: number): number {
  if (delta <= 0) return 10_000;
  return Math.min(10_000, Math.ceil(1 / (delta * delta)));
}
