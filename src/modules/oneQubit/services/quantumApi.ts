/**
 * quantumApi.ts — unified 1Q experiment entrypoint.
 *
 * Routes every run request to the FastAPI backend (backendExperiment1Q).
 * "aer" → synchronous Aer executor (result returned immediately).
 * "ibm_runtime" → async IBM Runtime executor (caller handles polling).
 */

import type {
  ExperimentConfig,
  ExperimentResult,
} from "../../../types/experiment";
import { runBackendExperiment1Q } from "./backendExperiment1Q";
import type { BackendId } from "../../../utils/constants";

export type { ExperimentConfig, ExperimentResult };

/** Run a single 1Q experiment via the FastAPI backend. */
export async function runExperiment(
  config: ExperimentConfig,
): Promise<ExperimentResult> {
  return runBackendExperiment1Q(config);
}

/** Run multiple alphas in parallel for comparison mode. */
export async function runComparison(
  alphas: number[],
  shots: number,
  backend: BackendId,
): Promise<ExperimentResult[]> {
  return Promise.all(
    alphas.map((alpha) => runExperiment({ alpha, shots, backend })),
  );
}
