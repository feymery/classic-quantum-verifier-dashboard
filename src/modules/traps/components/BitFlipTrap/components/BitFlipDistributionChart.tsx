/**
 * BitFlipDistributionChart.tsx
 *
 * Grouped bar chart comparing the Z-basis measurement probabilities for all
 * four basis states (|00⟩, |01⟩, |10⟩, |11⟩) across four scenarios:
 * ideal state, bit-flip on clock, on work, and on both qubits.
 *
 * The chart makes visually explicit how leakage into |01⟩ / |10⟩ grows as
 * p increases, while the honest distribution keeps all weight in |00⟩/|11⟩.
 */

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  computeIdealDistribution,
  computeNoisyDistribution,
} from "../BitFlipTrap.physics";
import { SectionLabel } from "../../../shared/SectionLabel";
import {
  axisProps,
  gridProps,
  CHART_FONT,
} from "../../../../../components/charts/chartTheme";
import { ChartTooltip } from "../../../../../components/charts/ChartTooltip";

const SERIES_COLORS = {
  ideal: "#34d399",
  clock: "#a78bfa",
  work: "#f59e0b",
  both: "#f87171",
} as const;

const SERIES_LABELS: Record<keyof typeof SERIES_COLORS, string> = {
  ideal: "Ideal",
  clock: "Clock flip",
  work: "Work flip",
  both: "Both",
};

interface Props {
  alpha: number;
  p: number;
}

export function BitFlipDistributionChart({ alpha, p }: Props) {
  const data = useMemo(() => {
    const ideal = computeIdealDistribution(alpha);
    const clock = computeNoisyDistribution(alpha, p, "clock");
    const work = computeNoisyDistribution(alpha, p, "work");
    const both = computeNoisyDistribution(alpha, p, "both");
    return (["00", "01", "10", "11"] as const).map((s) => ({
      state: `|${s}⟩`,
      ideal: +(ideal[s] * 100).toFixed(2),
      clock: +(clock[s] * 100).toFixed(2),
      work: +(work[s] * 100).toFixed(2),
      both: +(both[s] * 100).toFixed(2),
    }));
  }, [alpha, p]);

  return (
    <div>
      <SectionLabel>distribución de resultados por escenario (%)</SectionLabel>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart
          data={data}
          barCategoryGap="22%"
          barGap={1}
          margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
        >
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="state" {...axisProps} />
          <YAxis
            tickFormatter={(v: number) => `${v}`}
            domain={[0, 100]}
            tickCount={5}
            {...axisProps}
          />
          <Tooltip
            content={(props) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload}
                title={`Estado ${props.label}`}
                rows={
                  props.payload?.map((pt) => ({
                    label:
                      SERIES_LABELS[pt.dataKey as keyof typeof SERIES_LABELS] ??
                      String(pt.dataKey),
                    value: `${Number(pt.value).toFixed(1)} %`,
                    color:
                      SERIES_COLORS[pt.dataKey as keyof typeof SERIES_COLORS] ??
                      "#fff",
                  })) ?? []
                }
              />
            )}
          />
          {(Object.keys(SERIES_COLORS) as (keyof typeof SERIES_COLORS)[]).map(
            (key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={SERIES_COLORS[key]}
                name={SERIES_LABELS[key]}
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            ),
          )}
        </BarChart>
      </ResponsiveContainer>
      <div
        className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1"
        style={{ fontFamily: CHART_FONT.family, fontSize: 9 }}
      >
        {(Object.keys(SERIES_COLORS) as (keyof typeof SERIES_COLORS)[]).map(
          (key) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: SERIES_COLORS[key] }}
              />
              <span style={{ color: CHART_FONT.fill }}>
                {SERIES_LABELS[key]}
              </span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
