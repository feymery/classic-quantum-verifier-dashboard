/**
 * measurements2Q.ts
 * Exact and sampled expectation values for the 3-qubit clock state.
 *
 * Observables tracked:
 *   Z₁, Z₂, Z₃            — single-qubit magnetisations
 *   Z₁Z₂, Z₁Z₃, Z₂Z₃     — two-qubit ZZ correlators
 *   X₁X₂, X₁X₃, X₂X₃     — two-qubit XX correlators
 *   Z₁Z₂Z₃                — three-qubit parity
 *
 * Key physics insight:
 *   ⟨Z₂Z₃⟩ = 1 exactly for any α — this is the CNOT correlation signature.
 *   A fake prover who doesn't run the circuit cannot reproduce this while
 *   also getting the right energy.
 */

import {
  buildClockState2Q,
  diagonalExpectation,
  xExpectation,
  stateProbs2Q,
  SIGNS_Z1,
  SIGNS_Z2,
  SIGNS_Z3,
  SIGNS_Z1Z2,
  SIGNS_Z1Z3,
  SIGNS_Z2Z3,
  SIGNS_Z1Z2Z3,
  X1X2_MASK,
  X1X3_MASK,
  X2X3_MASK,
  type StateVec8,
} from "./hamiltonian2Q";
import { makeLcg } from "../utils/rng";

import { theoreticalEnergy, verifierDecision } from "./energy";

export interface ExactExpectations2Q {
  Z1: number;
  Z2: number;
  Z3: number;
  Z1Z2: number;
  Z1Z3: number;
  Z2Z3: number; // should always be ≈ 1 — CNOT signature
  X1X2: number;
  X1X3: number;
  X2X3: number;
  Z1Z2Z3: number;
}

export const exactExpectations2Q = (psi: StateVec8): ExactExpectations2Q => ({
  Z1: diagonalExpectation(SIGNS_Z1, psi),
  Z2: diagonalExpectation(SIGNS_Z2, psi),
  Z3: diagonalExpectation(SIGNS_Z3, psi),
  Z1Z2: diagonalExpectation(SIGNS_Z1Z2, psi),
  Z1Z3: diagonalExpectation(SIGNS_Z1Z3, psi),
  Z2Z3: diagonalExpectation(SIGNS_Z2Z3, psi),
  X1X2: xExpectation(X1X2_MASK, psi),
  X1X3: xExpectation(X1X3_MASK, psi),
  X2X3: xExpectation(X2X3_MASK, psi),
  Z1Z2Z3: diagonalExpectation(SIGNS_Z1Z2Z3, psi),
});

// ── Sampled expectation values ────────────────────────────────────────────────

export type SampledExpectations2Q = ExactExpectations2Q;

const seededRng = makeLcg;

const sampleObs = (exact: number, shots: number, rng: () => number): number => {
  const pPlus = (1 + exact) / 2;
  let plus = 0;
  for (let i = 0; i < shots; i++) if (rng() < pPlus) plus++;
  return (2 * plus - shots) / shots;
};

export const sampleExpectations2Q = (
  exact: ExactExpectations2Q,
  shots: number,
  seed?: number,
): SampledExpectations2Q => {
  const rng = seededRng(seed ?? Math.floor(Math.random() * 2 ** 31));
  return {
    Z1: sampleObs(exact.Z1, shots, rng),
    Z2: sampleObs(exact.Z2, shots, rng),
    Z3: sampleObs(exact.Z3, shots, rng),
    Z1Z2: sampleObs(exact.Z1Z2, shots, rng),
    Z1Z3: sampleObs(exact.Z1Z3, shots, rng),
    Z2Z3: sampleObs(exact.Z2Z3, shots, rng),
    X1X2: sampleObs(exact.X1X2, shots, rng),
    X1X3: sampleObs(exact.X1X3, shots, rng),
    X2X3: sampleObs(exact.X2X3, shots, rng),
    Z1Z2Z3: sampleObs(exact.Z1Z2Z3, shots, rng),
  };
};

// ── Shot counts ───────────────────────────────────────────────────────────────

export type Counts8 = Record<string, number>;

export const BASIS_STATES_3Q = [
  "000",
  "001",
  "010",
  "011",
  "100",
  "101",
  "110",
  "111",
] as const;

export const sampleCounts2Q = (
  psi: StateVec8,
  shots: number,
  seed?: number,
): Counts8 => {
  const rng = seededRng(seed ?? Math.floor(Math.random() * 2 ** 31));
  const probs = stateProbs2Q(psi);
  const cum = probs.reduce<number[]>((acc, p) => {
    acc.push((acc[acc.length - 1] ?? 0) + p);
    return acc;
  }, []);

  const counts: Counts8 = Object.fromEntries(
    BASIS_STATES_3Q.map((s) => [s, 0]),
  );
  for (let i = 0; i < shots; i++) {
    const r = rng();
    const idx = Math.max(
      0,
      cum.findIndex((c) => r < c),
    );
    counts[BASIS_STATES_3Q[idx]]++;
  }
  return counts;
};

// ── Energy estimation ─────────────────────────────────────────────────────────
//
// Primary estimate (same linear inversion as 1Q):
//   E₁ = ½ - ½·cos(2α)·⟨Z₁Z₂⟩ - ½·sin(2α)·⟨X₁X₂⟩
//
// Cross-check (using second work qubit):
//   E₂ = ½ - ½·cos(2α)·⟨Z₁Z₃⟩ - ½·sin(2α)·⟨X₁X₃⟩
//
// Final: Eavg = (E₁ + E₂) / 2

export interface EnergyAnalysis2Q {
  theoretical: number;
  estimated: number;
  estimatedPrimary: number; // from Z1Z2/X1X2
  estimatedCrossCheck: number; // from Z1Z3/X1X3
  deviation: number;
  cnot_signature: number; // ⟨Z₂Z₃⟩ — should be ≈ 1
  decision: "accept" | "reject" | "boundary";
}

export const analyseEnergy2Q = (
  alpha: number,
  ev: SampledExpectations2Q | ExactExpectations2Q,
): EnergyAnalysis2Q => {
  const theoretical = theoreticalEnergy(alpha);
  const c2a = Math.cos(2 * alpha);
  const s2a = Math.sin(2 * alpha);
  const estimatedPrimary = 0.5 - 0.5 * c2a * ev.Z1Z2 - 0.5 * s2a * ev.X1X2;
  const estimatedCrossCheck = 0.5 - 0.5 * c2a * ev.Z1Z3 - 0.5 * s2a * ev.X1X3;
  const estimated = (estimatedPrimary + estimatedCrossCheck) / 2;

  return {
    theoretical,
    estimated,
    estimatedPrimary,
    estimatedCrossCheck,
    deviation: estimated - theoretical,
    cnot_signature: ev.Z2Z3,
    decision: verifierDecision(estimated),
  };
};

// Re-export buildClockState2Q for convenience (avoids dual-import in consumers)
export { buildClockState2Q };
