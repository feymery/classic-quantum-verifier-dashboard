/**
 * BitFlipProbabilityVsP.tsx
 *
 * Line chart showing the probability of obtaining a "correct" measurement
 * outcome (|00⟩ or |11⟩, i.e. no leakage into error states) as a function of
 * the bit-flip probability p, for each affected target.
 *
 * Key insight: P_correct decays linearly for single-qubit flips ((1−p)) and
 * as (1−p)² + p² for independent two-qubit flips (symmetric around p=0.5).
 * A vertical marker shows the currently selected p value.
 */

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
import { computeNoisyDistribution } from "../BitFlipTrap.physics";
import { SectionLabel } from "../../../shared/SectionLabel";
import {
  axisProps,
  gridProps,
  CHART_FONT,
} from "../../../../../components/charts/chartTheme";
import { ChartTooltip } from "../../../../../components/charts/ChartTooltip";

const COLORS = {
  ideal: "#34d399",
  clock: "#a78bfa",
  work: "#f59e0b",
  both: "#f87171",
} as const;

const LABELS: Record<keyof typeof COLORS, string> = {
  ideal: "Ideal (p = 0)",
  clock: "Clock flip",
  work: "Work flip",
  both: "Both",
};

const N_STEPS = 50;

interface Props {
  alpha: number;
  p: number;
}

export function BitFlipProbabilityVsP({ alpha, p }: Props) {
  const data = useMemo(
    () =>
      Array.from({ length: N_STEPS + 1 }, (_, i) => {
        const pv = +(i * (0.5 / N_STEPS)).toFixed(3);
        const clock = computeNoisyDistribution(alpha, pv, "clock");
        const work = computeNoisyDistribution(alpha, pv, "work");
        const both = computeNoisyDistribution(alpha, pv, "both");
        return {
          p: pv,
          ideal: 1,
          clock: +(clock["00"] + clock["11"]),
          work: +(work["00"] + work["11"]),
          both: +(both["00"] + both["11"]),
        };
      }),
    [alpha],
  );

  return (
    <div>
      <SectionLabel>
        P(resultado correcto) vs probabilidad de error p
      </SectionLabel>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: -24, bottom: 4 }}
        >
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="p"
            type="number"
            domain={[0, 0.5]}
            tickCount={6}
            tickFormatter={(v: number) => v.toFixed(2)}
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
                title={`p = ${typeof props.label === "number" ? props.label.toFixed(3) : "—"}`}
                rows={
                  props.payload?.map((pt) => ({
                    label:
                      LABELS[pt.dataKey as keyof typeof LABELS] ??
                      String(pt.dataKey),
                    value: Number(pt.value).toFixed(4),
                    color: String(pt.color),
                  })) ?? []
                }
              />
            )}
          />
          <ReferenceLine
            x={p}
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
          {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={LABELS[key]}
              stroke={COLORS[key]}
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div
        className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1"
        style={{ fontFamily: CHART_FONT.family, fontSize: 9 }}
      >
        {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 rounded-full"
              style={{ background: COLORS[key] }}
            />
            <span style={{ color: CHART_FONT.fill }}>{LABELS[key]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
