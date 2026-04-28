import { useCallback, useEffect, useState } from "react";
import {
  runExperiment as runExperiment1Q,
  runComparison,
} from "../modules/oneQubit/services/quantumApi";
import { runExperiment2Q } from "../modules/twoQubit/services/simulate2Q";
import {
  pollBackendExperiment1Q,
  startBackendExperiment1Q,
} from "../modules/oneQubit/services/backendExperiment1Q";
import {
  pollBackendExperiment2Q,
  runBackendExperiment2Q,
  startBackendExperiment2Q,
} from "../modules/twoQubit/services/backendExperiment2Q";
import { isLocalBackend, type BackendId } from "../utils/constants";
import type { ExperimentResult, ExperimentResult2Q } from "../types/experiment";
import type {
  RunnerStatus,
  ExecutionSource,
  RunMode,
  RunHistoryEntry,
  ActiveAsyncJob,
} from "../types/runner";

export type {
  RunnerStatus,
  ExecutionSource,
  RunMode,
  RunHistoryEntry,
  ActiveAsyncJob,
};

// ── Constants ─────────────────────────────────────────────────────────────────

const RUN_HISTORY_STORAGE_KEY = "qvp.run-history.v1";
const ACTIVE_JOB_STORAGE_KEY = "qvp.active-job.v1";
const MAX_RUN_HISTORY_ENTRIES = 12;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RunRequest {
  mode: RunMode;
  alpha: number;
  shots: number;
  backend: BackendId;
  comparisonAlphas: number[];
}

interface RunnerState {
  status: RunnerStatus;
  error: string | null;
  oneQResult: ExperimentResult | null;
  twoQResult: ExperimentResult2Q | null;
  comparisonResults: ExperimentResult[];
  latestJobId: string | null;
  latestBackend: string | null;
  latestExecutionSource: ExecutionSource | null;
  latestMode: RunMode | null;
  history: RunHistoryEntry[];
  activeAsyncJob: ActiveAsyncJob | null;
}

type SetState = (updater: (prev: RunnerState) => RunnerState) => void;

// ── Pure helpers ──────────────────────────────────────────────────────────────

function makeEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeHistoryEntry(
  fields: Omit<RunHistoryEntry, "id" | "createdAt">,
): RunHistoryEntry {
  return { id: makeEntryId(), createdAt: new Date().toISOString(), ...fields };
}

function appendHistoryEntry(
  history: RunHistoryEntry[],
  entry: RunHistoryEntry,
): RunHistoryEntry[] {
  return [entry, ...history].slice(0, MAX_RUN_HISTORY_ENTRIES);
}

// ── Storage ───────────────────────────────────────────────────────────────────

function loadRunHistory(): RunHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RUN_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is RunHistoryEntry => {
      return (
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.id === "string" &&
        typeof entry.createdAt === "string" &&
        typeof entry.mode === "string" &&
        typeof entry.status === "string" &&
        typeof entry.alpha === "number" &&
        typeof entry.shots === "number" &&
        typeof entry.requestedBackend === "string" &&
        Array.isArray(entry.comparisonAlphas)
      );
    });
  } catch {
    return [];
  }
}

function loadActiveJob(): ActiveAsyncJob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_JOB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "jobId" in parsed &&
      "mode" in parsed &&
      "status" in parsed &&
      "alpha" in parsed &&
      "shots" in parsed &&
      "requestedBackend" in parsed
    ) {
      return parsed as ActiveAsyncJob;
    }
    return null;
  } catch {
    return null;
  }
}

function saveActiveJob(job: ActiveAsyncJob | null): void {
  if (typeof window === "undefined") return;
  try {
    if (job) {
      window.localStorage.setItem(ACTIVE_JOB_STORAGE_KEY, JSON.stringify(job));
    } else {
      window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
    }
  } catch {
    // noop
  }
}

// ── IBM polling status handler ────────────────────────────────────────────────

