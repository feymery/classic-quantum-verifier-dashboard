import { AlphaControl } from "../components/AlphaControl/AlphaControl";
import { EnergyPanel } from "../components/EnergyPanel";
import { MeasurementPanel } from "../modules/oneQubit/components/MeasurementPanel/MeasurementPanel";
import { useAppState } from "../state/useAppState";
import { formatEnergy } from "../utils/physics";

export function ExperimentPage() {
  const { dashboard, runner } = useAppState();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <AlphaControl alpha={dashboard.alpha} setAlpha={dashboard.setAlpha} />

        <EnergyPanel
          title="Instant Energy"
          description="Current protocol energy for the selected α value."
          energy={
            runner.oneQResult?.energy.estimated != null
              ? formatEnergy(runner.oneQResult.energy.estimated)
              : dashboard.formattedTheoreticalEnergy
          }
          energyTheoretical={
            runner.oneQResult != null
              ? dashboard.formattedTheoreticalEnergy
              : undefined
          }
          verdict={runner.oneQResult?.energy.decision ?? null}
          result={runner.oneQResult}
        />
      </div>

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
