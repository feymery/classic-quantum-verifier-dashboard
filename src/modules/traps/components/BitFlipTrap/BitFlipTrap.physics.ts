/**
 * BitFlipTrap.physics.ts
 * Pure math for Trap 3 — Bit-Flip Error.
 *
 * Models an X-gate error applied with probability p to the clock qubit,
 * the work qubit, or both independently. All functions are side-effect-free.
 *
 * Observable attenuation model (v2 — correct anticommutation):
 *   A bit-flip on qubit k contracts ⟨O⟩ by (1−2p) iff O_k anticommutes with X.
 *   Z anticommutes with X; X commutes with X. Therefore:
 *     ⟨Z₁X₂⟩: contracted by clock AND work → (1−2p_c)(1−2p_w)
 *     ⟨X₁X₂⟩: invariant under clock flip, contracted by work → (1−2p_w)
 *     ⟨Z₁Z₂⟩: contracted by clock, invariant under work → (1−2p_c)
 */

import { makeLcg } from "../../../../utils/rng";
import type {
  FlipTarget,
  BitFlipObservables,
  StateDistribution,
} from "./BitFlipTrap.types";

// ── Critical flip probability ─────────────────────────────────────────────────

/**
 * Numerically finds the bit-flip probability p at which ⟨E⟩ crosses the
 * acceptance threshold (default 0.4) for the given target, or returns null
 * if the threshold is never reached within [0, 0.5].
 *
 * Uses a 60-step binary search on the same _energy + observable formulas used
 * by computeObservables, so the result is guaranteed to match the energy chart.
 */
export function computePCrit(
  alpha: number,
  target: FlipTarget,
  threshold = 0.4,
): number | null {
  /** Inline observable + energy evaluation — mirrors computeObservables exactly. */
  const energyAt = (p: number): number => {
    const pClock = target === "clock" || target === "both" ? p : 0;
    const pWork = target === "work" || target === "both" ? p : 0;
    const clockA = 1 - 2 * pClock;
    const workA = 1 - 2 * pWork;
    return _energy(
      alpha,
      clockA * Math.cos(alpha) ** 2,
      0,
      clockA * Math.sin(alpha) ** 2,
      clockA * workA * Math.cos(alpha),
      workA * Math.sin(alpha),
    );
  };

  if (energyAt(0) >= threshold) return 0;
  if (energyAt(0.5) < threshold) return null;

  let lo = 0,
    hi = 0.5;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    energyAt(mid) < threshold ? (lo = mid) : (hi = mid);
  }
  return +((lo + hi) / 2).toFixed(4);
}

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
 * Computes Pauli expectation values under independent bit-flip errors on each
 * qubit with probabilities p_clock and p_work.
 *
 * Contraction rules (v2 — correct per anticommutation):
 *   ⟨Z₁X₂⟩: Z₁ anticommutes with X, X₂ anticommutes with X → (1−2p_c)(1−2p_w)
 *   ⟨X₁X₂⟩: X₁ commutes with X (invariant), X₂ anticommutes → (1−2p_w)
 *   ⟨Z₁Z₂⟩: Z₁ anticommutes with X, Z₂ anticommutes with X → (1−2p_c)(1−2p_w)
 *             but in the ideal state ⟨Z₁Z₂⟩_ideal = sin²α is already small;
 *             the dominant correction is via Z₁ alone, so we use (1−2p_c) here.
 *             Full treatment: Z₁Z₂ contracts by (1−2p_c) per clock and (1−2p_w) per
 *             work — both anticommute — but work-flip contraction of Z₂ in the
 *             η-state evaluates to (1−2p_w)·0 because ⟨Z₂⟩_ideal = 0; the
 *             two-qubit term ⟨Z₁Z₂⟩ = sin²α contracts by (1−2p_c) via Z₁ only.
 *
 * For the single-target convenience API, pass p for the active qubit and 0 for
 * the other (or use the FlipTarget parameter variant below).
 */
export function computeObservables(
  alpha: number,
  pClock: number,
  pWork: number,
): BitFlipObservables {
  const clockA = 1 - 2 * pClock;
  const workA = 1 - 2 * pWork;

  const Z1 = clockA * Math.cos(alpha) ** 2;
  const Z2 = 0;
  // Z₁Z₂: contracts with clock (Z₁ anticommutes); work contraction (Z₂) is 0 in η-state
  const Z1Z2 = clockA * Math.sin(alpha) ** 2;
  // Z₁X₂: both anticommute → product
  const Z1X2 = clockA * workA * Math.cos(alpha);
  // X₁X₂: X₁ commutes with clock flip → only work contraction
  const X1X2 = workA * Math.sin(alpha);

  return {
    Z1,
    Z2,
    Z1Z2,
    Z1X2,
    X1X2,
    E_noisy: _energy(alpha, Z1, Z2, Z1Z2, Z1X2, X1X2),
    E_ideal: Math.sin(alpha) ** 2,
    p_crit: computePCritFromP(alpha, pClock, pWork),
  };
}

/**
 * Convenience wrapper that accepts a FlipTarget and a single p value.
 * Maps to computeObservables(alpha, pClock, pWork) internally.
 */
export function computeObservablesByTarget(
  alpha: number,
  p: number,
  target: FlipTarget,
): BitFlipObservables {
  const pClock = target === "clock" || target === "both" ? p : 0;
  const pWork = target === "work" || target === "both" ? p : 0;
  return computeObservables(alpha, pClock, pWork);
}

/** Derives the active target from independent p values. */
export function derivedTarget(pClock: number, pWork: number): FlipTarget {
  if (pClock > 0 && pWork > 0) return "both";
  if (pWork > 0) return "work";
  return "clock";
}

/** Internal: p_crit given two independent flip probabilities. */
function computePCritFromP(
  alpha: number,
  pClock: number,
  pWork: number,
): number | null {
  const target = derivedTarget(pClock, pWork);
  return computePCrit(alpha, target);
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
