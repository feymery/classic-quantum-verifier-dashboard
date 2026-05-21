/**
 * EnergyVsLambdaChart.tsx
 * E_noisy(λ) at fixed α — zoomed into [0, 0.15] to show the threshold
 * crossing at λ_crit and the safety margin Δλ relative to λ=0.05.
 */

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  axisProps,
  gridProps,
} from "../../../../../components/charts/chartTheme";
import { THRESHOLD, PI_HALF } from "../DepolarizingTrap.constants";
import { buildEnergyVsLambdaData } from "../DepolarizingTrap.physics";
import type { EnergyVsLambdaPoint } from "../DepolarizingTrap.types";

// ── Tooltip ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EnergyLambdaTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as EnergyVsLambdaPoint;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-[11px] text-foreground">
      <div className="mb-1 font-mono text-[10px] text-subtle">
        λ = {d.lambda.toFixed(3)}
      </div>
      <div>
        <span className="text-warning">E_noisy </span>
        <span className="font-mono">{d.E_noisy.toFixed(4)}</span>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  alpha: number;
  lam: number;
  lcrit: number;
  lineColor: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

const LAMBDA_REF = 0.05;
const CHART_LAM_MAX = 0.15;

export function EnergyVsLambdaChart({ alpha, lam, lcrit, lineColor }: Props) {
  const data = useMemo(() => buildEnergyVsLambdaData(alpha), [alpha]);
  const alphaDeg = ((alpha / PI_HALF) * 90).toFixed(0);

  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-subtle">
        Hamiltonian energy vs λ &nbsp;(α = {alphaDeg}°)
      </p>

      <ResponsiveContainer width="100%" height={170}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 14, left: -14, bottom: 0 }}
        >
          <defs>
            <linearGradient id="margin-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.04} />
            </linearGradient>
          </defs>

          <CartesianGrid {...gridProps} />

          <XAxis
            dataKey="lambda"
            type="number"
            domain={[0, CHART_LAM_MAX]}
            ticks={[0, 0.025, 0.05, 0.075, 0.1, 0.125, 0.15]}
            tickFormatter={(v: number) => v.toFixed(2)}
            {...axisProps}
            tickLine={false}
          />
          <YAxis
            domain={[0, 0.8]}
            ticks={[0, 0.2, 0.4, 0.6, 0.8]}
            tickFormatter={(v: number) => v.toFixed(1)}
            {...axisProps}
            tickLine={false}
          />

          <Tooltip content={<EnergyLambdaTooltip />} />

          {/* Safety margin shading between λ_ref and λ_crit */}
          {lcrit > LAMBDA_REF && lcrit <= CHART_LAM_MAX && (
            <ReferenceArea
              x1={LAMBDA_REF}
              x2={lcrit}
              fill="url(#margin-grad)"
            />
          )}

          {/* Acceptance threshold */}
          <ReferenceLine
            y={THRESHOLD}
            stroke="rgba(255,255,255,0.35)"
            strokeDasharray="5 3"
            strokeWidth={1}
            label={{
              value: "E = 0.4",
              position: "insideTopRight",
              fill: "rgba(255,255,255,0.45)",
              fontSize: 9,
              fontFamily: "'Courier New', monospace",
            }}
          />

          {/* λ_ref = 0.05 */}
          <ReferenceLine
            x={LAMBDA_REF}
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

          {/* λ_crit */}
          {lcrit > 0 && lcrit <= CHART_LAM_MAX && (
            <ReferenceLine
              x={lcrit}
              stroke="var(--color-danger)"
              strokeWidth={1}
              strokeDasharray="3 2"
              label={{
                value: `λ_c=${lcrit.toFixed(3)}`,
                position: "insideTopLeft",
                fill: "var(--color-danger)",
                fontSize: 8,
                fontFamily: "'Courier New', monospace",
              }}
            />
          )}

          {/* Current λ */}
          {lam <= CHART_LAM_MAX && (
            <ReferenceLine x={lam} stroke={lineColor} strokeWidth={1.5} />
          )}

          {/* E_noisy curve */}
          <Line
            dataKey="E_noisy"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Δλ annotation */}
      {lcrit > LAMBDA_REF && (
        <p className="mt-1 text-[10px] text-muted">
          Noise headroom:{" "}
          <span className="font-mono text-warning">
            Δλ = {(lcrit - LAMBDA_REF).toFixed(3)}
          </span>
        </p>
      )}
    </div>
  );
}
