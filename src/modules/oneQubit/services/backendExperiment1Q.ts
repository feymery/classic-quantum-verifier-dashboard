import { analyseEnergy } from "../../../physics/energy";
import type { Counts, SampledExpectations } from "../physics/measurements";
import type { ExperimentResult } from "../../../types/experiment";
import { fetchJson } from "../../../services/apiClient";
import { mapBackendId, type BackendId } from "../../../utils/constants";

interface BackendRunResult {
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
    Z1: finalResult.observables.Z1,
    Z2: finalResult.observables.Z2,
    Z1Z2: finalResult.observables.Z1Z2,
    Z1X2: finalResult.observables.Z1X2 ?? 0,
    X1X2: finalResult.observables.X1X2,
  };

  const energy = analyseEnergy(input.alpha, expectationValues);

  return {
    jobId,
    status: "complete",
    backend:
      finalResult.backendInfo?.type || mapBackendId(input.backend) || "aer",
    counts: collapseCountsTo2Bit(finalResult.counts),
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
}): Promise<BackendExperimentStart1Q | null> {
  const mappedBackend = mapBackendId(input.backend);
  if (!mappedBackend) return null;

  const payload = {
    alpha: input.alpha,
    shots: input.shots,
    backend: mappedBackend,
    mode: "1q",
  };

  const runResponse = await fetchJson<BackendRunResult | BackendQueued>(
    `${API_BASE}/run`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if ("job_id" in runResponse) {
    return { kind: "queued", jobId: runResponse.job_id };
  }

  return {
    kind: "complete",
    result: toExperimentResult(runResponse, input, `api-${Date.now()}`),
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
