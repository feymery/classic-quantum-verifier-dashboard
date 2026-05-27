/**
 * BitFlipEnergyVsP.tsx  (v2)
 *
 * Three-curve ⟨E⟩ vs p chart using the corrected anticommutation physics.
 * New in v2:
 *   - ReferenceArea shades the acceptance region (E < 0.4)
 *   - Vertical p_crit markers at p ≈ 0.128 for clock and both curves
 *   - "Work flip: never rejects" annotation
 *   - Height increased to 220px for legibility
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
  ReferenceArea,
} from "recharts";
import {
  computeObservablesByTarget,
  computePCrit,
} from "../BitFlipTrap.physics";
import { SectionLabel } from "../../../shared/SectionLabel";
import {
  axisProps,
  gridProps,
  CHART_FONT,
  CHART_COLORS,
} from "../../../../charts/chartTheme";
import { THRESHOLD_LOW } from "../../../../../utils/constants";
import { ChartTooltip } from "../../../../charts/ChartTooltip";

const COLORS = {
  clock: "#a78bfa",
  work: "#f59e0b",
  both: "#f87171",
} as const;

const LABELS: Record<keyof typeof COLORS, string> = {
  clock: "Clock flip",
  work: "Work flip",
  both: "Both qubits",
};

const N_STEPS = 60;

interface Props {
  alpha: number;
  pClock: number;
  pWork: number;
}

export function BitFlipEnergyVsP({ alpha, pClock, pWork }: Props) {
  const pCritClock = computePCrit(alpha, "clock");
  const pCritWork = computePCrit(alpha, "work");
  const pCritBoth = computePCrit(alpha, "both");

  const data = useMemo(
    () =>
      Array.from({ length: N_STEPS + 1 }, (_, i) => {
        const pv = +(i * (0.5 / N_STEPS)).toFixed(4);
        return {
          p: pv,
          clock: +computeObservablesByTarget(
            alpha,
            pv,
            "clock",
          ).E_noisy.toFixed(5),
          work: +computeObservablesByTarget(alpha, pv, "work").E_noisy.toFixed(
            5,
          ),
          both: +computeObservablesByTarget(alpha, pv, "both").E_noisy.toFixed(
            5,
          ),
        };
      }),
    [alpha],
  );

  const pActive = pWork > 0 ? pWork : pClock;

  return (
    <div>
      <SectionLabel>⟨E⟩ vs bit-flip probability p</SectionLabel>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
        >
          {/* Acceptance region */}
          <ReferenceArea
            y1={0}
            y2={THRESHOLD_LOW}
            fill="rgba(52,211,153,0.06)"
            fillOpacity={1}
          />

          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="p"
            type="number"
            domain={[0, 0.5]}
            tickCount={6}
            tickFormatter={(v: number) => v.toFixed(2)}
            label={{
              value: "p",
              position: "insideBottomRight",
              offset: -4,
              fontSize: 9,
              fill: CHART_FONT.fill,
            }}
            {...axisProps}
          />
          <YAxis
            domain={[0, 4.0]}
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

          {/* Rejection threshold */}
          <ReferenceLine
            y={THRESHOLD_LOW}
            stroke={CHART_COLORS.thresholdLow}
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{
              value: "threshold 0.4",
              position: "insideTopLeft",
              fontSize: 8,
              fill: CHART_COLORS.thresholdLow,
            }}
          />

          {/* p_crit markers */}
          {pCritClock !== null && (
            <ReferenceLine
              x={pCritClock}
              stroke="#a78bfa"
              strokeDasharray="2 4"
              strokeWidth={1}
              strokeOpacity={0.7}
              label={{
                value: `p_c≈${pCritClock}`,
                position: "insideTopRight",
                fontSize: 8,
                fill: "#a78bfa",
              }}
            />
          )}
          {pCritWork !== null && (
            <ReferenceLine
              x={pCritWork}
              stroke="#f59e0b"
              strokeDasharray="2 4"
              strokeWidth={1}
              strokeOpacity={0.7}
              label={{
                value: `p_w≈${pCritWork}`,
                position: "insideTopLeft",
                fontSize: 8,
                fill: "#f59e0b",
              }}
            />
          )}
          {pCritBoth !== null &&
            pCritBoth !== pCritClock &&
            pCritBoth !== pCritWork && (
              <ReferenceLine
                x={pCritBoth}
                stroke="#f87171"
                strokeDasharray="2 4"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
            )}

          {/* Active p marker */}
          <ReferenceLine
            x={pActive}
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
              strokeWidth={key === "work" ? 1.5 : 2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
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
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: CHART_COLORS.thresholdLow, opacity: 0.8 }}
          />
          <span style={{ color: CHART_FONT.fill }}>Rejection threshold</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-2 rounded-sm"
            style={{
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          />
          <span style={{ color: CHART_FONT.fill }}>Accepted region</span>
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-subtle">
        Dashed vertical lines mark p_crit for each scenario. Both clock (violet)
        and work (amber) flips cross the rejection threshold, with different
        critical probabilities that depend on α via the Hamiltonian
        coefficients.
        {pCritWork !== null && pCritClock !== null && (
          <span>
            {" "}
            At this α: p_crit(clock)≈{pCritClock}, p_crit(work)≈{pCritWork}.
          </span>
        )}
      </p>
    </div>
  );
}
