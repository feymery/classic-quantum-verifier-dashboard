import { useMemo } from "react";

import { energyCurve } from "../../../physics/energy";
import { energy as calcEnergy, formatAlpha } from "../../../utils/alphaUtils";
import { COMPARISON_COLORS } from "../../../utils/constants";
import { Badge } from "../../../ui/Badge";
import { Card } from "../../../ui/Card";
import { ComparisonPlotChart } from "./components/ComparisonPlotChart";
import { ComparisonPlotTable } from "./components/ComparisonPlotTable";
import type { ComparisonSummaryRow } from "./ComparisonPlot.types";

interface ComparisonPlotProps {
  comparisonAlphas: number[];
  /** Optional: estimated energies from run results, keyed by alpha.toFixed(4) */
  estimates?: Record<string, number>;
}

const CURVE_DATA = energyCurve(200);

export function ComparisonPlot({
  comparisonAlphas,
  estimates = {},
}: ComparisonPlotProps) {
  const summaryRows = useMemo(
    () =>
      comparisonAlphas.map((ca, i) => ({
        alpha: ca,
        energy: calcEnergy(ca),
        estimated: estimates[ca.toFixed(4)],
        color: COMPARISON_COLORS[i % COMPARISON_COLORS.length],
        label: formatAlpha(ca),
      })) as ComparisonSummaryRow[],
    [comparisonAlphas, estimates],
  );

  if (comparisonAlphas.length === 0) {
    return (
      <Card
        className="flex items-center justify-center rounded-lg  text-[10px]"
        padded="md"
        style={{
          height: 80,
          background: "#1e1c26",
          borderColor: "#2d2b3a",
          color: "#6b6780",
        }}
      >
        add α values to comparison mode to see them here
      </Card>
    );
  }

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <StepTag>step D</StepTag>
          <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
            Comparison
          </span>
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            {comparisonAlphas.length} α values
          </span>
        </div>

        <ComparisonPlotChart data={CURVE_DATA} summaryRows={summaryRows} />
        <ComparisonPlotTable summaryRows={summaryRows} />
      </div>
    </Card>
  );
}

function StepTag({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="quantum" className="rounded px-1.5 py-0.5  text-[10px]">
      {children}
    </Badge>
  );
}
