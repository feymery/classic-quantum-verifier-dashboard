/**
 * noise.ts
 * Depolarizing noise model for the 1-qubit verifier protocol.
 *
 * Model:
 *   A depolarizing channel with strength λ attenuates every Pauli
 *   observable by (1 − λ):
 *
 *     ⟨O⟩_noisy = (1 − λ) · ⟨O⟩_exact
 *
 *   Substituting into the full 5-term energy estimator gives:
 *
 *     E_noisy(α, λ) = λ · 3.5 + (1 − λ) · sin²(α)
 *
 *   The constant 3.5 is the energy of the maximally-mixed state
 *   ⟨H⟩_{I/4} = Tr(H·I/4) = 3.5 (trace of the Hamiltonian).
 *
 *   Limits:
 *     λ = 0 → E_noisy = sin²(α)  (noiseless)
 *     λ = 1 → E_noisy = 3.5       (maximally depolarised)
 *
 *   λ range in the dashboard: [0, 0.5]
 */

import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../utils/constants";
import {
  theoreticalEnergy,
  verifierDecision,
  type VerifierDecision,
} from "./energy";

export type { VerifierDecision };

/**
 * Energy under depolarizing noise with strength λ.
 *   E_noisy = λ·3.5 + (1 − λ)·sin²(α)
 */
export const noisyEnergy = (alpha: number, lambda: number): number =>
  lambda * 3.5 + (1 - lambda) * theoreticalEnergy(alpha);

/** Signed deviation: E_noisy − E_theoretical */
export const noiseDeviation = (alpha: number, lambda: number): number =>
  noisyEnergy(alpha, lambda) - theoreticalEnergy(alpha);

// ── Verifier decision ────────────────────────────────────────────────────────────────────────

export const noisyDecision = (
  alpha: number,
  lambda: number,
): VerifierDecision => verifierDecision(noisyEnergy(alpha, lambda));

// ── Critical lambda ───────────────────────────────────────────────────────────
//
// The lambda at which the noisy energy crosses a given threshold T:
//
//   λ·3.5 + (1 − λ)·E_theo = T
//   λ·(3.5 − E_theo) = T − E_theo
//   λ_c = (T − E_theo) / (3.5 − E_theo)
//
// Returns null when the energy already satisfies the threshold without noise
// (E_theo ≤ T with λ=0) or when the crossing falls outside [0, 1].

export const criticalLambda = (
  alpha: number,
  threshold = THRESHOLD_HIGH,
): number | null => {
  const eTheo = theoreticalEnergy(alpha);
  const denom = 3.5 - eTheo; // always > 0 since E_theo ∈ [0,1] and 3.5 > 1
  if (Math.abs(denom) < 1e-9) return null;
  const lc = (threshold - eTheo) / denom;
  // Clamp to valid range [0, 1]
  if (lc < 0 || lc > 1) return null;
  return lc;
};

// ── Sweep data ────────────────────────────────────────────────────────────────

export interface NoiseSweepPoint {
  lambda: number;
  theoretical: number; // constant = noiselessEnergy(alpha)
  noisy: number;
  deviation: number;
}

/**
 * Generate a sweep of noise levels for a fixed α.
 * @param alpha     angle in radians
 * @param lamMax    maximum λ (default 0.5, matching the dashboard slider)
 * @param resolution number of data points (default 100)
 */
export const noiseSweep = (
  alpha: number,
  lamMax = 0.5,
  resolution = 100,
): NoiseSweepPoint[] => {
  const eTheo = theoreticalEnergy(alpha);
  return Array.from({ length: resolution + 1 }, (_, i) => {
    const lambda = (i / resolution) * lamMax;
    const noisy = noisyEnergy(alpha, lambda);
    return {
      lambda,
      theoretical: eTheo,
      noisy,
      deviation: noisy - eTheo,
    };
  });
};

// ── Full noise analysis ───────────────────────────────────────────────────────

export interface NoiseAnalysis {
  alpha: number;
  lambda: number;
  theoretical: number;
  noisy: number;
  deviation: number;
  deviationPct: number; // |deviation| / theoretical * 100, or 0 if E_theo ≈ 0
  decision: VerifierDecision;
  critLambdaAccept: number | null; // λ at which energy drops to THRESHOLD_HIGH (0.5)
  critLambdaReject: number | null; // λ at which energy drops to THRESHOLD_LOW  (0.4)
}

export const analyseNoise = (alpha: number, lambda: number): NoiseAnalysis => {
  const theoretical = theoreticalEnergy(alpha);
  const noisy = noisyEnergy(alpha, lambda);
  const deviation = noisy - theoretical;

  return {
    alpha,
    lambda,
    theoretical,
    noisy,
    deviation,
    deviationPct:
      theoretical > 1e-9 ? (Math.abs(deviation) / theoretical) * 100 : 0,
    decision: noisyDecision(alpha, lambda),
    critLambdaAccept: criticalLambda(alpha, THRESHOLD_HIGH),
    critLambdaReject: criticalLambda(alpha, THRESHOLD_LOW),
  };
};
