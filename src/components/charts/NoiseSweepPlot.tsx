import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

import { noiseSweep, type NoiseSweepPoint } from "../../physics/noise";
import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../../utils/constants";
import { CHART_COLORS, CHART_FONT, axisProps, gridProps } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

interface NoiseSweepPlotProps {
  alpha: number;
  lambda: number; // current λ from slider
  lamMax?: number; // default 0.5
}

const LAM_MAX = 0.5;

export function NoiseSweepPlot({
  alpha,
  lambda,
  lamMax = LAM_MAX,
}: NoiseSweepPlotProps) {
  const data: NoiseSweepPoint[] = useMemo(
    () => noiseSweep(alpha, lamMax, 120),
    [alpha, lamMax],
  );

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 12, left: -20, bottom: 4 }}
      >
        <CartesianGrid {...gridProps} />

        <XAxis
          dataKey="lambda"
          type="number"
          domain={[0, lamMax]}
          tickCount={6}
          tickFormatter={(v: number) => v.toFixed(2)}
          label={{
            value: "λ (noise)",
            position: "insideBottomRight",
            offset: -4,
            fontFamily: CHART_FONT.family,
            fontSize: 9,
            fill: CHART_FONT.fill,
          }}
          {...axisProps}
        />

        <YAxis
          domain={[0, 1.05]}
          tickCount={6}
          tickFormatter={(v: number) => v.toFixed(1)}
          {...axisProps}
        />

        <Tooltip
          content={(props) => (
            <ChartTooltip
              active={props.active}
              payload={props.payload}
              title={`λ = ${typeof props.label === 'number' ? props.label.toFixed(3) : '—'}`}
              rows={
                props.payload && props.payload.length > 0
                  ? [
                      {
                        label: "theoretical",
                        value: (
                          (props.payload.find(
                            (p) => p.dataKey === "theoretical",
                          )?.value as number) ?? 0
                        ).toFixed(4),
                        color: CHART_COLORS.theoretical,
                      },
                      {
                        label: "noisy",
                        value: (
                          (props.payload.find((p) => p.dataKey === "noisy")
                            ?.value as number) ?? 0
                        ).toFixed(4),
                        color: CHART_COLORS.estimated,
                      },
                    ]
                  : []
              }
            />
          )}
        />

        {/* Threshold lines */}
        <ReferenceLine
          y={THRESHOLD_HIGH}
          stroke={CHART_COLORS.thresholdHigh}
          strokeWidth={0.75}
          strokeDasharray="4 3"
          label={{
            value: "boundary 0.5",
            position: "insideTopRight",
            fontFamily: CHART_FONT.family,
            fontSize: 8,
            fill: CHART_COLORS.thresholdHigh,
          }}
        />
        <ReferenceLine
          y={THRESHOLD_LOW}
          stroke={CHART_COLORS.thresholdLow}
          strokeWidth={0.75}
          strokeDasharray="4 3"
          label={{
            value: "reject 0.4",
            position: "insideTopRight",
            fontFamily: CHART_FONT.family,
            fontSize: 8,
            fill: CHART_COLORS.thresholdLow,
          }}
        />

        {/* Current λ marker */}
        <ReferenceLine
          x={lambda}
          stroke={CHART_COLORS.curve}
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Theoretical (flat) curve */}
        <Line
          type="monotone"
          dataKey="theoretical"
          stroke={CHART_COLORS.theoretical}
          strokeWidth={1}
          strokeDasharray="5 3"
          dot={false}
          isAnimationActive={false}
          name="theoretical"
        />

        {/* Noisy energy curve */}
        <Line
          type="monotone"
          dataKey="noisy"
          stroke={CHART_COLORS.estimated}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
          name="noisy"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
