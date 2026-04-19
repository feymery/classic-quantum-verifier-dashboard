/**
 * simulate1Q.ts
 * Simulation layer for the 1-qubit protocol.
 *
 * This module is the client-side mock that produces the SAME data shape
 * that POST /run will eventually return from the Python/Qiskit backend.
 * Swapping to the real backend = replacing the body of runExperiment()
 * with a fetch() call. Everything above this layer stays unchanged.
 */

import { buildClockState } from "../physics/hamiltonian";
import {
  exactExpectations,
  sampleExpectations,
  sampleCounts,
} from "../physics/measurements";
import { analyseEnergy } from "../../../physics/energy";
import type {
  ExperimentConfig,
  ExperimentResult,
} from "../../../types/experiment";
import type { BackendId } from "../../../utils/constants";

export type { ExperimentConfig, ExperimentResult };

// ── Mock execution ────────────────────────────────────────────────────────────

let jobCounter = 0;

/**
 * runExperiment — the single entry point for the UI.
 * Returns a Promise so the signature is identical to a real fetch() call.
 */
export const runExperiment = async (
  config: ExperimentConfig,
  simulatedLatencyMs = 320,
): Promise<ExperimentResult> => {
  const t0 = performance.now();

  // Simulate async backend latency
  await new Promise((res) => setTimeout(res, simulatedLatencyMs));

  const { alpha, shots, backend, seed } = config;

  // Physics
  const psi = buildClockState(alpha);
  const exact = exactExpectations(psi);
  const sampled = sampleExpectations(exact, shots, seed);
  const counts = sampleCounts(psi, shots, seed);
  const energy = analyseEnergy(alpha, sampled);

  const durationMs = Math.round(performance.now() - t0);

  return {
    jobId: `mock-${String(++jobCounter).padStart(4, "0")}`,
    status: "complete",
    backend,
    counts,
    expectationValues: sampled,
    energy,
    shotsExecuted: shots,
    alpha,
    durationMs,
  };
};

// ── Convenience: run for multiple alphas (comparison mode) ───────────────────

export const runComparison = async (
  alphas: number[],
  shots: number,
  backend: BackendId,
): Promise<ExperimentResult[]> => {
  return Promise.all(
    alphas.map((alpha) => runExperiment({ alpha, shots, backend })),
  );
};
