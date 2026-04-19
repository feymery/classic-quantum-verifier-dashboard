import { PlotPanel } from "../components/PlotPanel/PlotPanel";
import { AlphaSweepChart } from "../components/charts/AlphaSweepChart";
import { useAppState } from "../state/useAppState";

export function VisualizationPage() {
  const { dashboard, runner } = useAppState();

  return (
    <div className="space-y-3">
      <PlotPanel
        alpha={dashboard.alpha}
        shots={dashboard.shots}
        result={runner.oneQResult}
        comparisonAlphas={dashboard.comparisonAlphas}
        comparisonResults={runner.comparisonResults}
        comparisonLoading={runner.status === "running"}
        executionSource={runner.latestExecutionSource}
      />

      <AlphaSweepChart shots={dashboard.shots} nPoints={30} />
    </div>
  );
}
