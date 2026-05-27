/**
 * ContractionChart.tsx
 * Small secondary chart showing how the two-qubit correlator contraction
 * factor (1−λ)² decays with increasing depolarizing rate λ.
 */

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { axisProps, gridProps } from "../../../../charts/chartTheme";
import { CONTRACTION_DATA } from "../DepolarizingTrap.physics";
import type { ContractionPoint } from "../DepolarizingTrap.types";

// ── Tooltip ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ContractionTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ContractionPoint;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-[11px] text-foreground">
      <div className="font-mono">λ = {d.lambda.toFixed(2)}</div>
      <div>
        <span className="text-warning">(1−λ)² = </span>
        <span className="font-mono">{d.contraction.toFixed(4)}</span>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  lam: number;
  lcrit: number;
  lineColor: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ContractionChart({ lam, lcrit, lineColor }: Props) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-subtle">
        Two-qubit observable contraction factor (1−λ)²
      </p>

      <ResponsiveContainer width="100%" height={130}>
        <ComposedChart
          data={CONTRACTION_DATA}
          margin={{ top: 4, right: 14, left: -14, bottom: 0 }}
        >
          <CartesianGrid {...gridProps} />

          <XAxis
            dataKey="lambda"
            type="number"
            domain={[0, 0.5]}
            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
            tickFormatter={(v: number) => v.toFixed(1)}
            {...axisProps}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1.0]}
            {...axisProps}
            tickLine={false}
          />

          <Tooltip content={<ContractionTooltip />} />

          {/* Stricker best-fit annotation */}
          <ReferenceLine
            x={0.05}
            stroke="var(--color-muted)"
            strokeWidth={1}
            strokeDasharray="3 2"
            label={{
              value: "0.05",
              position: "insideTopRight",
              fill: "var(--color-muted)",
              fontSize: 8,
              fontFamily: "'Courier New', monospace",
            }}
          />

          {/* λ_crit annotation */}
          {lcrit > 0 && (
            <ReferenceLine
              x={lcrit}
              stroke="var(--color-danger)"
              strokeWidth={1}
              strokeDasharray="3 2"
              label={{
                value: "λ_c",
                position: "insideTopLeft",
                fill: "var(--color-danger)",
                fontSize: 8,
                fontFamily: "'Courier New', monospace",
              }}
            />
          )}

          {/* Current λ marker */}
          <ReferenceLine x={lam} stroke={lineColor} strokeWidth={1.5} />

          {/* Contraction curve */}
          <Line
            dataKey="contraction"
            stroke="var(--color-warning)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
