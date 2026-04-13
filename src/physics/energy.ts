/**
 * energy.ts
 * Energy estimation and verification logic.
 *
 * The 1-qubit Hamiltonian energy from the clock state is:
 *   E_theoretical(α) = sin²(α)
 *
 * From measurements we estimate E as a linear combination of
 * the observable expectation values.  For the clock state with
 * H = -½(Z₁Z₂ + X₁X₂) the estimator is:
 *
 *   E_estimated = ½(1 − ⟨Z₁Z₂⟩) + ½(1 − ⟨X₁X₂⟩) · sin(α) / 2
 *
 * In practice, for the simplified Stricker protocol we use the
 * direct relation: E = ½(1 − ⟨Z₁Z₂⟩·cos(2α) − ⟨X₁X₂⟩·sin(2α))
 *
 * For the purposes of this dashboard the estimated energy from
 * sampled expectation values is computed as:
 *   E_est ≈ sin²(α) with shot noise folded in via the sampled ⟨·⟩ values.
 *
 * The exact formula maps ⟨Z₁Z₂⟩ and ⟨X₁X₂⟩ back to energy:
 *   E = ½ − ½·cos(2α)·⟨Z₁Z₂⟩ − ½·sin(2α)·⟨X₁X₂⟩
 */

import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../utils/constants";
import type { SampledExpectations, ExactExpectations } from "./measurements";

// ── Theoretical energy ────────────────────────────────────────────────────────

/** E(α) = sin²(α) — the ground truth */
export const theoreticalEnergy = (alpha: number): number =>
  Math.pow(Math.sin(alpha), 2);

// ── Estimated energy from sampled expectation values ─────────────────────────

/**
 * Reconstruct energy from measured ⟨Z₁Z₂⟩ and ⟨X₁X₂⟩ using the
 * linear inversion formula:
 *   E = ½ − ½·cos(2α)·⟨Z₁Z₂⟩ − ½·sin(2α)·⟨X₁X₂⟩
 */
export const estimateEnergy = (
  ev: SampledExpectations | ExactExpectations,
  alpha: number,
): number => {
  const c2a = Math.cos(2 * alpha);
  const s2a = Math.sin(2 * alpha);
  return 0.5 - 0.5 * c2a * ev.Z1Z2 - 0.5 * s2a * ev.X1X2;
};

// ── Verifier logic ────────────────────────────────────────────────────────────

export type VerifierDecision = "accept" | "reject" | "boundary";

export const verifierDecision = (
  energy: number,
  low = THRESHOLD_LOW,
  high = THRESHOLD_HIGH,
): VerifierDecision => {
  if (energy > high) return "accept";
  if (energy < low) return "reject";
  return "boundary";
};

// ── Error analysis ────────────────────────────────────────────────────────────

export interface EnergyAnalysis {
  theoretical: number;
  estimated: number;
  deviation: number; // estimated − theoretical
  relativePct: number; // |deviation| / theoretical * 100
  decision: VerifierDecision;
  marginLow: number; // estimated − THRESHOLD_LOW
  marginHigh: number; // estimated − THRESHOLD_HIGH
}

export const analyseEnergy = (
  alpha: number,
  ev: SampledExpectations | ExactExpectations,
): EnergyAnalysis => {
  const theoretical = theoreticalEnergy(alpha);
  const estimated = estimateEnergy(ev, alpha);
  const deviation = estimated - theoretical;
  const relativePct =
    theoretical > 1e-9 ? (Math.abs(deviation) / theoretical) * 100 : 0;

  return {
    theoretical,
    estimated,
    deviation,
    relativePct,
    decision: verifierDecision(estimated),
    marginLow: estimated - THRESHOLD_LOW,
    marginHigh: estimated - THRESHOLD_HIGH,
  };
};

// ── Energy curve (for plotting) ───────────────────────────────────────────────

export interface EnergyCurvePoint {
  alpha: number;
  theoretical: number;
  label?: string;
}

/** Generate N points for the E(α) = sin²(α) curve over [0, π/2] */
export const energyCurve = (n = 120): EnergyCurvePoint[] =>
  Array.from({ length: n }, (_, i) => {
    const alpha = (i / (n - 1)) * (Math.PI / 2);
    return { alpha, theoretical: theoreticalEnergy(alpha) };
  });
