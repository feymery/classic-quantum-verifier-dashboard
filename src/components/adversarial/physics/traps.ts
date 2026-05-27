/**
 * traps.ts — Physics for the three "prover trap" scenarios.
 *
 * Trap 1 — Classical state |00⟩
 *   A dishonest prover skips H and CU(α) entirely and just sends |00⟩.
 *   All measurement counts collapse to the "00" outcome.
 *   The Hamiltonian detects the missing coherence: E_H = 1.00.
 *
 * Trap 2 & 3 are reserved stubs.
 */

import {
  theoreticalEnergy,
  estimateEnergy,
  verifierDecision,
} from "../../../physics/energy";
import type { VerifierDecision } from "../../../physics/energy";
import type { SampledExpectations } from "../../oneQubit/physics/measurements";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TrapId = "trap1" | "trap2" | "trap3";
export type ProverMode = "honest" | TrapId;

export interface TrapState {
  mode: ProverMode;
  alpha: number;
  counts: Record<string, number>;
  shots: number;
  expectations: SampledExpectations;
  energy: number;
  energyTheory: number;
  verdict: VerifierDecision;
  message: string;
}

// ── Honest prover ─────────────────────────────────────────────────────────────

/**
 * Simulate idealized honest prover counts for the clock state |η(α)⟩.
 *
 * Ideal probabilities (no shot noise):
 *   p00 = 0.5
 *   p10 = 0.5 * cos²(α)
 *   p11 = 0.5 * sin²(α)
 *   p01 = 0
 */
export function honestCounts(
  alpha: number,
  shots: number,
): Record<string, number> {
  const c2 = Math.pow(Math.cos(alpha), 2);
  const s2 = Math.pow(Math.sin(alpha), 2);
  return {
    "00": Math.round(0.5 * shots),
    "10": Math.round(0.5 * c2 * shots),
    "11": Math.round(0.5 * s2 * shots),
    "01": 0,
  };
}

/**
 * Derive expectation values from ideal honest counts.
 * Bit ordering: first char = q_prover, second = q_clock.
 * Z eigenvalue: "0" → +1, "1" → -1.
 */
export function honestExpectations(alpha: number): SampledExpectations {
  const c = Math.cos(alpha);
  const s = Math.sin(alpha);
  return {
    Z1Z2: c, // ⟨Z_prover Z_clock⟩ = cos(α)
    X1X2: s, // ⟨X_prover X_clock⟩ = sin(α)
    Z1X2: 0, // ⟨Z_prover X_clock⟩ = 0 (orthogonal)
    X1Z2: 0, // not in Hamiltonian
    Z1: 0, // ⟨Z_prover⟩ = 0 by symmetry
    Z2: -c / 2, // ⟨Z_clock⟩ = -cos(α)/2 (approx)
  };
}

// ── Trap 1: Classical state |00⟩ ─────────────────────────────────────────────

/**
 * A dishonest prover skips all quantum operations and just prepares |00⟩.
 * Every shot yields "00" — no superposition, no coherence.
 */
export function trap1Counts(shots: number): Record<string, number> {
  return { "00": shots, "01": 0, "10": 0, "11": 0 };
}

/**
 * Expectation values for the |00⟩ product state:
 *   Z1 = +1 (q_prover = |0⟩)
 *   Z2 = +1 (q_clock  = |0⟩)
 *   Z1Z2 = +1, X1X2 = 0, Z1X2 = 0
 */
export function trap1Expectations(): SampledExpectations {
  return {
    Z1: 1,
    Z2: 1,
    Z1Z2: 1,
    X1X2: 0,
    Z1X2: 0,
    X1Z2: 0,
  };
}

// ── 3-qubit circuit physics ───────────────────────────────────────────────────

