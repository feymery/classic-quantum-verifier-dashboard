/**
 * BiasedAmplitudesTrap.physics.ts
 * Pure physics functions for Trap 3 — Biased Amplitudes.
 *
 * The dishonest prover builds a history state with non-uniform step amplitudes:
 *   |η'⟩ = a|ψ_0⟩⊗|0⟩ + b|ψ_1⟩⊗|1⟩ + c|ψ_2⟩⊗|2⟩
 * with c > 1/√3 (more weight on final step) and a < 1/√3.
 *
 * δ ∈ [0, 1/3]: amplitude bias.  δ = 0 → honest.
 */

import type { EnergyBreakdown } from "./BiasedAmplitudesTrap.types";

// ── Amplitude parameterisation ────────────────────────────────────────────────

/** Returns [P(t=0), P(t=1), P(t=2)] for a given bias δ. */
export function stepProbabilities(delta: number): [number, number, number] {
  const THIRD = 1 / 3;
  return [Math.max(0, THIRD - delta), THIRD, Math.min(1, THIRD + delta)];
}

// ── Energy breakdown ──────────────────────────────────────────────────────────

export function biasedEnergyBreakdown(
  delta: number,
  alpha: number,
): EnergyBreakdown {
  const [p0, p1, p2] = stepProbabilities(delta);

  const coh01 = Math.sqrt(p0 * p1);
  const coh12 = Math.sqrt(p1 * p2);

  const H_prop =
    0.5 *
    (p0 + p1 - 2 * coh01 + p1 + p2 - 2 * coh12) *
    (1 - Math.cos(2 * alpha) / 2);

  const H_out = 0.5 * (1 - p2) * (1 + Math.sin(alpha));
  const H_in = 0.25 * (1 - p0);

  const total = H_out + H_in + H_prop;
  return { H_out, H_in, H_prop, total };
}

// ── Honest reference ──────────────────────────────────────────────────────────

/** Honest prover always produces E = 0. */
export const HONEST_ENERGY = 0;

/** Honest clock step probabilities: uniform [1/3, 1/3, 1/3]. */
export const HONEST_WEIGHTS: [number, number, number] = [1 / 3, 1 / 3, 1 / 3];
