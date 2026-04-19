import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { formatAlpha } from "../../../../utils/alphaUtils";
import {
  KEY_ALPHAS,
  THRESHOLD_HIGH,
  THRESHOLD_LOW,
} from "../../../../utils/constants";
import { CHART_COLORS, CHART_HEIGHT, axisProps, gridProps } from "../../chartTheme";
import { ChartTooltip } from "../../ChartTooltip";
import type { ComparisonSummaryRow } from "../ComparisonPlot.types";

interface ComparisonPlotChartProps {
  data: Array<{ alpha: number; theoretical: number }>;
  summaryRows: ComparisonSummaryRow[];
}

export function ComparisonPlotChart({
  data,
  summaryRows,
}: ComparisonPlotChartProps) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT - 40}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 4, left: -10 }}
      >
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey="alpha"
          {...axisProps}
          type="number"
          tickFormatter={(v: number) => formatAlpha(v)}
          ticks={KEY_ALPHAS.map((k) => k.value)}
          domain={[0, Math.PI / 2]}
        />
        <YAxis
          {...axisProps}
          domain={[0, 1.05]}
          tickFormatter={(v: number) => v.toFixed(1)}
        />

        <ReferenceLine
          y={THRESHOLD_LOW}
          stroke={CHART_COLORS.thresholdLow}
          strokeWidth={0.75}
          strokeDasharray="4 3"
        />
        <ReferenceLine
          y={THRESHOLD_HIGH}
          stroke={CHART_COLORS.thresholdHigh}
          strokeWidth={0.75}
          strokeDasharray="4 3"
        />

        <Line
          type="monotone"
          dataKey="theoretical"
          stroke={CHART_COLORS.secondaryLine}
          strokeWidth={1}
          dot={false}
          name="E = sin²(α)"
        />

        {summaryRows.map((row, i) => (
          <ReferenceDot
            key={`cmp-${i}`}
            x={row.alpha}
            y={row.energy}
            r={5}
            fill={row.color}
            stroke="#0f0e14"
            strokeWidth={1.5}
            label={{
              value: row.label,
              position: "top",
              style: {
                fontFamily: "'Courier New', monospace",
                fontSize: 9,
                fill: row.color,
              },
            }}
          />
        ))}

        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <ChartTooltip
                active={active}
                payload={payload}
                title={`α = ${formatAlpha(Number(label))} (${Number(label).toFixed(3)})`}
              />
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
