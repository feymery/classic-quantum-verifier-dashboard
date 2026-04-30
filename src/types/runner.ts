/**
 * runner.ts
 * Centralised types for experiment execution state, run history,
 * and async job tracking. Consumed by useExperimentRunner and UI components.
 */

import type { BackendId } from "../utils/constants";

// ── Execution state ───────────────────────────────────────────────────────────

export type RunnerStatus = "idle" | "running" | "complete" | "error";

export type ExecutionSource =
  | "api"
  | "fallback-local"
  | "local-mock"
  | "local-2q";

export type RunMode = "oneQ" | "twoQ";

// ── Backend job history (source of truth: SQLite via GET /jobs) ──────────────

/** Job status values as returned by the backend API. */
export type JobStatus = "pending" | "running" | "done" | "failed";

/** Verifier decision values aligned with _verifier_decision() in backend/main.py. */
export type VerifierDecision = "accept" | "boundary" | "reject";

/**
 * Slim representation of a job as returned by GET /jobs.
 * Does NOT embed the full result payload — those are fetched on demand
 * via GET /job/{job_id} when the user requests to restore a run.
 */
export interface JobHistoryItem {
  jobId: string;
  createdAt: string;
  updatedAt: string;
  /** "1q" | "2q" — matches the backend mode column. */
  mode: "1q" | "2q";
  status: JobStatus;
  alpha: number;
  shots: number;
  /** Backend the job was submitted to ("aer" | "ibm"). */
  requestedBackend: string;
  /** Actual backend that ran the job, e.g. "ibm_strasbourg". Null until done. */
  resolvedBackend: string | null;
  /** "aer" | "ibm" — execution path used on the server. Null until done. */
  executionSource: string | null;
  /** Estimated energy value. Null for pending/running jobs. */
  energyEstimate: number | null;
  /** Verifier classification. Null for pending/running jobs. */
  decision: VerifierDecision | null;
  /** Error message for failed jobs. */
  error: string | null;
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
