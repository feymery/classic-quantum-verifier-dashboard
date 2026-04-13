import { PlotPanel } from "../components/PlotPanel/index";
import { useAppState } from "../state/useAppState";

export function VisualizationPage() {
  const { dashboard, runner } = useAppState();

  return (
    <PlotPanel
      alpha={dashboard.alpha}
      shots={dashboard.shots}
      result={runner.oneQResult}
      comparisonAlphas={dashboard.comparisonAlphas}
      comparisonResults={runner.comparisonResults}
      comparisonLoading={runner.status === "running"}
      executionSource={runner.latestExecutionSource}
    />
  );
}
