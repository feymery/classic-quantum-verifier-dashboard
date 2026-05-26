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

const VERDICT_DOT_COLOR: Record<string, string> = {
  accept: CHART_COLORS.accept,
  reject: CHART_COLORS.reject,
  boundary: CHART_COLORS.thresholdHigh,
};

// Custom dot for sweep results — reads sweepDecision from the data point
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SweepEstDot(props: any) {
  const { cx, cy, payload } = props as {
    cx: number;
    cy: number;
    payload: EnergyPlotPoint;
  };
  if (!cx || !cy || payload.sweepEst === undefined) return null;
  const color =
    VERDICT_DOT_COLOR[payload.sweepDecision ?? ""] ?? CHART_COLORS.estimated;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#0f0e14"
      strokeWidth={1}
    />
  );
}

interface EnergyPlotChartProps {
  alpha: number;
  chartData: EnergyPlotPoint[];
  hasResult: boolean;
  hasSweep: boolean;
  currentE: number;
}

export function EnergyPlotChart({
  alpha,
  chartData,
  hasResult,
  hasSweep,
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
          stroke={CHART_COLORS.secondaryMuted}
          strokeWidth={0.75}
          strokeDasharray="4 3"
          label={{
            value: `${THRESHOLD_LOW}`,
            position: "insideTopRight",
            style: {
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              fill: CHART_COLORS.secondaryMuted,
            },
          }}
        />
        <ReferenceLine
          y={THRESHOLD_HIGH}
          stroke={CHART_COLORS.secondaryMuted}
          strokeWidth={0.75}
          strokeDasharray="4 3"
          label={{
            value: `${THRESHOLD_HIGH}`,
            position: "insideTopRight",
            style: {
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              fill: CHART_COLORS.secondaryMuted,
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

        {hasSweep && (
          <Line
            type="monotone"
            dataKey="sweepEst"
            strokeWidth={0}
            dot={<SweepEstDot />}
            activeDot={{ r: 7, strokeWidth: 1.5, stroke: "#0f0e14" }}
            name="sweep"
            connectNulls={false}
            isAnimationActive={false}
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
