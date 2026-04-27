/**
 * ExpectationSweepChart.tsx
 * Reproduces Figure 2(a) of Stricker et al.:
 *   Expectation values ⟨O⟩ vs α for all 6 operators.
 *
 * Each operator is rendered as:
 *   • Dashed line  — theoretical value ⟨O⟩_theory for the honest clock state
 *   • Coloured dots — measured ⟨O⟩_est values from the simulation
 *
 * Theoretical values (|η⟩ = (1/√2)(|00⟩ + cos α|10⟩ + sin α|11⟩)):
 *   ⟨Z₁⟩   = 0
 *   ⟨Z₂⟩   = cos²(α)
 *   ⟨Z₁Z₂⟩ = sin²(α)
 *   ⟨Z₁X₂⟩ = −sin(α)cos(α)
 *   ⟨X₁Z₂⟩ = cos(α)
 *   ⟨X₁X₂⟩ = sin(α)
 */

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { CHART_HEIGHT, axisProps, gridProps } from "./chartTheme";
import type {
  AlphaSweepPoint,
  AlphaSweepObservables,
} from "../../services/sweepApi";
import { formatAlpha } from "../../utils/alphaUtils";

// ── Operator config ───────────────────────────────────────────────────────────

type OpKey = keyof AlphaSweepObservables;

const OPS: { key: OpKey; label: string; color: string }[] = [
  { key: "Z1Z2", label: "Z₁Z₂", color: "#3b82f6" }, // blue
  { key: "Z1", label: "Z₁", color: "#f97316" }, // orange
  { key: "Z2", label: "Z₂", color: "#22c55e" }, // green
  { key: "Z1X2", label: "Z₁X₂", color: "#f43f5e" }, // rose
  { key: "X1Z2", label: "X₁Z₂", color: "#a78bfa" }, // violet
  { key: "X1X2", label: "X₁X₂", color: "#facc15" }, // yellow
];

// ── Chart data shape ──────────────────────────────────────────────────────────

interface ExpPoint {
  alpha: number;
  // measured
  Z1: number;
  Z2: number;
  Z1Z2: number;
  Z1X2: number;
  X1Z2: number;
  X1X2: number;
  // theory (suffix _t)
  Z1_t: number;
  Z2_t: number;
  Z1Z2_t: number;
  Z1X2_t: number;
  X1Z2_t: number;
  X1X2_t: number;
}

function toExpPoints(points: AlphaSweepPoint[]): ExpPoint[] {
  return points
    .filter((p) => p.observables && p.observables_theory)
    .map((p) => {
      const o = p.observables!;
      const t = p.observables_theory!;
      return {
        alpha: p.alpha,
        Z1: o.Z1,
        Z2: o.Z2,
        Z1Z2: o.Z1Z2,
        Z1X2: o.Z1X2,
        X1Z2: o.X1Z2,
        X1X2: o.X1X2,
        Z1_t: t.Z1,
        Z2_t: t.Z2,
        Z1Z2_t: t.Z1Z2,
        Z1X2_t: t.Z1X2,
        X1Z2_t: t.X1Z2,
        X1X2_t: t.X1X2,
      };
    });
}

// ── Custom dot renderer ───────────────────────────────────────────────────────

function makeDot(color: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function Dot(props: any) {
    const { cx, cy } = props as { cx: number; cy: number };
    if (cx == null || cy == null) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={2.5}
        fill={color}
        stroke="#181620"
        strokeWidth={0.5}
      />
    );
  };
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExpTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ExpPoint;
  return (
    <div
      className="px-3 py-2 text-xs border rounded-lg"
      style={{
        background: "#13111e",
        borderColor: "#2d2b3a",
        color: "#ddd9ee",
        minWidth: 170,
      }}
    >
      <div className="mb-1 font-semibold">α = {d.alpha.toFixed(4)}</div>
      {OPS.map(({ key, label, color }) => (
        <div key={key} className="flex justify-between gap-3">
          <span style={{ color }}>{label}</span>
          <span>
            {(d[key] as number).toFixed(3)}
            <span style={{ color: "#6b6780" }}>
              {" "}
              (th: {(d[`${key}_t` as keyof ExpPoint] as number).toFixed(3)})
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  points: AlphaSweepPoint[];
}

/** Pure display — parent controls data fetching. */
export function ExpectationSweepChart({ points }: Props) {
  const data = toExpPoints(points);
  if (!data.length) return null;

  // Static α bands from the paper:
  // Accept region  (E < 0.4 → sin²α < 0.4 → α < arcsin(√0.4) ≈ 0.6847 rad)
  // Reject region  (E ≥ 0.5 → sin²α ≥ 0.5 → α ≥ π/4 ≈ 0.7854 rad)
  const ALPHA_ACCEPT_MAX = Math.asin(Math.sqrt(0.4)); // ≈ 0.685
  const ALPHA_REJECT_MIN = Math.asin(Math.sqrt(0.5)); // ≈ 0.785

  return (
    <div className="space-y-2">
      {/* Sub-header */}
      <div className="flex items-center gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
          style={{ background: "#1e1c2a", color: "#9490a8" }}
        >
          (a)
        </span>
        <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
          Expectation values ⟨O⟩ vs α
        </span>
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center gap-3 text-[10px]"
        style={{ color: "#9490a8" }}
      >
        {OPS.map(({ key, label, color }) => (
          <span key={key} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span style={{ color: "#6b6780" }}>— — —</span>
          <span style={{ color: "#6b6780" }}>theory</span>
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 4, left: -10 }}
        >
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="alpha"
            {...axisProps}
            tickFormatter={(v: number) => formatAlpha(v)}
            domain={[0, Math.PI / 2]}
            type="number"
            label={{
              value: "α (rad)",
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
            domain={[-1.05, 1.05]}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{
              value: "⟨O⟩",
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
          <Tooltip content={<ExpTooltip />} />

          {/* α-region bands (same as paper's grey areas) */}
          <ReferenceArea
            x1={0}
            x2={ALPHA_ACCEPT_MAX}
            fill="rgba(255,255,255,0.025)"
            stroke="none"
          />
          <ReferenceArea
            x1={ALPHA_REJECT_MIN}
            x2={Math.PI / 2}
            fill="rgba(255,255,255,0.04)"
            stroke="none"
          />

          {OPS.map(({ key, color }) => (
            <>
              {/* Theory dashed line */}
              <Line
                key={`${key}_theory`}
                type="monotone"
                dataKey={`${key}_t`}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="5 3"
                dot={false}
                isAnimationActive={false}
                legendType="none"
                strokeOpacity={0.65}
              />
              {/* Measured dots */}
              <Line
                key={`${key}_meas`}
                type="monotone"
                dataKey={key}
                stroke="transparent"
                strokeWidth={0}
                dot={makeDot(color)}
                isAnimationActive={false}
                legendType="none"
                activeDot={false}
              />
            </>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
