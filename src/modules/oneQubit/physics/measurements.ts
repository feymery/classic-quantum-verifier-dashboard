/**
 * measurements.ts
 * Exact expectation values from the statevector, plus a shot-noise sampler.
 *
 * Observables (all as 4×4 operators on the 2-qubit clock state):
 *   Z₁Z₂  = Z ⊗ Z
 *   X₁X₂  = X ⊗ X
 *   Z₁    = Z ⊗ I   (clock qubit)
 *   Z₂    = I ⊗ Z   (work qubit)
 *
 * Little-endian convention:
 *   qubit 0 (clock) is the LEFT factor in ⊗
 *   qubit 1 (work)  is the RIGHT factor in ⊗
 */

import {
  PauliI,
  PauliX,
  PauliZ,
  tensorProduct,
  expectation4,
  type StateVec4,
} from "./hamiltonian";
import { makeLcg } from "../../../utils/rng";

// ── 4×4 observable matrices (computed once) ──────────────────────────────────

const OBS_Z1Z2 = tensorProduct(PauliZ, PauliZ);
const OBS_X1X2 = tensorProduct(PauliX, PauliX);
const OBS_Z1X2 = tensorProduct(PauliZ, PauliX);
const OBS_X1Z2 = tensorProduct(PauliX, PauliZ); // X_clock ⊗ Z_work — paper's (k₁,k₂)=(1,0) base
const OBS_Z1 = tensorProduct(PauliZ, PauliI);
const OBS_Z2 = tensorProduct(PauliI, PauliZ);

// ── Exact expectation values ──────────────────────────────────────────────────

export interface ExactExpectations {
  Z1Z2: number;
  X1X2: number;
  Z1X2: number;
  X1Z2: number; // X_clock ⊗ Z_work — término cruzado correcto del Hamiltoniano
  Z1: number;
  Z2: number;
}

export const exactExpectations = (psi: StateVec4): ExactExpectations => ({
  Z1Z2: expectation4(OBS_Z1Z2, psi),
  X1X2: expectation4(OBS_X1X2, psi),
  Z1X2: expectation4(OBS_Z1X2, psi),
  X1Z2: expectation4(OBS_X1Z2, psi),
  Z1: expectation4(OBS_Z1, psi),
  Z2: expectation4(OBS_Z2, psi),
});

// ── Shot-based sampling ───────────────────────────────────────────────────────
//
// For each observable O with eigenvalues ±1:
//   p(+1) = (1 + ⟨O⟩) / 2
//   p(-1) = (1 - ⟨O⟩) / 2
//
// We draw `shots` Bernoulli samples and compute the sample mean.
// This gives realistic shot noise for histogram + energy estimation.

export type Counts = Record<string, number>; // e.g. { "00": 512, "11": 256, ... }

/** Sample a ±1 observable given its exact expectation value */
const sampleObservable = (
  exactVal: number,
  shots: number,
  rng: () => number,
): number => {
  const pPlus = (1 + exactVal) / 2;
  let plusCount = 0;
  for (let i = 0; i < shots; i++) {
    if (rng() < pPlus) plusCount++;
  }
  return (2 * plusCount - shots) / shots; // sample mean in [-1, 1]
};

export interface SampledExpectations {
  Z1Z2: number;
  X1X2: number;
  Z1X2: number;
  X1Z2: number; // X_clock ⊗ Z_work — término cruzado correcto del Hamiltoniano
  Z1: number;
  Z2: number;
}

/** Seeded LCG for reproducible results when seed is provided */
const makeLCG = makeLcg;

export const sampleExpectations = (
  exact: ExactExpectations,
  shots: number,
  seed?: number,
): SampledExpectations => {
  const rng = makeLCG(seed);
  return {
    Z1Z2: sampleObservable(exact.Z1Z2, shots, rng),
    X1X2: sampleObservable(exact.X1X2, shots, rng),
    Z1X2: sampleObservable(exact.Z1X2, shots, rng),
    X1Z2: sampleObservable(exact.X1Z2, shots, rng),
    Z1: sampleObservable(exact.Z1, shots, rng),
    Z2: sampleObservable(exact.Z2, shots, rng),
  };
};