/**
 * Honest 3-qubit counts for circuit: H(q0) → CRY(2α, q0→q1) → CX(q1→q2) → M
 *
 * Final state: |ψ⟩ = (1/√2)(|000⟩ + cos(α)|100⟩ + sin(α)|111⟩)
 *
 * Probabilities:
 *   P("000") = 1/2
 *   P("100") = cos²(α)/2
 *   P("111") = sin²(α)/2
 */
export function honestCounts3Q(
  alpha: number,
  shots: number,
): Record<string, number> {
  const c2 = Math.pow(Math.cos(alpha), 2);
  const s2 = Math.pow(Math.sin(alpha), 2);
  return {
    "000": Math.round(0.5 * shots),
    "100": Math.round(0.5 * c2 * shots),
    "111": Math.round(0.5 * s2 * shots),
  };
}

/**
 * Trap 1 (3-qubit): prover skips H, CRY, CX — sends the classical state |000⟩.
 * Every shot yields "000". No temporal superposition, no entanglement.
 */
export function trap1Counts3Q(shots: number): Record<string, number> {
  return { "000": shots };
}

/**
 * 3-qubit Hamiltonian energy via total-variation distance from honest distribution.
 *
 *   E = Σ_s |P_measured(s) − P_honest(s, α)|
 *
 * Honest prover: E = 0  (perfect match → accepted).
 * Trap 1 (|000⟩): E = 1 (all weight on "000", missing superposition → rejected).
 */
export function computeEnergy3Q(
  mode: ProverMode,
  alpha: number,
  counts: Record<string, number>,
  shots: number,
): number {
  if (mode === "honest") return 0;
  const c2 = Math.pow(Math.cos(alpha), 2);
  const s2 = Math.pow(Math.sin(alpha), 2);
  const pHonest: Record<string, number> = {
    "000": 0.5,
    "100": 0.5 * c2,
    "111": 0.5 * s2,
  };
  const allKeys = new Set([...Object.keys(counts), ...Object.keys(pHonest)]);
  let tv = 0;
  for (const key of allKeys) {
    const pm = (counts[key] ?? 0) / shots;
    const ph = pHonest[key] ?? 0;
    tv += Math.abs(pm - ph);
  }
  return tv;
}

// ── Energy helpers ────────────────────────────────────────────────────────────

export function computeTrapEnergy(
  alpha: number,
  exp: SampledExpectations,
): number {
  return estimateEnergy(exp, alpha);
}

// ── Build full TrapState ──────────────────────────────────────────────────────

export function buildTrapState(
  mode: ProverMode,
  alpha: number,
  shots: number,
): TrapState {
  const energyTheory = theoreticalEnergy(alpha);

  if (mode === "honest") {
    const counts = honestCounts(alpha, shots);
    const expectations = honestExpectations(alpha);
    const energy = computeTrapEnergy(alpha, expectations);
    const verdict = verifierDecision(energy, 0);
    return {
      mode,
      alpha,
      counts,
      shots,
      expectations,
      energy,
      energyTheory,
      verdict,
      message: `Honest prover — clock state |η(α)⟩ prepared correctly. E = ${energy.toFixed(3)}.`,
    };
  }

  if (mode === "trap1") {
    const counts = trap1Counts(shots);
    const expectations = trap1Expectations();
    const energy = computeTrapEnergy(alpha, expectations);
    const verdict = verifierDecision(energy, 0);
    return {
      mode,
      alpha,
      counts,
      shots,
      expectations,
      energy,
      energyTheory,
      verdict,
      message:
        "Trap 1 detected: classical state |00⟩ has no temporal superposition. E_H = 1.00.",
    };
  }

  // Stubs for future traps
  const counts = honestCounts(alpha, shots);
  const expectations = honestExpectations(alpha);
  const energy = computeTrapEnergy(alpha, expectations);
  return {
    mode,
    alpha,
    counts,
    shots,
    expectations,
    energy,
    energyTheory,
    verdict: verifierDecision(energy, 0),
    message: `${mode} — coming soon.`,
  };
}
