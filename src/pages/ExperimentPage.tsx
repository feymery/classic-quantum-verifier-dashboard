import { AlphaControl } from "../components/AlphaControl/AlphaControl";
import { EnergyPlot } from "../components/charts/EnergyPlot/EnergyPlot";
import { MeasurementPanel } from "../modules/oneQubit/components/MeasurementPanel/MeasurementPanel";
import { useAppState } from "../state/useAppState";
import type { ExperimentResult } from "../types/experiment";

// ── Decision badge ────────────────────────────────────────────────────────────

const DECISION_STYLES: Record<string, string> = {
  accept: "text-success bg-success/10 border-success/30",
  reject: "text-danger bg-danger/10 border-danger/30",
  boundary: "text-warning bg-warning/10 border-warning/30",
};

function AlphaHeader({
  alpha,
  result,
}: {
  alpha: number;
  result: ExperimentResult | null;
}) {
  const decision = result?.energy.decision;
  return (
    <div className="flex items-center gap-2 mb-1.5 px-0.5">
      <span className="font-mono text-xs text-subtle">
        α = {alpha.toFixed(3)}
      </span>
      {decision && (
        <span
          className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${DECISION_STYLES[decision] ?? ""}`}
        >
          {decision}
        </span>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ExperimentPage() {
  const { dashboard, runner } = useAppState();
  const sweepResultsArray = Object.values(runner.sweepResults);
  const hasSweep = sweepResultsArray.length > 0;

  const measurementEntries: {
    alpha: number;
    result: ExperimentResult | null;
  }[] = hasSweep
    ? sweepResultsArray.map((r) => ({ alpha: r.alpha, result: r }))
    : [{ alpha: dashboard.alpha, result: runner.oneQResult }];

  return (
    <div className="flex flex-col gap-3">
      {/* α control */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="min-w-0 md:w-1/2 lg:w-1/3">
          <AlphaControl
            alpha={dashboard.alpha}
            setAlpha={dashboard.setAlpha}
            selectedAlphas={dashboard.selectedAlphas}
            toggleAlpha={dashboard.toggleAlpha}
          />
        </div>

        <div className="min-w-0 md:w-1/2 lg:w-2/3">
          <EnergyPlot
            alpha={dashboard.alpha}
            result={runner.oneQResult}
            sweepResults={sweepResultsArray}
          />
        </div>
      </div>

      {/* Measurement results — one card per α */}
      <div className="flex flex-col gap-3">
        {measurementEntries.map(({ alpha, result }) => (
          <div key={alpha.toFixed(4)}>
            {hasSweep && <AlphaHeader alpha={alpha} result={result} />}
            <MeasurementPanel
              alpha={alpha}
              shots={result?.shotsExecuted ?? dashboard.shots}
              result={result}
              status={runner.status}
              error={runner.error}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
