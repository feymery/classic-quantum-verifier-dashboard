/**
 * BitFlipEnergyVsShots.tsx
 *
 * Shows how the sampled estimate of the Z₁Z₂ correlator converges toward its
 * theoretical value as the number of measurement shots increases.
 *
 * For each shots value on a logarithmic grid, N_SEEDS independent multinomial
 * samples are drawn (using the deterministic LCG from rng.ts). The chart
 * renders the empirical mean ± 1σ error band together with the exact
 * theoretical value, making it visually clear that:
 *   - statistical variance shrinks ∝ 1/√shots,
 *   - the systematic bias introduced by the bit-flip error (mean ≠ ideal)
 *     persists regardless of how many shots are taken.
 */

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { sampleCounts } from "../BitFlipTrap.physics";
import type { StateDistribution } from "../BitFlipTrap.types";
import { SectionLabel } from "../../../shared/SectionLabel";
import {
  axisProps,
  gridProps,
  CHART_FONT,
} from "../../../../../components/charts/chartTheme";
import { ChartTooltip } from "../../../../../components/charts/ChartTooltip";

const SHOTS_GRID = [
  1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 5000, 10000,
] as const;
const N_SEEDS = 15;

/** Z₁Z₂ = (n_00 + n_11 − n_01 − n_10) / shots — directly computable from Z-basis counts. */
function estimateZ1Z2(
  dist: StateDistribution,
  shots: number,
  seed: number,
): number {
  const c = sampleCounts(dist, shots, seed);
  return (
    ((c["00"] ?? 0) + (c["11"] ?? 0) - (c["01"] ?? 0) - (c["10"] ?? 0)) / shots
  );
}

interface Props {
  /** Noisy distribution for the currently selected target and p. */
  noisyDist: StateDistribution;
  /** Exact theoretical Z₁Z₂ value for the current configuration. */
  theoreticalZ1Z2: number;
}

export function BitFlipEnergyVsShots({ noisyDist, theoreticalZ1Z2 }: Props) {
  const data = useMemo(
    () =>
      SHOTS_GRID.map((shots) => {
        const estimates = Array.from({ length: N_SEEDS }, (_, i) =>
          estimateZ1Z2(noisyDist, shots, i * 7 + 13),
        );
        const mean = estimates.reduce((a, b) => a + b, 0) / N_SEEDS;
        const variance =
          estimates.reduce((a, b) => a + (b - mean) ** 2, 0) / N_SEEDS;
        const std = Math.sqrt(variance);
        return {
          shots,
          mean: +mean.toFixed(5),
          upper: +Math.min(1, mean + std).toFixed(5),
          lower: +Math.max(-1, mean - std).toFixed(5),
          theory: +theoreticalZ1Z2.toFixed(5),
        };
      }),
    [noisyDist, theoreticalZ1Z2],
  );

  return (
    <div>
      <SectionLabel>
        estimador ⟨Z₁Z₂⟩ vs shots — convergencia estadística (±1σ)
      </SectionLabel>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
        >
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="shots"
            type="number"
            scale="log"
            domain={[1, 10000]}
            ticks={[1, 10, 100, 1000, 10000]}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${v / 1000}k` : String(v)
            }
            {...axisProps}
          />
          <YAxis
            tickCount={5}
            tickFormatter={(v: number) => v.toFixed(2)}
            {...axisProps}
          />
          <Tooltip
            content={(props) => {
              const meanPt = props.payload?.find((pt) => pt.dataKey === "mean");
              return (
                <ChartTooltip
                  active={props.active}
                  payload={props.payload}
                  title={`shots = ${props.label}`}
                  rows={[
                    {
                      label: "Teórico",
                      value: theoreticalZ1Z2.toFixed(4),
                      color: "#34d399",
                    },
                    ...(meanPt
                      ? [
                          {
                            label: "Media muestral",
                            value: Number(meanPt.value).toFixed(4),
                            color: "#a78bfa",
                          },
                        ]
                      : []),
                  ]}
                />
              );
            }}
          />
          {/* Error band: upper area filled, lower area masks the bottom with bg color */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="rgba(167,139,250,0.12)"
            legendType="none"
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#181620"
            legendType="none"
            activeDot={false}
            isAnimationActive={false}
          />
          {/* Theoretical reference */}
          <Line
            type="monotone"
            dataKey="theory"
            name="Valor teórico"
            stroke="#34d399"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            isAnimationActive={false}
            legendType="none"
          />
          {/* Sampled mean */}
          <Line
            type="monotone"
            dataKey="mean"
            name="Media muestral"
            stroke="#a78bfa"
            strokeWidth={1.5}
            dot={{ r: 3, fill: "#a78bfa", stroke: "#181620", strokeWidth: 1 }}
            isAnimationActive={false}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div
        className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1"
        style={{ fontFamily: CHART_FONT.family, fontSize: 9 }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: "#34d399", opacity: 0.9 }}
          />
          <span style={{ color: CHART_FONT.fill }}>Valor teórico</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "#a78bfa" }}
          />
          <span style={{ color: CHART_FONT.fill }}>Media muestral</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-4 rounded-sm"
            style={{ background: "rgba(167,139,250,0.18)" }}
          />
          <span style={{ color: CHART_FONT.fill }}>
            ±1σ ({N_SEEDS} muestras)
          </span>
        </span>
      </div>
    </div>
  );
}
