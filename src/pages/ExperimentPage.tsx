import { AlphaControl } from "../components/AlphaControl/AlphaControl";
import { ResultProvenance } from "../components/ResultProvenance";
import { EnergyPlot } from "../components/charts/EnergyPlot/EnergyPlot";
import { EnergyEstimationCard } from "../modules/oneQubit/components/EnergyEstimationCard/EnergyEstimationCard";
import { MeasurementPanel } from "../modules/oneQubit/components/MeasurementPanel/MeasurementPanel";
import { useAppState } from "../state/useAppState";

export function ExperimentPage() {
  const { dashboard, runner } = useAppState();
  const result = runner.oneQResult;
  const isLoading = runner.status === "running";

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="flex flex-col flex-1 gap-3">
        {/* α control */}
        <AlphaControl alpha={dashboard.alpha} setAlpha={dashboard.setAlpha} />
        {/* E vs α plot + provenance (absorbed from VisualizationPage) */}
        {result && (
          <ResultProvenance
            backend={result.backend}
            jobId={result.jobId}
            shotsExecuted={result.shotsExecuted}
          />
        )}
        {/* Energy estimation — prominent, directly under slider */}
        <EnergyEstimationCard
          analysis={result?.energy ?? null}
          loading={isLoading}
        />
        <EnergyPlot alpha={dashboard.alpha} result={result} />
      </div>
      {/* Measurement results — expectation values + shot distribution + verdict */}
      <MeasurementPanel
        alpha={dashboard.alpha}
        shots={dashboard.shots}
        result={result}
        status={runner.status}
        error={runner.error}
      />
    </div>
  );
}
