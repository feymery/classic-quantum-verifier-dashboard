/**
 * BitFlipTrap.physics.ts
 * Pure math for Trap 3 — Bit-Flip Error.
 *
 * Models an X-gate error applied with probability p to the clock qubit,
 * the work qubit, or both independently. All functions are side-effect-free.
 *
 * Observable attenuation model:
 *   Any measurement involving a flipped qubit has its classical readout bit
 *   inverted with probability p, which attenuates the corresponding Pauli
 *   expectation value by a factor of (1 − 2p).
 */

import { makeLcg } from "../../../../utils/rng";
import type {
  FlipTarget,
  BitFlipObservables,
  StateDistribution,
} from "./BitFlipTrap.types";

// ── Distributions ─────────────────────────────────────────────────────────────

/**
 * Ideal Z-basis measurement distribution for the clock state |η(α)⟩:
 *   |η(α)⟩ = cos(α)|00⟩ + sin(α)|11⟩
 */
export function computeIdealDistribution(alpha: number): StateDistribution {
  const c2 = Math.cos(alpha) ** 2;
  const s2 = Math.sin(alpha) ** 2;
  return { "00": c2, "11": s2, "01": 0, "10": 0 };
}

/**
 * Noisy Z-basis distribution after a readout bit-flip error with probability p.
 *
 * Clock flip:  |00⟩ → |10⟩ with p, |11⟩ → |01⟩ with p
 * Work flip:   |00⟩ → |01⟩ with p, |11⟩ → |10⟩ with p
 * Both:        independent flips on each qubit
 */
export function computeNoisyDistribution(
  alpha: number,
  p: number,
  target: FlipTarget,
): StateDistribution {
  const c2 = Math.cos(alpha) ** 2;
  const s2 = Math.sin(alpha) ** 2;

  if (target === "clock") {
    return {
      "00": (1 - p) * c2,
      "10": p * c2,
      "11": (1 - p) * s2,
      "01": p * s2,
    };
  }
  if (target === "work") {
    return {
      "00": (1 - p) * c2,
      "01": p * c2,
      "11": (1 - p) * s2,
      "10": p * s2,
    };
  }
  // Both — independent errors; cross-terms produce mixed outcomes
  return {
    "00": (1 - p) ** 2 * c2 + p ** 2 * s2,
    "11": (1 - p) ** 2 * s2 + p ** 2 * c2,
    "10": p * (1 - p), // equal weight from clock-only and work-only paths
    "01": p * (1 - p),
  };
}

// ── Observables & energy ──────────────────────────────────────────────────────

/**
 * Computes Pauli expectation values under a bit-flip error on the given target.
 *
 * Any observable that involves the flipped qubit is attenuated by (1 − 2p):
 *   clock flip → attenuates Z₁, Z₁Z₂, Z₁X₂, X₁X₂
 *   work  flip → attenuates Z₁Z₂, Z₁X₂, X₁X₂
 *   both       → attenuates with (1−2p)² for two-qubit correlators
 */
export function computeObservables(
  alpha: number,
  p: number,
  target: FlipTarget,
): BitFlipObservables {
  const a = 1 - 2 * p;
  const clockA = target === "clock" || target === "both" ? a : 1;
  const workA = target === "work" || target === "both" ? a : 1;

  const Z1 = clockA * Math.cos(alpha) ** 2;
  const Z2 = 0;
  const Z1Z2 = clockA * workA * Math.sin(alpha) ** 2;
  const Z1X2 = clockA * workA * Math.cos(alpha);
  const X1X2 = clockA * workA * Math.sin(alpha);

  return {
    Z1,
    Z2,
    Z1Z2,
    Z1X2,
    X1X2,
    E_noisy: _energy(alpha, Z1, Z2, Z1Z2, Z1X2, X1X2),
    E_ideal: Math.sin(alpha) ** 2,
  };
}

function _energy(
  alpha: number,
  Z1: number,
  Z2: number,
  Z1Z2: number,
  Z1X2: number,
  X1X2: number,
): number {
  const H_out = 0.5 * (1 - Z1 - Z2 + Z1Z2);
  const H_in = 0.25 * (1 - Z1 + Z2 - Z1Z2);
  const H_prop = 0.5 * (1 - Math.cos(alpha) * Z1X2 - Math.sin(alpha) * X1X2);
  return H_out + 6 * H_in + 3 * H_prop;
}

// ── Shot sampling ─────────────────────────────────────────────────────────────

/**
 * Draws a multinomial sample from a distribution using a seeded LCG.
 * Returns raw counts for each basis state.
 */
export function sampleCounts(
  dist: StateDistribution,
  shots: number,
  seed = 42,
): Record<string, number> {
  const counts: Record<string, number> = { "00": 0, "01": 0, "10": 0, "11": 0 };
  const rng = makeLcg(seed);
  const entries = Object.entries(dist) as [string, number][];

  for (let i = 0; i < shots; i++) {
    let r = rng();
    for (const [state, prob] of entries) {
      r -= prob;
      if (r <= 0) {
        counts[state]++;
        break;
      }
    }
  }
  return counts;
}

/** Normalises raw counts back into a StateDistribution (probabilities). */
export function countsToDistribution(
  counts: Record<string, number>,
  shots: number,
): StateDistribution {
  const s = Math.max(1, shots);
  return {
    "00": (counts["00"] ?? 0) / s,
    "01": (counts["01"] ?? 0) / s,
    "10": (counts["10"] ?? 0) / s,
    "11": (counts["11"] ?? 0) / s,
  };
}
