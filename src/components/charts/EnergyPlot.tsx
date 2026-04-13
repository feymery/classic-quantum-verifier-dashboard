import { useMemo } from "react";
import { energyCurve } from "../../physics/energy";
import { energy as calcEnergy } from "../../utils/alphaUtils";
import { CHART_COLORS } from "./chartTheme";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import type {
  EnergyPlotPoint,
  EnergyPlotSharedProps,
} from "./EnergyPlot.types";
import { EnergyPlotChart } from "./EnergyPlotChart";
import { EnergyPlotSummary } from "./EnergyPlotSummary";

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
  comparisonAlphas,
  comparisonResults,
  comparisonLoading,
}: EnergyPlotSharedProps) {
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
  const comparisonByAlpha = new Map(
    comparisonResults.map((entry) => [entry.alpha, entry]),
  );
  const comparisonTheoretical = comparisonAlphas.map((ca) => calcEnergy(ca));
  const comparisonMeasured = comparisonAlphas.map(
    (ca) => comparisonByAlpha.get(ca)?.energy.estimated,
  );

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StepTag>step D</StepTag>
            <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
              Energy vs α
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Legend color={CHART_COLORS.theoretical} label="E = sin²(α)" />
            {result && (
              <Legend color={CHART_COLORS.estimated} label="estimated" dot />
            )}
            {comparisonAlphas.length > 0 && (
              <Legend
                color={CHART_COLORS.comparison[0]}
                label={`+${comparisonAlphas.length} compare`}
              />
            )}
            {comparisonAlphas.length > 0 && (
              <Legend
                color={CHART_COLORS.estimated}
                label={comparisonLoading ? "comparing..." : "measured points"}
                dot
              />
            )}
          </div>
        </div>

        <EnergyPlotChart
          alpha={alpha}
          chartData={chartData}
          hasResult={Boolean(result)}
          currentE={currentE}
          comparisonAlphas={comparisonAlphas}
          comparisonEnergies={comparisonTheoretical}
          measuredComparisonEnergies={comparisonMeasured}
        />

        <EnergyPlotSummary
          alpha={alpha}
          currentE={currentE}
          estimatedE={estimatedE}
          comparisonAlphas={comparisonAlphas}
          comparisonTheoretical={comparisonTheoretical}
          comparisonMeasured={comparisonMeasured}
          comparisonLoading={comparisonLoading}
        />
      </div>
    </Card>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Legend({
  color,
  label,
  dot,
}: {
  color: string;
  label: string;
  dot?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {dot ? (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{ width: 16, height: 1.5, background: color, flexShrink: 0 }}
        />
      )}
      <span className="font-mono text-[10px]" style={{ color: "#9490a8" }}>
        {label}
      </span>
    </div>
  );
}

function StepTag({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="quantum"
      className="rounded px-1.5 py-0.5 font-mono text-[10px]"
    >
      {children}
    </Badge>
  );
}
