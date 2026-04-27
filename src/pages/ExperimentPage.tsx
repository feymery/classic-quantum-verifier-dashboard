import { AlphaControl } from "../components/AlphaControl/AlphaControl";
import { EnergyPanel } from "../components/EnergyPanel";
import { ExperimentControlBar } from "../components/ExperimentControlBar";
import { MeasurementPanel } from "../modules/oneQubit/components/MeasurementPanel/MeasurementPanel";
import { useAppState } from "../state/useAppState";

function sourceLabel(source: string | null): string {
  if (source === "api") return "api";
  if (source === "fallback-local") return "fallback-local";
  if (source === "local-mock") return "local-mock";
  if (source === "local-2q") return "local-2q";
  return "unknown";
}

export function ExperimentPage() {
  const { dashboard, runner, runForMode } = useAppState();

  return (
    <div className="space-y-3">
      <ExperimentControlBar
        onRun={() => runForMode("oneQ")}
        isRunning={runner.isRunning}
        statusText={
          runner.activeAsyncJob
            ? `IBM job ${runner.activeAsyncJob.status} · ${runner.activeAsyncJob.jobId}`
            : runner.isRunning
              ? "Running selected experiment..."
              : runner.latestJobId
                ? `${runner.latestJobId} · ${runner.latestBackend ?? dashboard.selectedBackend} · ${sourceLabel(runner.latestExecutionSource)}`
                : "One click = one experiment"
        }
      />

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
