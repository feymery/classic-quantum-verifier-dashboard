import { EnergyPlot } from "../charts/EnergyPlot/EnergyPlot";
import { ShotHistogram } from "../charts/ShotHistogram/ShotHistogram";
import { ComparisonPlot } from "../charts/ComparisonPlot/ComparisonPlot";
import type { ExperimentResult } from "../../types/experiment";
import type { ExecutionSource } from "../../types/runner";
import { ResultProvenance } from "../ResultProvenance";

interface PlotPanelProps {
  alpha: number;
  shots: number;
  result: ExperimentResult | null;
  comparisonAlphas: number[];
  comparisonResults: ExperimentResult[];
  comparisonLoading: boolean;
  executionSource: ExecutionSource | null;
}

export function PlotPanel({
  alpha,
  shots,
  result,
  comparisonAlphas,
  comparisonResults,
  comparisonLoading,
  executionSource,
}: PlotPanelProps) {
  return (
    <div className="space-y-3">
      {result && (
        <ResultProvenance
          executionSource={executionSource}
          backend={result.backend}
          jobId={result.jobId}
          shotsExecuted={result.shotsExecuted}
        />
      )}

      <EnergyPlot
        alpha={alpha}
        result={result}
        comparisonAlphas={comparisonAlphas}
        comparisonResults={comparisonResults}
        comparisonLoading={comparisonLoading}
      />

      <ShotHistogram
        counts={result?.counts ?? null}
        shots={shots}
        alpha={alpha}
      />

      {comparisonAlphas.length > 0 && (
        <ComparisonPlot comparisonAlphas={comparisonAlphas} />
      )}
    </div>
  );
}
