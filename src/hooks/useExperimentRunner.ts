import { useCallback, useEffect, useRef, useState } from "react";
import { runExperiment as runExperiment1Q } from "../modules/oneQubit/services/quantumApi";
import {
  startBackendExperiment1Q,
  pollBackendExperiment1Q,
} from "../modules/oneQubit/services/backendExperiment1Q";
import type { BackendId } from "../utils/constants";
import type { ExperimentResult } from "../types/experiment";
import type {
  RunnerStatus,
  ExecutionSource,
  JobHistoryItem,
} from "../types/runner";
import { useJobHistory } from "./useJobHistory";
import { useToast } from "../ui/Toast";

export type { RunnerStatus, ExecutionSource };

// ── Constants ─────────────────────────────────────────────────────────────────

/** Leftover key from the old localStorage-based history. Cleared on first load. */
const LEGACY_RUN_HISTORY_KEY = "qvp.run-history.v1";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RunRequest {
  alpha: number;
  shots: number;
  backend: BackendId;
}

interface RunnerState {
  status: RunnerStatus;
  error: string | null;
  oneQResult: ExperimentResult | null;
  sweepResults: Record<string, ExperimentResult>;
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
  meta: Commit1QMeta,
  setState: SetState,
) {
  setState((prev) => ({
    ...prev,
    status: "complete",
    error: null,
    oneQResult,
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
    sweepResults: {},
    latestBackend: null,
    latestExecutionSource: null,
  }));

  const jobHistory = useJobHistory();
  // Keep refetch stable inside async closures that declare [] deps.
  const refetchHistoryRef = useRef(jobHistory.refetch);
  useEffect(() => {
    refetchHistoryRef.current = jobHistory.refetch;
  }, [jobHistory.refetch]);

  const { toast } = useToast();
  // Keep toast stable inside async closures that declare [] deps.
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

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
    async (alpha: number, shots: number, backend: BackendId) => {
      const started = await startBackendExperiment1Q({ alpha, shots, backend });

      if (started.kind === "queued") {
        setState((prev) => ({
          ...prev,
          latestBackend: "ibm",
          latestExecutionSource: "api",
        }));

        void pollBackendExperiment1Q(started.jobId, { alpha, shots, backend })
          .then(async (oneQResult) => {
            commit1QResult(
              oneQResult,
              { alpha, shots, backend, executionSource: "api" },
              setState,
            );
            refetchHistoryRef.current();
            toastRef.current("Experiment completed successfully", "success");
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
              toastRef.current(
                "IBM job is still queued – check the History panel for updates",
                "warning",
              );
              return;
            }
            setState((prev) => ({
              ...prev,
              status: "error",
              error: message,
            }));
            toastRef.current(message, "error");
          });
        return;
      }

      commit1QResult(
        started.result,
        { alpha, shots, backend, executionSource: "api" },
        setState,
      );
      refetchHistoryRef.current();
      toastRef.current("Experiment completed successfully", "success");
    },
    [],
  );

  // ── runExperiment ─────────────────────────────────────────────────────────────

  const runExperiment = useCallback(
    async (request: RunRequest) => {
      const { alpha, shots, backend } = request;

      setState((prev) => ({
        ...prev,
        status: "running",
        error: null,
        oneQResult: null,
        sweepResults: {},
        latestExecutionSource: null,
      }));

      try {
        if (backend === "ibm_runtime") {
          await runIbm1Q(alpha, shots, backend);
          return;
        }

        const oneQResult = await runExperiment1Q({ alpha, shots, backend });
        const executionSource: ExecutionSource = "api";

        commit1QResult(
          oneQResult,
          { alpha, shots, backend, executionSource },
          setState,
        );
        refetchHistoryRef.current();
        toastRef.current("Experiment completed successfully", "success");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Experiment run failed";
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
        }));
        toastRef.current(message, "error");
      }
    },
    [runIbm1Q],
  );

  // ── runMultiAlpha ─────────────────────────────────────────────────────────────

  const runMultiAlpha = useCallback(
    async (alphas: number[], shots: number, backend: BackendId) => {
      setState((prev) => ({
        ...prev,
        status: "running",
        error: null,
        oneQResult: null,
        sweepResults: {},
        latestExecutionSource: null,
      }));

      const sweepId = crypto.randomUUID();
      let completed = 0;

      for (const alpha of alphas) {
        try {
          const started = await startBackendExperiment1Q({
            alpha,
            shots,
            backend,
            sweepId,
          });
          const result =
            started.kind === "queued"
              ? await pollBackendExperiment1Q(started.jobId, {
                  alpha,
                  shots,
                  backend,
                })
              : started.result;

          setState((prev) => ({
            ...prev,
            oneQResult: result,
            latestBackend: result.backend,
            latestExecutionSource: "api",
            sweepResults: {
              ...prev.sweepResults,
              [alpha.toFixed(4)]: result,
            },
          }));

          completed++;
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : `α=${alpha.toFixed(3)} failed`;
          toastRef.current(msg, "error");
          // continue with remaining alphas
        }
      }

      setState((prev) => ({
        ...prev,
        status: completed > 0 ? "complete" : "error",
      }));

      if (completed > 0) {
        refetchHistoryRef.current();
        toastRef.current(
          `Sweep complete — ${completed}/${alphas.length} α values succeeded`,
          "success",
        );
      }
    },
    [],
  );

  // ── restoreSweep ──────────────────────────────────────────────────────────────

  const restoreSweep = useCallback(async (items: JobHistoryItem[]) => {
    const doneItems = items.filter((item) => item.status === "done");
    if (doneItems.length === 0) return;

    setState((prev) => ({
      ...prev,
      status: "running",
      error: null,
      oneQResult: null,
      sweepResults: {},
    }));

    const restored: Record<string, ExperimentResult> = {};

    for (const item of doneItems) {
      try {
        const input = {
          alpha: item.alpha,
          shots: item.shots,
          backend: (item.requestedBackend as BackendId) ?? "aer",
        };
        const result = await pollBackendExperiment1Q(item.jobId, input);
        restored[item.alpha.toFixed(4)] = result;
      } catch {
        // skip — failed fetches are silent, final toast shows count
      }
    }

    const loadedCount = Object.keys(restored).length;
    setState((prev) => ({
      ...prev,
      status: loadedCount > 0 ? "complete" : "error",
      sweepResults: restored,
    }));

    if (loadedCount > 0) {
      toastRef.current(
        `Sweep restored — ${loadedCount}/${doneItems.length} results loaded`,
        "success",
      );
    } else {
      toastRef.current("Failed to restore sweep results", "error");
    }
  }, []);

  // ── Remaining callbacks ───────────────────────────────────────────────────────

  const restoreResult = useCallback(async (item: JobHistoryItem) => {
    if (item.status !== "done") return;

    setState((prev) => ({
      ...prev,
      status: "running",
      error: null,
      oneQResult: null,
      sweepResults: {},
    }));

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
        latestBackend: item.resolvedBackend,
        latestExecutionSource: item.executionSource as ExecutionSource | null,
      }));
      toastRef.current("Result loaded from history", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load result";
      setState((prev) => ({ ...prev, status: "error", error: message }));
      toastRef.current(message, "error");
    }
  }, []);

  return {
    ...state,
    isRunning: state.status === "running",
    runExperiment,
    runMultiAlpha,
    restoreResult,
    restoreSweep,
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