function makeStatusChangeHandler(jobId: string, setState: SetState) {
  return (status: { status: string }) => {
    setState((prev) => {
      if (prev.activeAsyncJob?.jobId !== jobId) return prev;
      return {
        ...prev,
        activeAsyncJob: {
          ...prev.activeAsyncJob,
          status:
            status.status === "pending"
              ? "queued"
              : status.status === "running"
                ? "running"
                : prev.activeAsyncJob.status,
          message:
            status.status === "running"
              ? "IBM job is running on the backend."
              : prev.activeAsyncJob.message,
        },
      };
    });
  };
}

// ── Result commit helpers ─────────────────────────────────────────────────────

interface Commit2QMeta {
  alpha: number;
  shots: number;
  backend: BackendId;
  executionSource: ExecutionSource;
  /** Present for async jobs: marks activeAsyncJob as done instead of nulling it. */
  completedJobId?: string;
}

function commit2QResult(
  twoQResult: ExperimentResult2Q,
  meta: Commit2QMeta,
  setState: SetState,
) {
  const entry = makeHistoryEntry({
    mode: "twoQ",
    status: "complete",
    alpha: meta.alpha,
    shots: meta.shots,
    requestedBackend: meta.backend,
    resolvedBackend: twoQResult.backend,
    executionSource: meta.executionSource,
    jobId: twoQResult.jobId,
    energyEstimate: twoQResult.energy.estimated,
    decision: twoQResult.energy.decision,
    comparisonAlphas: [],
    error: null,
    result: twoQResult,
    comparisonResults: [],
  });

  setState((prev) => ({
    ...prev,
    status: "complete",
    error: null,
    twoQResult,
    latestJobId: twoQResult.jobId,
    latestBackend: twoQResult.backend,
    latestExecutionSource: meta.executionSource,
    history: appendHistoryEntry(prev.history, entry),
    activeAsyncJob: meta.completedJobId
      ? prev.activeAsyncJob?.jobId === meta.completedJobId
        ? {
            ...prev.activeAsyncJob,
            status: "done",
            message: `Completed on ${twoQResult.backend}.`,
          }
        : prev.activeAsyncJob
      : null,
  }));
}

interface Commit1QMeta {
  alpha: number;
  shots: number;
  backend: BackendId;
  executionSource: ExecutionSource;
  comparisonAlphas: number[];
  completedJobId?: string;
}

