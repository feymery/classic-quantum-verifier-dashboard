/**
 * experiment.ts
 * Centralised data-contract types shared between simulation services,
 * backend adapters, and UI components.
 *
 * These mirror the HTTP response shapes from POST /run (1Q).
 * Keeping them here means services only define logic — not shapes.
 */

import type { BackendId } from "../utils/constants";
import type {
  Counts,
  SampledExpectations,
} from "../modules/oneQubit/physics/measurements";
import type { EnergyAnalysis } from "../physics/energy";

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

  /** Raw counts over |00⟩…|11⟩ in the ZZ basis (kept for backwards compat) */
  counts: Counts;

  /**
   * Counts per measurement basis.
   * Keys: "z" (ZZ), "zx" (Z₁X₂), "x" (XX)
   */
  countsByBasis: Record<string, Counts>;

  /** Sampled expectation values (shot noise included) */
  expectationValues: SampledExpectations;

  /** Energy analysis */
  energy: EnergyAnalysis;

  /** Metadata */
  shotsExecuted: number;
  alpha: number;
  durationMs: number;
}
