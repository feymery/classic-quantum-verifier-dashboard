import { AlphaControl } from "../components/AlphaControl/AlphaControl";
import { EnergyPanel } from "../components/EnergyPanel";
import { MeasurementPanel } from "../modules/oneQubit/components/MeasurementPanel/MeasurementPanel";
import { useAppState } from "../state/useAppState";

export function ExperimentPage() {
  const { dashboard, runner } = useAppState();

  return (
    <div className="space-y-3">
      <AlphaControl
        alpha={dashboard.alpha}
        setAlpha={dashboard.setAlpha}
        comparisonAlphas={dashboard.comparisonAlphas}
        setComparisonAlphas={dashboard.setComparisonAlphas}
      />

      <EnergyPanel
        title="Instant Energy"
        description="Current protocol energy for the selected α value."
        energy={dashboard.formattedEnergy}
        energyError={
          runner.oneQResult?.energy.estimated != null
            ? undefined // σ_E comes from backend result if available
            : null
        }
        verdict={runner.oneQResult?.energy.decision ?? null}
      />

      <MeasurementPanel
        alpha={dashboard.alpha}
        shots={dashboard.shots}
        result={runner.oneQResult}
        status={runner.status}
        error={runner.error}
        executionSource={runner.latestExecutionSource}
      />
    </div>
  );
}
