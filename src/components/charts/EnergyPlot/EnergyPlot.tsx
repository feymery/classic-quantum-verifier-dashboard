import { useMemo } from "react";
import { energyCurve } from "../../../physics/energy";
import { energy as calcEnergy } from "../../../utils/alphaUtils";
import { CHART_COLORS } from "../chartTheme";
import { ChartLegendItem } from "../ChartLegend";
import { Card } from "../../../ui/Card";
import type { ExperimentResult } from "../../../types/experiment";
import type {
  EnergyPlotPoint,
  EnergyPlotSharedProps,
} from "./EnergyPlot.types";
import { EnergyPlotChart } from "./components/EnergyPlotChart";

// ── Static curve data (computed once) ────────────────────────────────────────

const CURVE_DATA: EnergyPlotPoint[] = energyCurve(200).map((pt) => ({
  alpha: pt.alpha,
  theoretical: pt.theoretical,
  alphaLabel: pt.alpha.toFixed(3),
}));

// ── Component ─────────────────────────────────────────────────────────────────

export function EnergyPlot({
  alpha,
  result,
  sweepResults,
}: EnergyPlotSharedProps) {
  const chartData = useMemo(() => {
    // Build a map from the closest curve-point to each sweep result
    if (sweepResults && sweepResults.length > 0) {
      const closestFor = new Map<EnergyPlotPoint, ExperimentResult>();
      for (const r of sweepResults) {
        const closest = CURVE_DATA.reduce((best, pt) =>
          Math.abs(pt.alpha - r.alpha) < Math.abs(best.alpha - r.alpha)
            ? pt
            : best,
        );
        // Last sweep result wins if two map to the same point (shouldn't happen with 5 distinct alphas)
        closestFor.set(closest, r);
      }
      return CURVE_DATA.map((pt) => {
        const r = closestFor.get(pt);
        if (r) {
          return {
            ...pt,
            sweepEst: r.energy.estimated,
            sweepDecision: r.energy.decision,
            sweepBackend: r.backend,
            sweepAlpha: r.alpha,
          };
        }
        return pt;
      });
    }

    // Single result (no sweep) — backwards compat
    if (!result) return CURVE_DATA;
    const closest = CURVE_DATA.reduce((best, pt) =>
      Math.abs(pt.alpha - result.alpha) < Math.abs(best.alpha - result.alpha)
        ? pt
        : best,
    );
    return CURVE_DATA.map((pt) => ({
      ...pt,
      estimated: pt === closest ? result.energy.estimated : undefined,
    }));
  }, [result, sweepResults]);

  const currentE = calcEnergy(alpha);
  // When sweep results are present, don't show the single estimated dot
  const hasSweep = Boolean(sweepResults && sweepResults.length > 0);

  return (
    <Card className="h-full rounded-lg" padded="md">
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
            {result && !hasSweep && (
              <ChartLegendItem
                type="dot"
                color={CHART_COLORS.estimated}
                label="estimated"
              />
            )}
            {hasSweep && (
              <>
                <ChartLegendItem
                  type="dot"
                  color={CHART_COLORS.accept}
                  label="accept"
                />
                <ChartLegendItem
                  type="dot"
                  color={CHART_COLORS.reject}
                  label="reject"
                />
              </>
            )}
          </div>
        </div>

        <EnergyPlotChart
          alpha={alpha}
          chartData={chartData}
          hasResult={Boolean(result) && !hasSweep}
          hasSweep={hasSweep}
          currentE={currentE}
        />
      </div>
    </Card>
  );
}
