import { createContext, useCallback, useMemo, type ReactNode } from "react";
import { useDashboardState } from "../hooks/useDashboardState";
import { useExperimentRunner } from "../hooks/useExperimentRunner";

type RunMode = "oneQ" | "twoQ" | "adversarial";

interface AppStateContextValue {
  dashboard: ReturnType<typeof useDashboardState>;
  runner: ReturnType<typeof useExperimentRunner>;
  backendStatus: "idle" | "running" | "error";
  runForMode: (mode: RunMode) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const dashboard = useDashboardState();
  const runner = useExperimentRunner();

  const backendStatus: "idle" | "running" | "error" =
    runner.status === "running"
      ? "running"
      : runner.status === "error"
        ? "error"
        : "idle";

  const runForMode = useCallback(
    (mode: RunMode) => {
      runner.runExperiment({
        mode,
        alpha: dashboard.alpha,
        shots: dashboard.shots,
        backend: dashboard.selectedBackend,
        comparisonAlphas: dashboard.comparisonAlphas,
      });
    },
    [dashboard, runner],
  );

  const value = useMemo(
    () => ({
      dashboard,
      runner,
      backendStatus,
      runForMode,
    }),
    [backendStatus, dashboard, runForMode, runner],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export { AppStateContext };
