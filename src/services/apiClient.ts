export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as { error?: unknown };
  if (typeof candidate.error !== "object" || candidate.error === null) {
    return false;
  }

  const error = candidate.error as { code?: unknown; message?: unknown };
  return typeof error.code === "string" && typeof error.message === "string";
}

export class ApiRequestError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  const payload = text ? tryParseJson(text) : null;

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new ApiRequestError(
        response.status,
        payload.error.code,
        payload.error.message,
        payload.error.details,
      );
    }

    throw new ApiRequestError(
      response.status,
      "http-error",
      `HTTP ${response.status} ${response.statusText}`,
    );
  }

  return payload as T;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ── Job history API ───────────────────────────────────────────────────────────

import type { JobHistoryItem } from "../types/runner";

const API_BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() || "/api";

/** Shape of one item returned by GET /jobs. */
interface RawJobItem {
  job_id: string;
  created_at: string;
  updated_at: string;
  status: "pending" | "running" | "done" | "failed";
  alpha: number;
  shots: number;
  backend: string;
  resolved_backend: string | null;
  execution_source: string | null;
  energy_estimate: number | null;
  decision: "accept" | "boundary" | "reject" | null;
  sweep_id: string | null;
  error: string | null;
}

interface JobsResponse {
  items: RawJobItem[];
  pagination: {
    limit: number;
    offset: number;
    returned: number;
    total: number;
    has_more: boolean;
    next_offset: number | null;
  };
}

function rawToJobHistoryItem(raw: RawJobItem): JobHistoryItem {
  return {
    jobId: raw.job_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    status: raw.status,
    alpha: raw.alpha,
    shots: raw.shots,
    requestedBackend: raw.backend,
    resolvedBackend: raw.resolved_backend,
    executionSource: raw.execution_source,
    energyEstimate: raw.energy_estimate,
    decision: raw.decision,
    sweepId: raw.sweep_id ?? null,
    error: raw.error,
  };
}

export async function fetchJobHistory(
  limit = 20,
  offset = 0,
): Promise<{ items: JobHistoryItem[]; hasMore: boolean; total: number }> {
  const url = `${API_BASE}/jobs?limit=${limit}&offset=${offset}`;
  const data = await fetchJson<JobsResponse>(url);
  return {
    items: data.items.map(rawToJobHistoryItem),
    hasMore: data.pagination.has_more,
    total: data.pagination.total,
  };
}

export async function deleteAllJobs(): Promise<{ deleted: number }> {
  return fetchJson<{ deleted: number }>(`${API_BASE}/jobs`, {
    method: "DELETE",
  });
}

/** Shape returned by GET /job/{job_id}. */
interface SingleJobResponse {
  job_id: string;
  status: "pending" | "running" | "done" | "failed";
  result?: { energy?: number } | null;
  metadata?: { error?: string | null } | null;
}

export interface SingleJobStatus {
  status: JobHistoryItem["status"];
  energyEstimate: number | null;
  decision: JobHistoryItem["decision"];
  error: string | null;
}

function energyToDecision(energy: number): JobHistoryItem["decision"] {
  if (energy < 0.4) return "accept";
  if (energy >= 0.5) return "reject";
  return "boundary";
}

export async function fetchSingleJobStatus(
  jobId: string,
): Promise<SingleJobStatus> {
  const raw = await fetchJson<SingleJobResponse>(`${API_BASE}/job/${jobId}`);
  const energy =
    typeof raw.result?.energy === "number" ? raw.result.energy : null;
  return {
    status: raw.status,
    energyEstimate: energy,
    decision: energy !== null ? energyToDecision(energy) : null,
    error: raw.metadata?.error ?? null,
  };
}
