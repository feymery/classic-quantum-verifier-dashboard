import {
  analyseEnergy2Q,
  type Counts8,
  type SampledExpectations2Q,
} from "../physics/measurements2Q";
import type { ExperimentResult2Q } from "../../../types/experiment";
import { fetchJson } from "../../../services/apiClient";
import { mapBackendId, type BackendId } from "../../../utils/constants";

interface BackendRunResult {
  alpha: number;
  observables: Record<string, number>;
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

export type BackendExperimentStart2Q =
  | { kind: "complete"; result: ExperimentResult2Q }
  | { kind: "queued"; jobId: string };

const API_BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() || "/api";

const TWO_Q_KEYS = [
  "Z1",
  "Z2",
  "Z3",
  "Z1Z2",
  "Z1Z3",
  "Z2Z3",
  "X1X2",
  "X1X3",
  "X2X3",
  "Z1Z2Z3",
] as const;

function toCounts8(rawCounts: Record<string, number>): Counts8 {
  const basis = ["000", "001", "010", "011", "100", "101", "110", "111"];
  const counts: Counts8 = Object.fromEntries(
    basis.map((k) => [k, 0]),
  ) as Counts8;

  Object.entries(rawCounts).forEach(([rawKey, value]) => {
    const key = rawKey.replace(/\s+/g, "");
    if (Object.hasOwn(counts, key)) {
      counts[key] += Number(value) || 0;
    }
  });

  return counts;
}

function toSampledExpectations2Q(
  observables: Record<string, number>,
): SampledExpectations2Q | null {
  for (const key of TWO_Q_KEYS) {
    if (typeof observables[key] !== "number") {
      return null;
    }
  }

  return {
    Z1: observables.Z1,
    Z2: observables.Z2,
    Z3: observables.Z3,
    Z1Z2: observables.Z1Z2,
    Z1Z3: observables.Z1Z3,
    Z2Z3: observables.Z2Z3,
    X1X2: observables.X1X2,
    X1X3: observables.X1X3,
    X2X3: observables.X2X3,
    Z1Z2Z3: observables.Z1Z2Z3,
  };
}

function toExperimentResult2Q(
  finalResult: BackendRunResult,
  input: { alpha: number; shots: number; backend: BackendId },
  jobId: string,
): ExperimentResult2Q | null {
  const expectationValues = toSampledExpectations2Q(finalResult.observables);
  if (!expectationValues) {
    return null;
  }

  const energy = analyseEnergy2Q(input.alpha, expectationValues);

  return {
    jobId,
    status: "complete",
    backend:
      finalResult.backendInfo?.type || mapBackendId(input.backend) || "aer",
    counts: toCounts8(finalResult.counts),
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

export async function startBackendExperiment2Q(input: {
  alpha: number;
  shots: number;
  backend: BackendId;
}): Promise<BackendExperimentStart2Q | null> {
  const mappedBackend = mapBackendId(input.backend);
  if (!mappedBackend) return null;

  const runResponse = await fetchJson<BackendRunResult | BackendQueued>(
    `${API_BASE}/run`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alpha: input.alpha,
        shots: input.shots,
        backend: mappedBackend,
        mode: "2q",
      }),
    },
  );

  if ("job_id" in runResponse) {
    return { kind: "queued", jobId: runResponse.job_id };
  }

  const result = toExperimentResult2Q(
    runResponse,
    input,
    `api-2q-${Date.now()}`,
  );
  if (!result) return null;
  return { kind: "complete", result };
}

export async function pollBackendExperiment2Q(
  jobId: string,
  input: {
    alpha: number;
    shots: number;
    backend: BackendId;
  },
  onStatusChange?: (status: BackendJobStatus) => void,
): Promise<ExperimentResult2Q | null> {
  const finalResult = await waitForJob(jobId, onStatusChange);
  return toExperimentResult2Q(finalResult, input, jobId);
}

export async function runBackendExperiment2Q(input: {
  alpha: number;
  shots: number;
  backend: BackendId;
}): Promise<ExperimentResult2Q | null> {
  const started = await startBackendExperiment2Q(input);
  if (!started) return null;
  if (started.kind === "complete") return started.result;
  return pollBackendExperiment2Q(started.jobId, input);
}
