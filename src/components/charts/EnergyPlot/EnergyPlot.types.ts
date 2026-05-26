import type { ExperimentResult } from "../../../types/experiment";

export interface EnergyPlotPoint {
  alpha: number;
  theoretical: number;
  alphaLabel: string;
  estimated?: number;
  /** Injected from sweep run */
  sweepEst?: number;
  sweepDecision?: string;
  sweepBackend?: string;
  /** Exact alpha of the sweep experiment (may differ slightly from curve alpha) */
  sweepAlpha?: number;
}

export interface EnergyPlotSharedProps {
  alpha: number;
  result: ExperimentResult | null;
  sweepResults?: ExperimentResult[];
}
