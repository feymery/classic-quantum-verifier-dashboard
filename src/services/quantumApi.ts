/**
 * quantumApi.ts — unified 1Q experiment entrypoint.
 *
 * Routes every run request to the FastAPI backend (backendExperiment1Q).
 * "aer" → synchronous Aer executor (result returned immediately).
 * "ibm_runtime" → async IBM Runtime executor (caller handles polling).
 */

import type { ExperimentConfig, ExperimentResult } from "../types/experiment";
import { runBackendExperiment1Q } from "./backendExperiment1Q";

export type { ExperimentConfig, ExperimentResult };

/** Run a single 1Q experiment via the FastAPI backend. */
export async function runExperiment(
  config: ExperimentConfig,
): Promise<ExperimentResult> {
  return runBackendExperiment1Q(config);
}
