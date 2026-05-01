import { EnergyPlot } from "../charts/EnergyPlot/EnergyPlot";
import { ShotHistogram } from "../charts/ShotHistogram/ShotHistogram";
import type { ExperimentResult } from "../../types/experiment";
import { ResultProvenance } from "../ResultProvenance";

interface PlotPanelProps {
  alpha: number;
  shots: number;
  result: ExperimentResult | null;
}

export function PlotPanel({ alpha, shots, result }: PlotPanelProps) {
  return (
    <div className="space-y-3">
      {result && (
        <ResultProvenance
          backend={result.backend}
          jobId={result.jobId}
          shotsExecuted={result.shotsExecuted}
        />
      )}

      <EnergyPlot alpha={alpha} result={result} />

      <ShotHistogram
        counts={result?.counts ?? null}
        shots={shots}
        alpha={alpha}
      />
    </div>
  );
}
