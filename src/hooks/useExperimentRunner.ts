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
import { isLocalBackend } from "../utils/constants";
import type { ExperimentResult } from "../types/experiment";
import type { ExperimentResult2Q } from "../types/experiment";
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

const RUN_HISTORY_STORAGE_KEY = "qvp.run-history.v1";
const MAX_RUN_HISTORY_ENTRIES = 12;

function appendHistoryEntry(
  history: RunHistoryEntry[],
  entry: RunHistoryEntry,
): RunHistoryEntry[] {
  return [entry, ...history].slice(0, MAX_RUN_HISTORY_ENTRIES);
}

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

interface RunRequest {
  activeTab: number;
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
  latestTab: number | null;
  history: RunHistoryEntry[];
  activeAsyncJob: ActiveAsyncJob | null;
}

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
    latestTab: null,
    history: loadRunHistory(),
    activeAsyncJob: null,
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

  const runExperiment = useCallback(async (request: RunRequest) => {
    const { activeTab, alpha, shots, backend, comparisonAlphas } = request;
    const mode: RunMode = activeTab === 1 ? "twoQ" : "oneQ";

    setState((prev) => ({
      ...prev,
      status: "running",
      error: null,
      latestExecutionSource: null,
      latestTab: activeTab,
    }));

    try {
      if (backend === "ibm_runtime") {
        const startedAt = new Date().toISOString();

        if (activeTab === 1) {
          const started = await startBackendExperiment2Q({
            alpha,
            shots,
            backend,
          });

          if (!started) {
            throw new Error("IBM 2Q submission unavailable");
          }

          if (started.kind === "queued") {
            setState((prev) => ({
              ...prev,
              latestJobId: started.jobId,
              latestBackend: "ibm",
              latestExecutionSource: "api",
              activeAsyncJob: {
                jobId: started.jobId,
                mode,
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
              (status) => {
                setState((prev) => {
                  if (prev.activeAsyncJob?.jobId !== started.jobId) return prev;
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
              },
            )
              .then((twoQResult) => {
                if (!twoQResult) {
                  throw new Error("IBM 2Q result could not be decoded");
                }

                const historyEntry: RunHistoryEntry = {
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  createdAt: new Date().toISOString(),
                  mode: "twoQ",
                  status: "complete",
                  alpha,
                  shots,
                  requestedBackend: backend,
                  resolvedBackend: twoQResult.backend,
                  executionSource: "api",
                  jobId: twoQResult.jobId,
                  energyEstimate: twoQResult.energy.estimated,
                  decision: twoQResult.energy.decision,
                  comparisonAlphas: [],
                  error: null,
                };

                setState((prev) => ({
                  ...prev,
                  status: "complete",
                  error: null,
                  twoQResult,
                  latestJobId: twoQResult.jobId,
                  latestBackend: twoQResult.backend,
                  latestExecutionSource: "api",
                  history: appendHistoryEntry(prev.history, historyEntry),
                  activeAsyncJob:
                    prev.activeAsyncJob?.jobId === started.jobId
                      ? {
                          ...prev.activeAsyncJob,
                          status: "done",
                          message: `Completed on ${twoQResult.backend}.`,
                        }
                      : prev.activeAsyncJob,
                }));
              })
              .catch((error) => {
                const message =
                  error instanceof Error ? error.message : "IBM job failed";

                setState((prev) => ({
                  ...prev,
                  status: "error",
                  error: message,
                  history: appendHistoryEntry(prev.history, {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    createdAt: new Date().toISOString(),
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
                  }),
                  activeAsyncJob:
                    prev.activeAsyncJob?.jobId === started.jobId
                      ? {
                          ...prev.activeAsyncJob,
                          status: "failed",
                          message,
                        }
                      : prev.activeAsyncJob,
                }));
              });

            return;
          }

          const twoQResult = started.result;
          const latestExecutionSource: ExecutionSource = "api";
          const historyEntry: RunHistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
            mode: "twoQ",
            status: "complete",
            alpha,
            shots,
            requestedBackend: backend,
            resolvedBackend: twoQResult.backend,
            executionSource: latestExecutionSource,
            jobId: twoQResult.jobId,
            energyEstimate: twoQResult.energy.estimated,
            decision: twoQResult.energy.decision,
            comparisonAlphas: [],
            error: null,
          };

          setState((prev) => ({
            ...prev,
            status: "complete",
            twoQResult,
            latestJobId: twoQResult.jobId,
            latestBackend: twoQResult.backend,
            latestExecutionSource,
            history: appendHistoryEntry(prev.history, historyEntry),
            activeAsyncJob: null,
          }));
          return;
        }

        const started = await startBackendExperiment1Q({
          alpha,
          shots,
          backend,
        });
        if (!started) {
          throw new Error("IBM 1Q submission unavailable");
        }

        if (started.kind === "queued") {
          setState((prev) => ({
            ...prev,
            latestJobId: started.jobId,
            latestBackend: "ibm",
            latestExecutionSource: "api",
            activeAsyncJob: {
              jobId: started.jobId,
              mode,
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
            (status) => {
              setState((prev) => {
                if (prev.activeAsyncJob?.jobId !== started.jobId) return prev;
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
            },
          )
            .then((oneQResult) => {
              let comparisonResults: ExperimentResult[] = [];

              if (comparisonAlphas.length > 0) {
                return runComparison(comparisonAlphas, shots, backend).then(
                  (loadedComparisonResults) => {
                    comparisonResults = loadedComparisonResults;

                    const historyEntry: RunHistoryEntry = {
                      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                      createdAt: new Date().toISOString(),
                      mode: "oneQ",
                      status: "complete",
                      alpha,
                      shots,
                      requestedBackend: backend,
                      resolvedBackend: oneQResult.backend,
                      executionSource: "api",
                      jobId: oneQResult.jobId,
                      energyEstimate: oneQResult.energy.estimated,
                      decision: oneQResult.energy.decision,
                      comparisonAlphas,
                      error: null,
                    };

                    setState((prev) => ({
                      ...prev,
                      status: "complete",
                      error: null,
                      oneQResult,
                      comparisonResults,
                      latestJobId: oneQResult.jobId,
                      latestBackend: oneQResult.backend,
                      latestExecutionSource: "api",
                      history: appendHistoryEntry(prev.history, historyEntry),
                      activeAsyncJob:
                        prev.activeAsyncJob?.jobId === started.jobId
                          ? {
                              ...prev.activeAsyncJob,
                              status: "done",
                              message: `Completed on ${oneQResult.backend}.`,
                            }
                          : prev.activeAsyncJob,
                    }));
                  },
                );
              }

              const historyEntry: RunHistoryEntry = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                createdAt: new Date().toISOString(),
                mode: "oneQ",
                status: "complete",
                alpha,
                shots,
                requestedBackend: backend,
                resolvedBackend: oneQResult.backend,
                executionSource: "api",
                jobId: oneQResult.jobId,
                energyEstimate: oneQResult.energy.estimated,
                decision: oneQResult.energy.decision,
                comparisonAlphas,
                error: null,
              };

              setState((prev) => ({
                ...prev,
                status: "complete",
                error: null,
                oneQResult,
                comparisonResults,
                latestJobId: oneQResult.jobId,
                latestBackend: oneQResult.backend,
                latestExecutionSource: "api",
                history: appendHistoryEntry(prev.history, historyEntry),
                activeAsyncJob:
                  prev.activeAsyncJob?.jobId === started.jobId
                    ? {
                        ...prev.activeAsyncJob,
                        status: "done",
                        message: `Completed on ${oneQResult.backend}.`,
                      }
                    : prev.activeAsyncJob,
              }));
            })
            .catch((error) => {
              const message =
                error instanceof Error ? error.message : "IBM job failed";

              setState((prev) => ({
                ...prev,
                status: "error",
                error: message,
                history: appendHistoryEntry(prev.history, {
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  createdAt: new Date().toISOString(),
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
                }),
                activeAsyncJob:
                  prev.activeAsyncJob?.jobId === started.jobId
                    ? {
                        ...prev.activeAsyncJob,
                        status: "failed",
                        message,
                      }
                    : prev.activeAsyncJob,
              }));
            });

          return;
        }

        const oneQResult = started.result;
        let comparisonResults: ExperimentResult[] = [];
        if (comparisonAlphas.length > 0) {
          comparisonResults = await runComparison(
            comparisonAlphas,
            shots,
            backend,
          );
        }

        const historyEntry: RunHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          mode: "oneQ",
          status: "complete",
          alpha,
          shots,
          requestedBackend: backend,
          resolvedBackend: oneQResult.backend,
          executionSource: "api",
          jobId: oneQResult.jobId,
          energyEstimate: oneQResult.energy.estimated,
          decision: oneQResult.energy.decision,
          comparisonAlphas,
          error: null,
        };

        setState((prev) => ({
          ...prev,
          status: "complete",
          oneQResult,
          comparisonResults,
          latestJobId: oneQResult.jobId,
          latestBackend: oneQResult.backend,
          latestExecutionSource: "api",
          history: appendHistoryEntry(prev.history, historyEntry),
          activeAsyncJob: null,
        }));
        return;
      }

      if (activeTab === 1) {
        let twoQResult: ExperimentResult2Q;
        let latestExecutionSource: ExecutionSource = "local-2q";

        if (isLocalBackend(backend)) {
          twoQResult = await runExperiment2Q({ alpha, shots, backend });
          latestExecutionSource = "local-2q";
        } else {
          try {
            const backendResult = await runBackendExperiment2Q({
              alpha,
              shots,
              backend,
            });
            if (backendResult) {
              twoQResult = backendResult;
              latestExecutionSource = "api";
            } else {
              twoQResult = await runExperiment2Q({ alpha, shots, backend });
              latestExecutionSource = "fallback-local";
            }
          } catch {
            twoQResult = await runExperiment2Q({ alpha, shots, backend });
            latestExecutionSource = "fallback-local";
          }
        }

        const historyEntry: RunHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          mode: "twoQ",
          status: "complete",
          alpha,
          shots,
          requestedBackend: backend,
          resolvedBackend: twoQResult.backend,
          executionSource: latestExecutionSource,
          jobId: twoQResult.jobId,
          energyEstimate: twoQResult.energy.estimated,
          decision: twoQResult.energy.decision,
          comparisonAlphas: [],
          error: null,
        };

        setState((prev) => ({
          ...prev,
          status: "complete",
          twoQResult,
          latestJobId: twoQResult.jobId,
          latestBackend: twoQResult.backend,
          latestExecutionSource,
          history: appendHistoryEntry(prev.history, historyEntry),
          activeAsyncJob: null,
        }));
        return;
      }

      // quantumApi routes internally: mock/fake_ibm → local, aer/ibm_runtime → backend+fallback
      const oneQResult = await runExperiment1Q({ alpha, shots, backend });

      // Infer actual execution source: mock jobIds always start with "mock-"
      const isMockBackend = isLocalBackend(backend);
      const usedLocalFallback =
        !isMockBackend && oneQResult.jobId.startsWith("mock-");
      const latestExecutionSource: ExecutionSource = isMockBackend
        ? "local-mock"
        : usedLocalFallback
          ? "fallback-local"
          : "api";

      let comparisonResults: ExperimentResult[] = [];
      if (comparisonAlphas.length > 0) {
        comparisonResults = await runComparison(
          comparisonAlphas,
          shots,
          backend,
        );
      }

      const historyEntry: RunHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        mode: "oneQ",
        status: "complete",
        alpha,
        shots,
        requestedBackend: backend,
        resolvedBackend: oneQResult.backend,
        executionSource: latestExecutionSource,
        jobId: oneQResult.jobId,
        energyEstimate: oneQResult.energy.estimated,
        decision: oneQResult.energy.decision,
        comparisonAlphas,
        error: null,
      };

      setState((prev) => ({
        ...prev,
        status: "complete",
        oneQResult,
        comparisonResults,
        latestJobId: oneQResult.jobId,
        latestBackend: oneQResult.backend,
        latestExecutionSource,
        history: appendHistoryEntry(prev.history, historyEntry),
        activeAsyncJob: null,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Experiment run failed";

      setState((prev) => ({
        ...prev,
        status: "error",
        error: message,
        history: appendHistoryEntry(prev.history, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          mode: activeTab === 1 ? "twoQ" : "oneQ",
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
        }),
        activeAsyncJob: null,
      }));
    }
  }, []);

  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
    }));
  }, []);

  const dismissActiveAsyncJob = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeAsyncJob: null,
    }));
  }, []);

  const retryActiveAsyncJob = useCallback(() => {
    setState((prev) => {
      if (!prev.activeAsyncJob || prev.activeAsyncJob.status === "running") {
        return prev;
      }
      return {
        ...prev,
        activeAsyncJob: null,
      };
    });

    const snapshot = state.activeAsyncJob;
    if (!snapshot || snapshot.status === "running") return;

    void runExperiment({
      activeTab: snapshot.mode === "twoQ" ? 1 : 0,
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
    clearHistory,
    dismissActiveAsyncJob,
    retryActiveAsyncJob,
  };
}