// ── Measurement counts (for histogram) ───────────────────────────────────────
//
// Generates a counts dict over the 4 computational basis states |00⟩…|11⟩
// by sampling from the Born-rule probability distribution.

export const sampleCounts = (
  psi: StateVec4,
  shots: number,
  seed?: number,
): Counts => {
  const rng = makeLCG(seed);

  // Born-rule probabilities
  const probs = psi.map(([r, i]) => r * r + i * i);

  // Cumulative for inverse transform sampling
  const cum = probs.reduce<number[]>((acc, p) => {
    acc.push((acc[acc.length - 1] ?? 0) + p);
    return acc;
  }, []);

  const labels = ["00", "01", "10", "11"];
  const counts: Counts = { "00": 0, "01": 0, "10": 0, "11": 0 };

  for (let i = 0; i < shots; i++) {
    const r = rng();
    const idx = cum.findIndex((c) => r < c);
    counts[labels[Math.max(0, idx)]]++;
  }

  return counts;
};

// ── Expected Born-rule probabilities per measurement basis ────────────────────
//
// State vector indexing (|clock, work⟩):
//   index 0 = |c=0, w=0⟩ = key "00"
//   index 1 = |c=0, w=1⟩ = key "01"
//   index 2 = |c=1, w=0⟩ = key "10"
//   index 3 = |c=1, w=1⟩ = key "11"
//
// The three measurement circuits each apply a basis rotation before
// measuring in the computational basis:
//   "z"  — no rotation        (ZZ)
//   "zx" — H on clock qubit   (Z_clock ⊗ X_work → measures X on clock)
//   "x"  — H on both qubits   (XX)

export function expectedBasisProbabilities(
  psi: StateVec4,
): Record<string, Record<string, number>> {
  const [p0, p1, p2, p3] = psi;
  const n2 = (re: number, im: number) => re * re + im * im;

  // z basis: direct Born rule
  const z: Record<string, number> = {
    "00": n2(p0[0], p0[1]),
    "01": n2(p1[0], p1[1]),
    "10": n2(p2[0], p2[1]),
    "11": n2(p3[0], p3[1]),
  };

  // zx basis: H_clock ⊗ I_work
  // amp'("0b") = (ψ[b] + ψ[2+b]) / √2,  amp'("1b") = (ψ[b] − ψ[2+b]) / √2
  const zx: Record<string, number> = {
    "00": n2(p0[0] + p2[0], p0[1] + p2[1]) / 2,
    "01": n2(p1[0] + p3[0], p1[1] + p3[1]) / 2,
    "10": n2(p0[0] - p2[0], p0[1] - p2[1]) / 2,
    "11": n2(p1[0] - p3[0], p1[1] - p3[1]) / 2,
  };

  // x basis: H_clock ⊗ H_work
  // amp'("00") = (p0+p1+p2+p3)/2,  amp'("01") = (p0−p1+p2−p3)/2
  // amp'("10") = (p0+p1−p2−p3)/2,  amp'("11") = (p0−p1−p2+p3)/2
  const x: Record<string, number> = {
    "00": n2(
      (p0[0] + p1[0] + p2[0] + p3[0]) / 2,
      (p0[1] + p1[1] + p2[1] + p3[1]) / 2,
    ),
    "01": n2(
      (p0[0] - p1[0] + p2[0] - p3[0]) / 2,
      (p0[1] - p1[1] + p2[1] - p3[1]) / 2,
    ),
    "10": n2(
      (p0[0] + p1[0] - p2[0] - p3[0]) / 2,
      (p0[1] + p1[1] - p2[1] - p3[1]) / 2,
    ),
    "11": n2(
      (p0[0] - p1[0] - p2[0] + p3[0]) / 2,
      (p0[1] - p1[1] - p2[1] + p3[1]) / 2,
    ),
  };

  return { z, zx, x };
}
