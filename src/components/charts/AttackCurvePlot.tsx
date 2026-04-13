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
  ReferenceDot,
} from "recharts";
import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../../utils/constants";
import { energy, formatAlpha } from "../../utils/alphaUtils";
import { CHART_COLORS, axisProps, gridProps } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

interface AttackCurvePlotProps {
  alphaReal: number;
  alphaFake: number;
  title: string;
  desc: string;
}

export function AttackCurvePlot({
  alphaReal,
  alphaFake,
  title,
  desc,
}: AttackCurvePlotProps) {
  const data = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => {
        const alpha = (i / 139) * (Math.PI / 2);
        return {
          alpha,
          energy: energy(alpha),
        };
      }),
    [],
  );

  return (
    <div
      className="rounded-lg border p-3 space-y-2"
      style={{ borderColor: "#2d2b3a", background: "#181620" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px]" style={{ color: "#ddd9ee" }}>
            {title}
          </p>
          <p className="font-mono text-[9px]" style={{ color: "#6b6780" }}>
            {desc}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 4, left: -18 }}
        >
          <CartesianGrid {...gridProps} />

          <XAxis
            dataKey="alpha"
            type="number"
            domain={[0, Math.PI / 2]}
            tickFormatter={(v: number) => formatAlpha(v)}
            ticks={[0, Math.PI / 4, Math.PI / 2]}
            {...axisProps}
          />

          <YAxis
            domain={[0, 1.05]}
            tickFormatter={(v: number) => v.toFixed(1)}
            {...axisProps}
          />

          <ReferenceLine
            y={THRESHOLD_HIGH}
            stroke={CHART_COLORS.thresholdHigh}
            strokeDasharray="4 3"
            strokeWidth={0.75}
          />
          <ReferenceLine
            y={THRESHOLD_LOW}
            stroke={CHART_COLORS.thresholdLow}
            strokeDasharray="4 3"
            strokeWidth={0.75}
          />

          <ReferenceLine
            x={alphaReal}
            stroke={CHART_COLORS.adversarialClaim}
            strokeDasharray="3 3"
            strokeWidth={1}
          />
          <ReferenceLine
            x={alphaFake}
            stroke={CHART_COLORS.adversarialActual}
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          <Line
            type="monotone"
            dataKey="energy"
            stroke={CHART_COLORS.theoretical}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            name="E(alpha)"
          />

          <ReferenceDot
            x={alphaReal}
            y={energy(alphaReal)}
            r={4}
            fill={CHART_COLORS.adversarialClaim}
            stroke="#0f0e14"
            strokeWidth={1}
          />
          <ReferenceDot
            x={alphaFake}
            y={energy(alphaFake)}
            r={4}
            fill={CHART_COLORS.adversarialActual}
            stroke="#0f0e14"
            strokeWidth={1}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const alpha = Number(label);
              return (
                <ChartTooltip
                  active={active}
                  payload={payload}
                  title={`α = ${formatAlpha(alpha)} (${alpha.toFixed(3)})`}
                  rows={[
                    {
                      label: "E(α)",
                      value: energy(alpha).toFixed(4),
                      color: CHART_COLORS.theoretical,
                    },
                  ]}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div
        className="flex items-center gap-4 font-mono text-[9px]"
        style={{ color: "#6b6780" }}
      >
        <span style={{ color: CHART_COLORS.adversarialClaim }}>
          claimed α_real
        </span>
        <span style={{ color: CHART_COLORS.adversarialActual }}>
          actual α_fake
        </span>
        <span>thresholds: 0.4 / 0.5</span>
      </div>
    </div>
  );
}
