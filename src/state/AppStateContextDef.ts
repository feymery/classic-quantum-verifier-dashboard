import { createContext } from "react";
import type { RunMode } from "../types/runner";
import type { useDashboardState } from "../hooks/useDashboardState";
import type { useExperimentRunner } from "../hooks/useExperimentRunner";

interface AppStateContextValue {
  dashboard: ReturnType<typeof useDashboardState>;
  runner: ReturnType<typeof useExperimentRunner>;
  backendStatus: "idle" | "running" | "error";
  runForMode: (mode: RunMode) => void;
}

export const AppStateContext = createContext<AppStateContextValue | null>(null);
