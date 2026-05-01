import { useCallback, useMemo, type ReactNode } from "react";
import { useDashboardState } from "../hooks/useDashboardState";
import { useExperimentRunner } from "../hooks/useExperimentRunner";
import { AppStateContext } from "./AppStateContextDef";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const dashboard = useDashboardState();
  const runner = useExperimentRunner();

  const backendStatus: "idle" | "running" | "error" =
    runner.status === "running"
      ? "running"
      : runner.status === "error"
        ? "error"
        : "idle";

  const runFor1Q = useCallback(() => {
    runner.runExperiment({
      alpha: dashboard.alpha,
      shots: dashboard.shots,
      backend: dashboard.selectedBackend,
      comparisonAlphas: dashboard.comparisonAlphas,
    });
  }, [dashboard, runner]);

  const value = useMemo(
    () => ({
      dashboard,
      runner,
      backendStatus,
      runFor1Q,
    }),
    [backendStatus, dashboard, runFor1Q, runner],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
