/**
 * simulate2Q.ts
 * Simulation layer for the 2-qubit extension protocol.
 * Same data-contract shape as simulate1Q — UI doesn't care which is running.
 */

import { buildClockState2Q } from "../physics/hamiltonian2Q";
import {
  exactExpectations2Q,
  sampleExpectations2Q,
  sampleCounts2Q,
  analyseEnergy2Q,
} from "../physics/measurements2Q";
import type {
  ExperimentConfig2Q,
  ExperimentResult2Q,
} from "../../../types/experiment";

export type { ExperimentConfig2Q, ExperimentResult2Q };

// ── Execution ─────────────────────────────────────────────────────────────────

let jobCounter = 0;

export const runExperiment2Q = async (
  config: ExperimentConfig2Q,
  simulatedLatencyMs = 380,
): Promise<ExperimentResult2Q> => {
  const t0 = performance.now();
  await new Promise((res) => setTimeout(res, simulatedLatencyMs));

  const { alpha, shots, backend, seed } = config;

  const psi = buildClockState2Q(alpha);
  const exact = exactExpectations2Q(psi);
  const sampled = sampleExpectations2Q(exact, shots, seed);
  const counts = sampleCounts2Q(psi, shots, seed);
  const energy = analyseEnergy2Q(alpha, sampled);

  return {
    jobId: `2q-mock-${String(++jobCounter).padStart(4, "0")}`,
    status: "complete",
    backend,
    counts,
    expectationValues: sampled,
    energy,
    shotsExecuted: shots,
    alpha,
    durationMs: Math.round(performance.now() - t0),
  };
};
