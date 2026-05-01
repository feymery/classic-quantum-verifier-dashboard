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
import {
  CHART_COLORS,
  CHART_HEIGHT,
  axisProps,
  gridProps,
} from "../../chartTheme";
import type { EnergyPlotPoint } from "../EnergyPlot.types";
import { EnergyPlotTooltipContent } from "./EnergyPlotTooltip";
import { EstimatedDot } from "../../EstimatedDot";

interface EnergyPlotChartProps {
  alpha: number;
  chartData: EnergyPlotPoint[];
  hasResult: boolean;
  currentE: number;
}

export function EnergyPlotChart({
  alpha,
  chartData,
  hasResult,
  currentE,
}: EnergyPlotChartProps) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 4, left: -10 }}
      >
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey="alpha"
          {...axisProps}
          tickFormatter={(v: number) => formatAlpha(v)}
          ticks={KEY_ALPHAS.map((k) => k.value)}
          domain={[0, Math.PI / 2]}
          type="number"
          label={{
            value: "α (radians)",
            position: "insideBottom",
            offset: -2,
            style: {
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              fill: "#6b6780",
            },
          }}
        />
        <YAxis
          {...axisProps}
          domain={[0, 1.05]}
          tickFormatter={(v: number) => v.toFixed(1)}
          label={{
            value: "E",
            angle: -90,
            position: "insideLeft",
            offset: 14,
            style: {
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              fill: "#6b6780",
            },
          }}
        />

        <ReferenceLine
          y={THRESHOLD_LOW}
          stroke={CHART_COLORS.thresholdLow}
          strokeWidth={0.75}
          strokeDasharray="4 3"
          label={{
            value: `${THRESHOLD_LOW} reject`,
            position: "insideTopRight",
            style: {
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              fill: CHART_COLORS.thresholdLow,
            },
          }}
        />
        <ReferenceLine
          y={THRESHOLD_HIGH}
          stroke={CHART_COLORS.thresholdHigh}
          strokeWidth={0.75}
          strokeDasharray="4 3"
          label={{
            value: `${THRESHOLD_HIGH} accept`,
            position: "insideTopRight",
            style: {
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              fill: CHART_COLORS.thresholdHigh,
            },
          }}
        />
        <ReferenceLine
          x={alpha}
          stroke="rgba(167,139,250,0.4)"
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        <Line
          type="monotone"
          dataKey="theoretical"
          stroke={CHART_COLORS.theoretical}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: CHART_COLORS.theoretical, strokeWidth: 0 }}
          name="theoretical"
          isAnimationActive
          animationDuration={400}
        />

        {hasResult && (
          <Line
            type="monotone"
            dataKey="estimated"
            stroke={CHART_COLORS.estimated}
            strokeWidth={0}
            dot={<EstimatedDot />}
            activeDot={false}
            name="estimated"
            connectNulls={false}
            isAnimationActive
            animationDuration={600}
          />
        )}

        <ReferenceDot
          x={alpha}
          y={currentE}
          r={4}
          fill={CHART_COLORS.theoretical}
          stroke="#0f0e14"
          strokeWidth={1.5}
        />

        <Tooltip
          content={({ active, payload, label }) => (
            <EnergyPlotTooltipContent
              active={active}
              payload={payload}
              label={label}
            />
          )}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
