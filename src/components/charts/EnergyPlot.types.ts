import type { ExperimentResult } from "../../services/simulate1Q";

export interface EnergyPlotPoint {
  alpha: number;
  theoretical: number;
  alphaLabel: string;
  estimated?: number;
}

export interface EnergyPlotSharedProps {
  alpha: number;
  result: ExperimentResult | null;
  comparisonAlphas: number[];
  comparisonResults: ExperimentResult[];
  comparisonLoading: boolean;
}
