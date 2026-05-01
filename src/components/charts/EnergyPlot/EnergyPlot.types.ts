import type { ExperimentResult } from "../../types/experiment";

export interface EnergyPlotPoint {
  alpha: number;
  theoretical: number;
  alphaLabel: string;
  estimated?: number;
}

export interface EnergyPlotSharedProps {
  alpha: number;
  result: ExperimentResult | null;
}
