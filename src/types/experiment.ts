/**
 * experiment.ts
 * Centralised data-contract types shared between simulation services,
 * backend adapters, and UI components.
 *
 * These mirror the HTTP response shapes from POST /run (1Q) and POST /run2q.
 * Keeping them here means services only define logic — not shapes.
 */

import type { BackendId } from "../utils/constants";
import type { Counts, SampledExpectations } from "../physics/measurements";
import type { EnergyAnalysis } from "../physics/energy";
import type {
  Counts8,
  SampledExpectations2Q,
  EnergyAnalysis2Q,
} from "../physics/measurements2Q";

// ── 1-Qubit ───────────────────────────────────────────────────────────────────

export interface ExperimentConfig {
  alpha: number;
  shots: number;
  backend: BackendId;
  seed?: number;
}

export interface ExperimentResult {
  jobId: string;
  status: "complete" | "running" | "error";
  backend: string;

  /** Raw counts over |00⟩…|11⟩ */
  counts: Counts;

  /** Sampled expectation values (shot noise included) */
  expectationValues: SampledExpectations;

  /** Energy analysis */
  energy: EnergyAnalysis;

  /** Metadata */
  shotsExecuted: number;
  alpha: number;
  durationMs: number;
}

// ── 2-Qubit ───────────────────────────────────────────────────────────────────

export interface ExperimentConfig2Q {
  alpha: number;
  shots: number;
  backend: BackendId;
  seed?: number;
}

export interface ExperimentResult2Q {
  jobId: string;
  status: "complete" | "running" | "error";
  backend: string;
  counts: Counts8;
  expectationValues: SampledExpectations2Q;
  energy: EnergyAnalysis2Q;
  shotsExecuted: number;
  alpha: number;
  durationMs: number;
}
