/**
 * ShotsPanel.tsx
 * Recharts line chart: shots vs minimum detectable bias δ.
 *
 * Curve: δ_min(shots) = 1/√shots
 * Active point: current (shots, delta) from parent, highlighted.
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import {
  DELTA_MAX,
  SHOT_OPTIONS,
  BIAS_COLOR,
  TRAP_COLOR,
} from "./BiasedAmplitudesTrap.types";
import { minShotsToDetect } from "./BiasedAmplitudesTrap.helpers";

interface Props {
  shots: number;
  delta: number;
}

const CURVE_POINTS = Array.from({ length: 200 }, (_, i) => {
  const s = Math.round(10 + (i / 199) * (1024 - 10));
  return { shots: s, deltaMin: Math.min(DELTA_MAX, 1 / Math.sqrt(s)) };
});

function ShotTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded border px-2 py-1 text-[10px]"
      style={{
        background: "#1e1c2a",
        borderColor: "#3d3b4a",
        color: "#ddd9ee",
      }}
    >
      δ_min = {payload[0]?.value?.toFixed(3)}
    </div>
  );
}

export function ShotsPanel({ shots, delta }: Props) {
  const needed = minShotsToDetect(delta);
  const inRange = shots >= needed;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ color: "#6b6780" }}
        >
          shots vs minimum detectable δ
        </p>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: inRange
              ? "rgba(52,211,153,0.1)"
              : "rgba(248,113,113,0.1)",
            color: inRange ? "#34d399" : TRAP_COLOR,
          }}
        >
          {inRange ? "detectable" : `need ≥ ${needed} shots`}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <LineChart
          data={CURVE_POINTS}
          margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
        >
          <XAxis
            dataKey="shots"
            tick={{ fontSize: 8, fill: "#6b6780" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, DELTA_MAX]}
            tick={{ fontSize: 8, fill: "#6b6780" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip content={<ShotTooltip />} />
          <Line
            dataKey="deltaMin"
            dot={false}
            strokeWidth={1.5}
            stroke={BIAS_COLOR}
            isAnimationActive={false}
          />
          {/* Reference lines for current active shot option marks */}
          {SHOT_OPTIONS.map((s) => (
            <ReferenceLine key={s} x={s} stroke="#2d2b3a" strokeWidth={1} />
          ))}
          {/* Active point */}
          <ReferenceDot
            x={shots}
            y={Math.min(DELTA_MAX, 1 / Math.sqrt(shots))}
            r={4}
            fill={inRange ? "#34d399" : TRAP_COLOR}
            stroke="none"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-[10px]" style={{ color: "#6b6780" }}>
        Below the curve → bias δ is undetectable at this shot count. Your point:{" "}
        <span style={{ color: inRange ? "#34d399" : TRAP_COLOR }}>
          δ = {delta.toFixed(2)}, shots = {shots}
        </span>
      </p>
    </div>
  );
}
