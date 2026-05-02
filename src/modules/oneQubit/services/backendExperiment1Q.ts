import { analyseEnergy } from "../../../physics/energy";
import type { Counts, SampledExpectations } from "../physics/measurements";
import type { ExperimentResult } from "../../../types/experiment";
import { fetchJson } from "../../../services/apiClient";
import { mapBackendId, type BackendId } from "../../../utils/constants";

interface BackendRunResult {
  job_id?: string;
  alpha: number;
  observables: {
    Z1: number;
    Z2: number;
    Z1Z2: number;
    Z1X2: number;
    X1X2: number;
  };
  energy: number;
  counts: Record<string, number>;
  counts_zx?: Record<string, number>;
  counts_x?: Record<string, number>;
  backendInfo?: {
    type: string;
    shots: number;
    executionTime: number;
  };
}

interface BackendQueued {
  job_id: string;
  status: "queued";
}

export interface BackendJobStatus {
  job_id: string;
  status: "pending" | "running" | "done" | "failed";
  result?: BackendRunResult;
  metadata?: {
    error?: string | null;
  };
}

export type BackendExperimentStart1Q =
  | { kind: "complete"; result: ExperimentResult }
  | { kind: "queued"; jobId: string };

const API_BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() || "/api";

function collapseCountsTo2Bit(rawCounts: Record<string, number>): Counts {
  const result: Counts = { "00": 0, "01": 0, "10": 0, "11": 0 };

  Object.entries(rawCounts).forEach(([rawKey, value]) => {
    const key = rawKey.replace(/\s+/g, "");
    let twoBit = "00";

    if (key.length >= 3) {
      // Qiskit order is usually c2c1c0; frontend 1Q panels display q0q1.
      twoBit = `${key[2]}${key[1]}`;
    } else if (key.length === 2) {
      twoBit = key;
    } else if (key.length === 1) {
      twoBit = `0${key}`;
    }

    if (Object.hasOwn(result, twoBit)) {
      result[twoBit] += Number(value) || 0;
    }
  });

  return result;
}

function toExperimentResult(
  finalResult: BackendRunResult,
  input: { alpha: number; shots: number; backend: BackendId },
  jobId: string,
): ExperimentResult {
  const expectationValues: SampledExpectations = {
    // Backend Z2 (clock) → Frontend Z1 (clock), Backend Z1 (prover) → Frontend Z2 (work)
    Z1: finalResult.observables.Z2,
    Z2: finalResult.observables.Z1,
    Z1Z2: finalResult.observables.Z1Z2,
    // Z1X2 y X1Z2 son el mismo operador físico (Z_{q0}⊗X_{q1} = X_{q1}⊗Z_{q0})
    Z1X2: finalResult.observables.Z1X2 ?? 0,
    X1Z2: finalResult.observables.Z1X2 ?? 0,
    X1X2: finalResult.observables.X1X2,
  };

  const energy = analyseEnergy(input.alpha, expectationValues);

  const countsZ = collapseCountsTo2Bit(finalResult.counts);
  const countsZX = finalResult.counts_zx
    ? collapseCountsTo2Bit(finalResult.counts_zx)
    : undefined;
  const countsX = finalResult.counts_x
    ? collapseCountsTo2Bit(finalResult.counts_x)
    : undefined;

  const countsByBasis: Record<string, Counts> = { z: countsZ };
  if (countsZX) countsByBasis["zx"] = countsZX;
  if (countsX) countsByBasis["x"] = countsX;

  return {
    jobId,
    status: "complete",
    backend: finalResult.backendInfo?.type || mapBackendId(input.backend),
    counts: countsZ,
    countsByBasis,
    expectationValues,
    energy,
    shotsExecuted: input.shots,
    alpha: input.alpha,
    durationMs: Math.round(finalResult.backendInfo?.executionTime ?? 0),
  };
}

async function waitForJob(
  jobId: string,
  onStatusChange?: (status: BackendJobStatus) => void,
): Promise<BackendRunResult> {
  const maxAttempts = 45;
  const intervalMs = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const status = await fetchJson<BackendJobStatus>(
      `${API_BASE}/job/${jobId}`,
    );

    onStatusChange?.(status);

    if (status.status === "done" && status.result) {
      return status.result;
    }

    if (status.status === "failed") {
      throw new Error(status.metadata?.error || "IBM job failed");
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Timed out waiting for IBM job result");
}

export async function startBackendExperiment1Q(input: {
  alpha: number;
  shots: number;
  backend: BackendId;
}): Promise<BackendExperimentStart1Q> {
  const mappedBackend = mapBackendId(input.backend);

  const payload = {
    alpha: input.alpha,
    shots: input.shots,
    backend: mappedBackend,
  };

  const runResponse = await fetchJson<BackendRunResult | BackendQueued>(
    `${API_BASE}/run`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (
    "status" in runResponse &&
    (runResponse as BackendQueued).status === "queued"
  ) {
    return { kind: "queued", jobId: (runResponse as BackendQueued).job_id };
  }

  const syncResult = runResponse as BackendRunResult;
  return {
    kind: "complete",
    result: toExperimentResult(
      syncResult,
      input,
      syncResult.job_id ?? `api-${Date.now()}`,
    ),
  };
}

export async function pollBackendExperiment1Q(
  jobId: string,
  input: {
    alpha: number;
    shots: number;
    backend: BackendId;
  },
  onStatusChange?: (status: BackendJobStatus) => void,
): Promise<ExperimentResult> {
  const finalResult = await waitForJob(jobId, onStatusChange);
  return toExperimentResult(finalResult, input, jobId);
}

export async function runBackendExperiment1Q(input: {
  alpha: number;
  shots: number;
  backend: BackendId;
}): Promise<ExperimentResult | null> {
  const started = await startBackendExperiment1Q(input);
  if (!started) return null;
  if (started.kind === "complete") return started.result;
  return pollBackendExperiment1Q(started.jobId, input);
}
