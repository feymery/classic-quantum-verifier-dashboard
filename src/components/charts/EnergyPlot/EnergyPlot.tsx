import { useMemo } from "react";
import { energyCurve } from "../../../physics/energy";
import { energy as calcEnergy } from "../../../utils/alphaUtils";
import { CHART_COLORS } from "../chartTheme";
import { ChartLegendItem } from "../ChartLegend";
import { Card } from "../../../ui/Card";
import type {
  EnergyPlotPoint,
  EnergyPlotSharedProps,
} from "./EnergyPlot.types";
import { EnergyPlotChart } from "./components/EnergyPlotChart";
import { EnergyPlotSummary } from "./components/EnergyPlotSummary";

// ── Static curve data (computed once) ────────────────────────────────────────

const CURVE_DATA: EnergyPlotPoint[] = energyCurve(200).map((pt) => ({
  alpha: pt.alpha,
  theoretical: pt.theoretical,
  alphaLabel: pt.alpha.toFixed(3),
}));

// ── Component ─────────────────────────────────────────────────────────────────

export function EnergyPlot({ alpha, result }: EnergyPlotSharedProps) {
  const chartData = useMemo(() => {
    if (!result) return CURVE_DATA;
    return CURVE_DATA.map((pt) => ({
      ...pt,
      estimated:
        Math.abs(pt.alpha - result.alpha) < 0.008
          ? result.energy.estimated
          : undefined,
    }));
  }, [result]);

  const currentE = calcEnergy(alpha);
  const estimatedE = result?.energy.estimated;

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
              Energy vs α
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ChartLegendItem
              type="line"
              color={CHART_COLORS.theoretical}
              label="E = sin²(α)"
            />
            {result && (
              <ChartLegendItem
                type="dot"
                color={CHART_COLORS.estimated}
                label="estimated"
              />
            )}
          </div>
        </div>

        <EnergyPlotChart
          alpha={alpha}
          chartData={chartData}
          hasResult={Boolean(result)}
          currentE={currentE}
        />

        <EnergyPlotSummary
          alpha={alpha}
          currentE={currentE}
          estimatedE={estimatedE}
        />
      </div>
    </Card>
  );
}
