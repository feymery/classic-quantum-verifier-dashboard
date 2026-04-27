/**
 * runner.ts
 * Centralised types for experiment execution state, run history,
 * and async job tracking. Consumed by useExperimentRunner and UI components.
 */

import type { BackendId } from "../utils/constants";
import type { ExperimentResult, ExperimentResult2Q } from "./experiment";

// ── Execution state ───────────────────────────────────────────────────────────

export type RunnerStatus = "idle" | "running" | "complete" | "error";

export type ExecutionSource =
  | "api"
  | "fallback-local"
  | "local-mock"
  | "local-2q";

export type RunMode = "oneQ" | "twoQ";

// ── Run history ───────────────────────────────────────────────────────────────

export interface RunHistoryEntry {
  id: string;
  createdAt: string;
  mode: RunMode;
  status: "complete" | "error";
  alpha: number;
  shots: number;
  requestedBackend: BackendId;
  resolvedBackend: string | null;
  executionSource: ExecutionSource | null;
  jobId: string | null;
  energyEstimate: number | null;
  decision: string | null;
  comparisonAlphas: number[];
  error: string | null;
  /** Full backend response — stored so past results can be replayed without re-running. */
  result: ExperimentResult | ExperimentResult2Q | null;
  /** Comparison curve results associated with this run. */
  comparisonResults: ExperimentResult[];
}

// ── Async IBM Runtime jobs ────────────────────────────────────────────────────

export interface ActiveAsyncJob {
  jobId: string;
  mode: RunMode;
  status: "queued" | "running" | "done" | "failed";
  requestedBackend: BackendId;
  alpha: number;
  shots: number;
  comparisonAlphas: number[];
  startedAt: string;
  message: string | null;
}
