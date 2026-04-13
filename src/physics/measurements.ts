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
import { makeLcg } from "../utils/rng";

// ── 4×4 observable matrices (computed once) ──────────────────────────────────

const OBS_Z1Z2 = tensorProduct(PauliZ, PauliZ);
const OBS_X1X2 = tensorProduct(PauliX, PauliX);
const OBS_Z1 = tensorProduct(PauliZ, PauliI);
const OBS_Z2 = tensorProduct(PauliI, PauliZ);

// ── Exact expectation values ──────────────────────────────────────────────────

export interface ExactExpectations {
  Z1Z2: number;
  X1X2: number;
  Z1: number;
  Z2: number;
}

export const exactExpectations = (psi: StateVec4): ExactExpectations => ({
  Z1Z2: expectation4(OBS_Z1Z2, psi),
  X1X2: expectation4(OBS_X1X2, psi),
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
