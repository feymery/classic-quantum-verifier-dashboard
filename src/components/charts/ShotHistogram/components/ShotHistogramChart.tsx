import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  HISTOGRAM_HEIGHT,
  CHART_COLORS,
  axisProps,
  gridProps,
} from "../../chartTheme";
import { ChartTooltip } from "../../ChartTooltip";
import type { HistogramDatum } from "../ShotHistogram.types";

interface ShotHistogramChartProps {
  data: HistogramDatum[];
  hasCounts: boolean;
  stateColors: Record<string, string>;
}

export function ShotHistogramChart({
  data,
  hasCounts,
  stateColors,
}: ShotHistogramChartProps) {
  if (!hasCounts) {
    return (
      <div
        className="flex items-center justify-center rounded border  text-[10px]"
        style={{
          height: HISTOGRAM_HEIGHT,
          borderColor: "#2d2b3a",
          color: "#6b6780",
        }}
      >
        run experiment to see distribution
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={HISTOGRAM_HEIGHT}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 4, left: -16 }}
        barSize={32}
      >
        <CartesianGrid {...gridProps} vertical={false} />
        <XAxis
          dataKey="state"
          {...axisProps}
          tickFormatter={(v: string) => `|${v}⟩`}
        />
        <YAxis
          {...axisProps}
          domain={[0, 1]}
          tickFormatter={(v: number) => v.toFixed(1)}
        />

        <Bar
          dataKey="observed"
          name="observed"
          radius={[3, 3, 0, 0]}
          isAnimationActive
          animationDuration={500}
        >
          {data.map((d) => (
            <Cell
              key={d.state}
              fill={
                d.expectedState
                  ? `${stateColors[d.state]}44`
                  : "rgba(248,113,113,0.2)"
              }
              stroke={d.expectedState ? stateColors[d.state] : "#f87171"}
              strokeWidth={d.expectedState ? 1 : 1.2}
            />
          ))}
        </Bar>

        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload as HistogramDatum;
            return (
              <ChartTooltip
                active={active}
                payload={payload}
                title={`|${d.state}⟩`}
                rows={[
                  {
                    label: "observed",
                    value: d.observed.toFixed(4),
                    color: stateColors[d.state],
                  },
                  {
                    label: "expected",
                    value: d.expected.toFixed(4),
                    color: CHART_COLORS.theoretical,
                  },
                  { label: "counts", value: String(d.count), color: "#9490a8" },
                  {
                    label: "Δ",
                    value: `${d.observed - d.expected >= 0 ? "+" : ""}${(d.observed - d.expected).toFixed(4)}`,
                    color:
                      Math.abs(d.observed - d.expected) < 0.03
                        ? "#34d399"
                        : "#f59e0b",
                  },
                  {
                    label: "class",
                    value: d.expectedState ? "expected" : "non-expected",
                    color: d.expectedState ? "#34d399" : "#f87171",
                  },
                ]}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
