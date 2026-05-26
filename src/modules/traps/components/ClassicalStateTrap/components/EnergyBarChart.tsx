import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { BAR_DATA, THRESHOLD } from "../ClassicalStateTrap.constants";
import { SectionLabel } from "../../../shared/SectionLabel";

interface Props {
  alpha: number;
  cosA: number;
  sinA: number;
  E_quantum: number;
  showQuantum: boolean;
}

export function EnergyBarChart({
  alpha,
  cosA,
  sinA,
  E_quantum,
  showQuantum,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Energy by classical state</SectionLabel>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={BAR_DATA}
          margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(46,43,58,0.7)"
            strokeWidth={0.5}
          />
          <XAxis
            dataKey="label"
            tick={{
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              fill: "var(--color-subtle)",
            }}
            axisLine={{ stroke: "rgba(46,43,58,0.5)", strokeWidth: 0.5 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 7]}
            tick={{
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              fill: "var(--color-subtle)",
            }}
            axisLine={{ stroke: "rgba(46,43,58,0.5)", strokeWidth: 0.5 }}
            tickLine={false}
            label={{
              value: "E",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              style: {
                fontFamily: "'Courier New', monospace",
                fontSize: 10,
                fill: "var(--color-subtle)",
              },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "'Courier New', monospace",
            }}
            cursor={{ fill: "rgba(167,139,250,0.06)" }}
            formatter={(val) =>
              typeof val === "number"
                ? [val.toFixed(2), "Energy"]
                : [String(val), "Energy"]
            }
          />

          <Bar dataKey="energy" radius={[3, 3, 0, 0]}>
            {BAR_DATA.map((entry) => (
              <Cell
                key={entry.label}
                fill={
                  entry.energy >= 5
                    ? "var(--color-danger)"
                    : "var(--color-warning)"
                }
                fillOpacity={0.75}
              />
            ))}
          </Bar>

          <ReferenceLine
            y={THRESHOLD}
            stroke="var(--color-success)"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: "threshold 0.4",
              position: "insideTopRight",
              fill: "var(--color-success)",
              fontSize: 9,
              fontFamily: "'Courier New', monospace",
            }}
          />

          {showQuantum && (
            <ReferenceLine
              y={E_quantum}
              stroke="#34d399"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              label={{
                value: `honest sin²α ≈ ${E_quantum.toFixed(2)}`,
                position: "insideBottomRight",
                fill: "#34d399",
                fontSize: 9,
                fontFamily: "'Courier New', monospace",
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 text-[11px]">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-5"
            style={{
              background: "var(--color-success)",
              height: 1.5,
              opacity: 0.85,
            }}
          />
          <span style={{ color: "var(--color-success)" }}>
            acceptance threshold — E &lt; 0.4 → verified
          </span>
        </div>
        {showQuantum && (
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-5"
              style={{ background: "#34d399", height: 1.5, opacity: 0.6 }}
            />
            <span style={{ color: "#34d399" }}>
              honest prover E = sin²α ≈ {E_quantum.toFixed(3)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-3 rounded-sm"
            style={{ background: "var(--color-warning)", opacity: 0.75 }}
          />
          <span style={{ color: "var(--color-warning)" }}>
            classical state 1.5 ≤ E ≤ 4
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-3 rounded-sm"
            style={{ background: "var(--color-danger)", opacity: 0.75 }}
          />
          <span style={{ color: "var(--color-danger)" }}>
            classical state E ≥ 5 (|10⟩ worst: E = 6.0)
          </span>
        </div>
      </div>

      {/* Alpha annotation */}
      <div
        className="mt-1 rounded-lg border px-3 py-2 text-[11px] leading-relaxed"
        style={{
          borderColor: "rgba(167,139,250,0.2)",
          background: "rgba(167,139,250,0.04)",
          color: "var(--color-muted)",
        }}
      >
        <span
          className="font-mono font-semibold"
          style={{ color: "var(--color-accent)" }}
        >
          α = {alpha.toFixed(3)} rad
        </span>
        <span className="mx-2" style={{ color: "var(--color-subtle)" }}>
          |
        </span>
        <span className="font-mono">
          cos α = {cosA.toFixed(3)} · sin α = {sinA.toFixed(3)}
        </span>
        <span className="mx-2" style={{ color: "var(--color-subtle)" }}>
          |
        </span>
        <span
          className="font-mono font-semibold"
          style={{ color: "var(--color-success)" }}
        >
          E_honest = {E_quantum.toFixed(3)}
        </span>
      </div>
    </div>
  );
}