function commit1QResult(
  oneQResult: ExperimentResult,
  comparisonResults: ExperimentResult[],
  meta: Commit1QMeta,
  setState: SetState,
) {
  const entry = makeHistoryEntry({
    mode: "oneQ",
    status: "complete",
    alpha: meta.alpha,
    shots: meta.shots,
    requestedBackend: meta.backend,
    resolvedBackend: oneQResult.backend,
    executionSource: meta.executionSource,
    jobId: oneQResult.jobId,
    energyEstimate: oneQResult.energy.estimated,
    decision: oneQResult.energy.decision,
    comparisonAlphas: meta.comparisonAlphas,
    error: null,
    result: oneQResult,
    comparisonResults,
  });

  setState((prev) => ({
    ...prev,
    status: "complete",
    error: null,
    oneQResult,
    comparisonResults,
    latestJobId: oneQResult.jobId,
    latestBackend: oneQResult.backend,
    latestExecutionSource: meta.executionSource,
    history: appendHistoryEntry(prev.history, entry),
    activeAsyncJob: meta.completedJobId
      ? prev.activeAsyncJob?.jobId === meta.completedJobId
        ? {
            ...prev.activeAsyncJob,
            status: "done",
            message: `Completed on ${oneQResult.backend}.`,
          }
        : prev.activeAsyncJob
      : null,
  }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useExperimentRunner() {
  const [state, setState] = useState<RunnerState>(() => ({
    status: "idle",
    error: null,
    oneQResult: null,
    twoQResult: null,
    comparisonResults: [],
    latestJobId: null,
    latestBackend: null,
    latestExecutionSource: null,
    latestMode: null,
    history: loadRunHistory(),
    activeAsyncJob: loadActiveJob(),
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        RUN_HISTORY_STORAGE_KEY,
        JSON.stringify(state.history),
      );
    } catch {
      // Ignore storage failures; history remains in-memory.
    }
  }, [state.history]);

  useEffect(() => {
    saveActiveJob(state.activeAsyncJob);
  }, [state.activeAsyncJob]);

  // ── IBM 2Q ──────────────────────────────────────────────────────────────────

  const runIbm2Q = useCallback(
    async (
      alpha: number,
      shots: number,
      backend: BackendId,
      comparisonAlphas: number[],
      startedAt: string,
    ) => {
      const started = await startBackendExperiment2Q({ alpha, shots, backend });
      if (!started) throw new Error("IBM 2Q submission unavailable");

      if (started.kind === "queued") {
        setState((prev) => ({
          ...prev,
          latestJobId: started.jobId,
          latestBackend: "ibm",
          latestExecutionSource: "api",
          activeAsyncJob: {
            jobId: started.jobId,
            mode: "twoQ",
            status: "queued",
            requestedBackend: backend,
            alpha,
            shots,
            comparisonAlphas,
            startedAt,
            message: "IBM job submitted. Polling in background.",
          },
        }));

        void pollBackendExperiment2Q(
          started.jobId,
          { alpha, shots, backend },
          makeStatusChangeHandler(started.jobId, setState),
        )
          .then((twoQResult) => {
            if (!twoQResult)
              throw new Error("IBM 2Q result could not be decoded");
            commit2QResult(
              twoQResult,
              {
                alpha,
                shots,
                backend,
                executionSource: "api",
                completedJobId: started.jobId,
              },
              setState,
            );
          })
          .catch((error) => {
            const message =
              error instanceof Error ? error.message : "IBM job failed";
            setState((prev) => ({
              ...prev,
              status: "error",
              error: message,
              history: appendHistoryEntry(
                prev.history,
                makeHistoryEntry({
                  mode: "twoQ",
                  status: "error",
                  alpha,
                  shots,
                  requestedBackend: backend,
                  resolvedBackend: null,
                  executionSource: null,
                  jobId: started.jobId,
                  energyEstimate: null,
                  decision: null,
                  comparisonAlphas: [],
                  error: message,
                  result: null,
                  comparisonResults: [],
                }),
              ),
              activeAsyncJob:
                prev.activeAsyncJob?.jobId === started.jobId
                  ? { ...prev.activeAsyncJob, status: "failed", message }
                  : prev.activeAsyncJob,
            }));
          });
        return;
      }

      commit2QResult(
        started.result,
        { alpha, shots, backend, executionSource: "api" },
        setState,
      );
    },
    [],
  );

  // ── IBM 1Q ──────────────────────────────────────────────────────────────────

  const runIbm1Q = useCallback(
    async (
      alpha: number,
      shots: number,
      backend: BackendId,
      comparisonAlphas: number[],
      startedAt: string,
    ) => {
      const started = await startBackendExperiment1Q({ alpha, shots, backend });
      if (!started) throw new Error("IBM 1Q submission unavailable");

      if (started.kind === "queued") {
        setState((prev) => ({
          ...prev,
          latestJobId: started.jobId,
          latestBackend: "ibm",
          latestExecutionSource: "api",
          activeAsyncJob: {
            jobId: started.jobId,
            mode: "oneQ",
            status: "queued",
            requestedBackend: backend,
            alpha,
            shots,
            comparisonAlphas,
            startedAt,
            message: "IBM job submitted. Polling in background.",
          },
        }));

        void pollBackendExperiment1Q(
          started.jobId,
          { alpha, shots, backend },
          makeStatusChangeHandler(started.jobId, setState),
        )
          .then(async (oneQResult) => {
            const comparisonResults =
              comparisonAlphas.length > 0
                ? await runComparison(comparisonAlphas, shots, backend)
                : [];
            commit1QResult(
              oneQResult,
              comparisonResults,
              {
                alpha,
                shots,
                backend,
                executionSource: "api",
                comparisonAlphas,
                completedJobId: started.jobId,
              },
              setState,
            );
          })
          .catch((error) => {
            const message =
              error instanceof Error ? error.message : "IBM job failed";
            setState((prev) => ({
              ...prev,
              status: "error",
              error: message,
              history: appendHistoryEntry(
                prev.history,
                makeHistoryEntry({
                  mode: "oneQ",
                  status: "error",
                  alpha,
                  shots,
                  requestedBackend: backend,
                  resolvedBackend: null,
                  executionSource: null,
                  jobId: started.jobId,
                  energyEstimate: null,
                  decision: null,
                  comparisonAlphas,
                  error: message,
                  result: null,
                  comparisonResults: [],
                }),
              ),
              activeAsyncJob:
                prev.activeAsyncJob?.jobId === started.jobId
                  ? { ...prev.activeAsyncJob, status: "failed", message }
                  : prev.activeAsyncJob,
            }));
          });
        return;
      }

      const comparisonResults =
        comparisonAlphas.length > 0
          ? await runComparison(comparisonAlphas, shots, backend)
          : [];
      commit1QResult(
        started.result,
        comparisonResults,
        { alpha, shots, backend, executionSource: "api", comparisonAlphas },
        setState,
      );
    },
    [],
  );

  // ── runExperiment ─────────────────────────────────────────────────────────────

  const runExperiment = useCallback(
    async (request: RunRequest) => {
      const { mode, alpha, shots, backend, comparisonAlphas } = request;

      setState((prev) => ({
        ...prev,
        status: "running",
        error: null,
        latestExecutionSource: null,
        latestMode: mode,
      }));

      try {
        if (backend === "ibm_runtime") {
          const startedAt = new Date().toISOString();
          if (mode === "twoQ") {
            await runIbm2Q(alpha, shots, backend, comparisonAlphas, startedAt);
          } else {
            await runIbm1Q(alpha, shots, backend, comparisonAlphas, startedAt);
          }
          return;
        }

        if (mode === "twoQ") {
          let twoQResult: ExperimentResult2Q;
          let executionSource: ExecutionSource = "local-2q";

          if (isLocalBackend(backend)) {
            twoQResult = await runExperiment2Q({ alpha, shots, backend });
          } else {
            try {
              const backendResult = await runBackendExperiment2Q({
                alpha,
                shots,
                backend,
              });
              if (backendResult) {
                twoQResult = backendResult;
                executionSource = "api";
              } else {
                twoQResult = await runExperiment2Q({ alpha, shots, backend });
                executionSource = "fallback-local";
              }
            } catch {
              twoQResult = await runExperiment2Q({ alpha, shots, backend });
              executionSource = "fallback-local";
            }
          }

          commit2QResult(
            twoQResult,
            { alpha, shots, backend, executionSource },
            setState,
          );
          return;
        }

        // oneQ — quantumApi routes internally: mock → local, aer/ibm_runtime → backend+fallback
        const oneQResult = await runExperiment1Q({ alpha, shots, backend });
        const isMock = isLocalBackend(backend);
        const executionSource: ExecutionSource = isMock
          ? "local-mock"
          : oneQResult.jobId.startsWith("mock-")
            ? "fallback-local"
            : "api";

        const comparisonResults =
          comparisonAlphas.length > 0
            ? await runComparison(comparisonAlphas, shots, backend)
            : [];

        commit1QResult(
          oneQResult,
          comparisonResults,
          { alpha, shots, backend, executionSource, comparisonAlphas },
          setState,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Experiment run failed";
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
          history: appendHistoryEntry(
            prev.history,
            makeHistoryEntry({
              mode,
              status: "error",
              alpha,
              shots,
              requestedBackend: backend,
              resolvedBackend: null,
              executionSource: null,
              jobId: null,
              energyEstimate: null,
              decision: null,
              comparisonAlphas,
              error: message,
              result: null,
              comparisonResults: [],
            }),
          ),
          activeAsyncJob: null,
        }));
      }
    },
    [runIbm2Q, runIbm1Q],
  );

  // ── resumeJob ─────────────────────────────────────────────────────────────────

  // Re-attaches poll handlers for a job interrupted by a page refresh.
  // No re-submission needed — the job is still in the backend SQLite DB.
  const resumeJob = useCallback((job: ActiveAsyncJob) => {
    const {
      jobId,
      mode,
      alpha,
      shots,
      requestedBackend: backend,
      comparisonAlphas,
    } = job;

    setState((prev) => ({
      ...prev,
      status: "running",
      activeAsyncJob: {
        ...job,
        status: "queued",
        message: "Resuming — checking job status…",
      },
    }));

    const onStatusChange = makeStatusChangeHandler(jobId, setState);

    if (mode === "twoQ") {
      void pollBackendExperiment2Q(
        jobId,
        { alpha, shots, backend },
        onStatusChange,
      )
        .then((twoQResult) => {
          if (!twoQResult)
            throw new Error("IBM 2Q result could not be decoded");
          commit2QResult(
            twoQResult,
            {
              alpha,
              shots,
              backend,
              executionSource: "api",
              completedJobId: jobId,
            },
            setState,
          );
        })
        .catch((error) => {
          const message =
            error instanceof Error ? error.message : "IBM job failed";
          setState((prev) => ({
            ...prev,
            status: "error",
            error: message,
            activeAsyncJob:
              prev.activeAsyncJob?.jobId === jobId
                ? { ...prev.activeAsyncJob, status: "failed", message }
                : prev.activeAsyncJob,
          }));
        });
      return;
    }

    void pollBackendExperiment1Q(
      jobId,
      { alpha, shots, backend },
      onStatusChange,
    )
      .then((oneQResult) => {
        commit1QResult(
          oneQResult,
          [],
          {
            alpha,
            shots,
            backend,
            executionSource: "api",
            comparisonAlphas,
            completedJobId: jobId,
          },
          setState,
        );
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "IBM job failed";
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
          activeAsyncJob:
            prev.activeAsyncJob?.jobId === jobId
              ? { ...prev.activeAsyncJob, status: "failed", message }
              : prev.activeAsyncJob,
        }));
      });
  }, []);

  // Auto-resume on mount: if the page was refreshed while a job was in-flight,
  // re-attach poll handlers.
  useEffect(() => {
    const stored = loadActiveJob();
    if (stored && (stored.status === "queued" || stored.status === "running")) {
      resumeJob(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only

  // ── Remaining callbacks ───────────────────────────────────────────────────────

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, history: [] }));
  }, []);

  const restoreResult = useCallback((entry: RunHistoryEntry) => {
    if (!entry.result) return;

    if (entry.mode === "twoQ") {
      setState((prev) => ({
        ...prev,
        status: "complete",
        error: null,
        twoQResult: entry.result as ExperimentResult2Q,
        oneQResult: null,
        comparisonResults: [],
        latestJobId: entry.jobId,
        latestBackend: entry.resolvedBackend,
        latestExecutionSource: entry.executionSource,
        latestMode: "twoQ",
      }));
    } else {
      setState((prev) => ({
        ...prev,
        status: "complete",
        error: null,
        oneQResult: entry.result as ExperimentResult,
        twoQResult: null,
        comparisonResults: entry.comparisonResults ?? [],
        latestJobId: entry.jobId,
        latestBackend: entry.resolvedBackend,
        latestExecutionSource: entry.executionSource,
        latestMode: "oneQ",
      }));
    }
  }, []);

  const dismissActiveAsyncJob = useCallback(() => {
    setState((prev) => ({ ...prev, activeAsyncJob: null }));
  }, []);

  const retryActiveAsyncJob = useCallback(() => {
    setState((prev) => {
      if (!prev.activeAsyncJob || prev.activeAsyncJob.status === "running")
        return prev;
      return { ...prev, activeAsyncJob: null };
    });

    const snapshot = state.activeAsyncJob;
    if (!snapshot || snapshot.status === "running") return;

    void runExperiment({
      mode: snapshot.mode,
      alpha: snapshot.alpha,
      shots: snapshot.shots,
      backend: snapshot.requestedBackend,
      comparisonAlphas: snapshot.comparisonAlphas,
    });
  }, [runExperiment, state.activeAsyncJob]);

  return {
    ...state,
    isRunning: state.status === "running",
    runExperiment,
    resumeJob,
    clearHistory,
    restoreResult,
    dismissActiveAsyncJob,
    retryActiveAsyncJob,
  };
}
