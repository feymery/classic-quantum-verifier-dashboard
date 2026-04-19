export type AccentTone = "cyan" | "amber" | "purple" | "neutral";

export interface MeasurementRow {
  label: string;
  value: string;
  accent?: AccentTone;
}

import type { BackendId } from "../utils/constants";

export type BackendStatus = "idle" | "running" | "error";

export interface DashboardState {
  alpha: number;
  shots: number;
  selectedBackend: BackendId;
  ibmToken: string;
  ibmTokenSet: boolean;
  ibmInstance: string;
  ibmBackendName: string;
  noiseLambda: number;
  alphaFake: number;
  comparisonAlphas: number[];
  showToken: boolean;
}
