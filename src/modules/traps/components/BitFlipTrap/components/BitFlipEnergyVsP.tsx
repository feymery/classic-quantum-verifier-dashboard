/**
 * BitFlipEnergyVsP.tsx
 *
 * Line chart showing the Hamiltonian energy ⟨E⟩ as a function of the bit-flip
 * probability p for each affected target.
 *
 * The horizontal dashed line marks the verifier's rejection threshold. When
 * any curve crosses it, the prover would be rejected. The vertical marker
 * tracks the currently selected p value so users can correlate this chart
 * with the rest of the trap panel.
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
import { computeObservables } from "../BitFlipTrap.physics";
import { SectionLabel } from "../../../shared/SectionLabel";
import {
  axisProps,
  gridProps,
  CHART_FONT,
  CHART_COLORS,
} from "../../../../../components/charts/chartTheme";
import { THRESHOLD_LOW } from "../../../../../utils/constants";
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

export function BitFlipEnergyVsP({ alpha, p }: Props) {
  const eIdeal = useMemo(() => Math.sin(alpha) ** 2, [alpha]);

  const data = useMemo(
    () =>
      Array.from({ length: N_STEPS + 1 }, (_, i) => {
        const pv = +(i * (0.5 / N_STEPS)).toFixed(3);
        return {
          p: pv,
          ideal: +eIdeal.toFixed(5),
          clock: +computeObservables(alpha, pv, "clock").E_noisy.toFixed(5),
          work: +computeObservables(alpha, pv, "work").E_noisy.toFixed(5),
          both: +computeObservables(alpha, pv, "both").E_noisy.toFixed(5),
        };
      }),
    [alpha, eIdeal],
  );

  return (
    <div>
      <SectionLabel>
        energía esperada ⟨E⟩ vs probabilidad de error p
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
            tickCount={6}
            tickFormatter={(v: number) => v.toFixed(2)}
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
            y={THRESHOLD_LOW}
            stroke={CHART_COLORS.thresholdLow}
            strokeDasharray="4 3"
            strokeWidth={0.75}
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
              className="inline-block h-0.5 w-4"
              style={{ background: COLORS[key] }}
            />
            <span style={{ color: CHART_FONT.fill }}>{LABELS[key]}</span>
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: CHART_COLORS.thresholdLow, opacity: 0.8 }}
          />
          <span style={{ color: CHART_FONT.fill }}>Umbral rechazo</span>
        </span>
      </div>
    </div>
  );
}
