import { useCallback, useEffect, useRef, useState } from "react";
import {
  runExperiment as runExperiment1Q,
  runComparison,
} from "../modules/oneQubit/services/quantumApi";
import {
  pollBackendExperiment1Q,
  startBackendExperiment1Q,
} from "../modules/oneQubit/services/backendExperiment1Q";
import type { BackendId } from "../utils/constants";
import type { ExperimentResult } from "../types/experiment";
import type {
  RunnerStatus,
  ExecutionSource,
  JobHistoryItem,
} from "../types/runner";
import { useJobHistory } from "./useJobHistory";

export type { RunnerStatus, ExecutionSource };

// ── Constants ─────────────────────────────────────────────────────────────────

/** Leftover key from the old localStorage-based history. Cleared on first load. */
const LEGACY_RUN_HISTORY_KEY = "qvp.run-history.v1";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RunRequest {
  alpha: number;
  shots: number;
  backend: BackendId;
  comparisonAlphas: number[];
}

interface RunnerState {
  status: RunnerStatus;
  error: string | null;
  oneQResult: ExperimentResult | null;
  comparisonResults: ExperimentResult[];
  latestJobId: string | null;
  latestBackend: string | null;
  latestExecutionSource: ExecutionSource | null;
}

type SetState = (updater: (prev: RunnerState) => RunnerState) => void;

// ── Result commit helpers ─────────────────────────────────────────────────────

interface Commit1QMeta {
  alpha: number;
  shots: number;
  backend: BackendId;
  executionSource: ExecutionSource;
}

function commit1QResult(
  oneQResult: ExperimentResult,
  comparisonResults: ExperimentResult[],
  meta: Commit1QMeta,
  setState: SetState,
) {
  setState((prev) => ({
    ...prev,
    status: "complete",
    error: null,
    oneQResult,
    comparisonResults,
    latestJobId: oneQResult.jobId,
    latestBackend: oneQResult.backend,
    latestExecutionSource: meta.executionSource,
  }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useExperimentRunner() {
  const [state, setState] = useState<RunnerState>(() => ({
    status: "idle",
    error: null,
    oneQResult: null,
    comparisonResults: [],
    latestJobId: null,
    latestBackend: null,
    latestExecutionSource: null,
  }));

  const jobHistory = useJobHistory();
  // Keep refetch stable inside async closures that declare [] deps.
  const refetchHistoryRef = useRef(jobHistory.refetch);
  useEffect(() => {
    refetchHistoryRef.current = jobHistory.refetch;
  }, [jobHistory.refetch]);

  // One-time migration: remove the old localStorage-based run history key.
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_RUN_HISTORY_KEY);
    } catch {
      // noop — private mode or storage unavailable
    }
  }, []);

  // ── IBM 1Q ────────────────────────────────────────────────────────────────────────────────────────

  const runIbm1Q = useCallback(
    async (
      alpha: number,
      shots: number,
      backend: BackendId,
      comparisonAlphas: number[],
    ) => {
      const started = await startBackendExperiment1Q({ alpha, shots, backend });

      if (started.kind === "queued") {
        setState((prev) => ({
          ...prev,
          latestJobId: started.jobId,
          latestBackend: "ibm",
          latestExecutionSource: "api",
        }));

        void pollBackendExperiment1Q(started.jobId, { alpha, shots, backend })
          .then(async (oneQResult) => {
            const comparisonResults =
              comparisonAlphas.length > 0
                ? await runComparison(comparisonAlphas, shots, backend)
                : [];
            commit1QResult(
              oneQResult,
              comparisonResults,
              { alpha, shots, backend, executionSource: "api" },
              setState,
            );
            refetchHistoryRef.current();
          })
          .catch((error) => {
            const message =
              error instanceof Error ? error.message : "IBM job failed";
            // Polling timeout means the IBM job is still pending on the backend.
            // Don't surface an error — return to idle so the history panel
            // (which shows the real backend status) is the source of truth.
            if (message.includes("Timed out")) {
              refetchHistoryRef.current();
              setState((prev) => ({ ...prev, status: "idle", error: null }));
              return;
            }
            setState((prev) => ({
              ...prev,
              status: "error",
              error: message,
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
        { alpha, shots, backend, executionSource: "api" },
        setState,
      );
      refetchHistoryRef.current();
    },
    [],
  );

  // ── runExperiment ─────────────────────────────────────────────────────────────

  const runExperiment = useCallback(
    async (request: RunRequest) => {
      const { alpha, shots, backend, comparisonAlphas } = request;

      setState((prev) => ({
        ...prev,
        status: "running",
        error: null,
        latestExecutionSource: null,
      }));

      try {
        if (backend === "ibm_runtime") {
          await runIbm1Q(alpha, shots, backend, comparisonAlphas);
          return;
        }

        const oneQResult = await runExperiment1Q({ alpha, shots, backend });
        const executionSource: ExecutionSource = "api";

        const comparisonResults =
          comparisonAlphas.length > 0
            ? await runComparison(comparisonAlphas, shots, backend)
            : [];

        commit1QResult(
          oneQResult,
          comparisonResults,
          { alpha, shots, backend, executionSource },
          setState,
        );
        refetchHistoryRef.current();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Experiment run failed";
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
        }));
      }
    },
    [runIbm1Q],
  );

  // ── Remaining callbacks ───────────────────────────────────────────────────────

  const restoreResult = useCallback(async (item: JobHistoryItem) => {
    if (item.status !== "done") return;

    setState((prev) => ({ ...prev, status: "running", error: null }));

    try {
      const input = {
        alpha: item.alpha,
        shots: item.shots,
        backend: (item.requestedBackend as BackendId) ?? "aer",
      };

      const oneQResult = await pollBackendExperiment1Q(item.jobId, input);
      setState((prev) => ({
        ...prev,
        status: "complete",
        error: null,
        oneQResult,
        comparisonResults: [],
        latestJobId: item.jobId,
        latestBackend: item.resolvedBackend,
        latestExecutionSource: item.executionSource as ExecutionSource | null,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load result";
      setState((prev) => ({ ...prev, status: "error", error: message }));
    }
  }, []);

  return {
    ...state,
    isRunning: state.status === "running",
    runExperiment,
    restoreResult,
    // Job history sourced from backend SQLite via useJobHistory
    historyItems: jobHistory.items,
    historyLoading: jobHistory.loading,
    historyError: jobHistory.error,
    historyHasMore: jobHistory.hasMore,
    historyTotal: jobHistory.total,
    loadMoreHistory: jobHistory.loadMore,
    clearHistory: jobHistory.clearHistory,
    refetchHistory: jobHistory.refetch,
    syncJob: jobHistory.syncJob,
  };
}
