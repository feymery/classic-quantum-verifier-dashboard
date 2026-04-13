/**
 * quantumApi.ts — unified 1Q experiment entrypoint.
 *
 * Routes every run request to the correct execution path:
 *   - "mock" / "fake_ibm"  → local simulator (simulate1Q)
 *   - "aer" / "ibm_runtime" → FastAPI backend (backendExperiment1Q),
 *                              with automatic fallback to local simulator
 *                              when the backend is unreachable.
 *
 * Callers import only from here; they do not need to know about the
 * underlying services.
 */

import {
  runExperiment as runLocal,
  runComparison as runComparisonLocal,
  type ExperimentConfig,
  type ExperimentResult,
} from "./simulate1Q";
import { runBackendExperiment1Q } from "./backendExperiment1Q";
import { isLocalBackend, type BackendId } from "../utils/constants";

export type { ExperimentConfig, ExperimentResult };

/** Run a single 1Q experiment, routing to backend or local mock. */
export async function runExperiment(
  config: ExperimentConfig,
  simulatedLatencyMs?: number,
): Promise<ExperimentResult> {
  if (isLocalBackend(config.backend)) {
    return runLocal(config, simulatedLatencyMs);
  }

  try {
    const result = await runBackendExperiment1Q(config);
    if (result) return result;
  } catch {
    // backend unreachable — fall through to local simulator
  }

  return runLocal(config, simulatedLatencyMs);
}

/** Run multiple alphas in parallel for comparison mode. */
export async function runComparison(
  alphas: number[],
  shots: number,
  backend: BackendId,
): Promise<ExperimentResult[]> {
  if (isLocalBackend(backend)) {
    return runComparisonLocal(alphas, shots, backend);
  }
  return Promise.all(
    alphas.map((alpha) => runExperiment({ alpha, shots, backend })),
  );
}
