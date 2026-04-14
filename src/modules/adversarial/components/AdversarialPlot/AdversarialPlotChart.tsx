import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { THRESHOLD_HIGH } from "../../../../utils/constants";
import { formatAlpha } from "../../../../utils/alphaUtils";
import {
  axisProps,
  gridProps,
  CHART_COLORS,
} from "../../../../components/charts/chartTheme";
import { ChartTooltip } from "../../../../components/charts/ChartTooltip";

interface AdversarialPlotPoint {
  alpha: number;
  honest: number;
  fake: number;
  low: number;
  deltaAbs: number;
}

interface AdversarialPlotChartProps {
  data: AdversarialPlotPoint[];
  liveAlpha: number;
  liveHonest: number;
  liveFake: number;
}

export function AdversarialPlotChart({
  data,
  liveAlpha,
  liveHonest,
  liveFake,
}: AdversarialPlotChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart
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
          strokeWidth={0.8}
        />

        <Area
          dataKey="low"
          stackId="gap"
          stroke="none"
          fill="transparent"
          isAnimationActive={false}
        />
        <Area
          dataKey="deltaAbs"
          stackId="gap"
          stroke="none"
          fill="rgba(199,133,114,0.26)"
          isAnimationActive={false}
          name="|ΔE| region"
        />

        <Line
          type="monotone"
          dataKey="honest"
          stroke={CHART_COLORS.theoretical}
          strokeWidth={1.8}
          dot={false}
          isAnimationActive={false}
          name="E_honest"
        />
        <Line
          type="monotone"
          dataKey="fake"
          stroke="#c78572"
          strokeWidth={1.8}
          dot={false}
          isAnimationActive={false}
          name="E_fake"
        />
        <Line
          type="monotone"
          dataKey="deltaAbs"
          stroke="#c7a472"
          strokeDasharray="3 3"
          strokeWidth={1.2}
          dot={false}
          isAnimationActive={false}
          name="|ΔE|"
        />

        <ReferenceDot
          x={liveAlpha}
          y={liveHonest}
          r={4}
          fill={CHART_COLORS.theoretical}
          stroke="#0f0e14"
          strokeWidth={1}
        />
        <ReferenceDot
          x={liveAlpha}
          y={liveFake}
          r={4}
          fill="#c78572"
          stroke="#0f0e14"
          strokeWidth={1}
        />

        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;

            const alphaValue = Number(label);
            const point = payload[0]?.payload as
              | { honest: number; fake: number; deltaAbs: number }
              | undefined;

            if (!point) return null;

            return (
              <ChartTooltip
                active={active}
                payload={payload}
                title={`α = ${formatAlpha(alphaValue)} (${alphaValue.toFixed(3)})`}
                rows={[
                  {
                    label: "E_honest",
                    value: point.honest.toFixed(4),
                    color: CHART_COLORS.theoretical,
                  },
                  {
                    label: "E_fake",
                    value: point.fake.toFixed(4),
                    color: "#c78572",
                  },
                  {
                    label: "|ΔE|",
                    value: point.deltaAbs.toFixed(4),
                    color: "#c7a472",
                  },
                ]}
              />
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
