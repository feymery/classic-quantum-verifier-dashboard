/**
 * VerificationPhaseDiagram.tsx
 * Phase diagram in (α, λ) space showing the verification boundary λ_crit(α).
 *
 * The green-shaded area below the curve is the "verification possible" region.
 * Above it the honest-but-noisy prover would be incorrectly rejected.
 * The violet dot marks the Stricker et al. reference operating point (α=9°, λ=0.05).
 * The white dot marks the current (alpha, lam) selected in the dashboard.
 */

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { axisProps, gridProps } from "../../../../charts/chartTheme";
import { PI_HALF } from "../DepolarizingTrap.constants";
import { PHASE_DIAGRAM_DATA } from "../DepolarizingTrap.physics";
import type { PhaseDiagramPoint } from "../DepolarizingTrap.types";

// ── Tooltip ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PhaseDiagramTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as PhaseDiagramPoint;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-[11px] text-foreground">
      <div className="mb-1 font-mono text-[10px] text-subtle">
        α = {d.alphaDeg.toFixed(1)}°
      </div>
      <div>
        <span className="text-success">λ_crit </span>
        <span className="font-mono">{d.lambdaCrit.toFixed(4)}</span>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  alpha: number; // current alpha in radians
  lam: number; // current lambda
  lcrit: number; // exact λ_crit at current alpha
}

// ── Component ─────────────────────────────────────────────────────────────────

const LAMBDA_REF = 0.05;
const ALPHA_REF_DEG = 9;

export function VerificationPhaseDiagram({ alpha, lam, lcrit }: Props) {
  const alphaDeg = (alpha / PI_HALF) * 90;
  const currentInSafeZone = lam <= lcrit;

  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-subtle">
        Verification phase diagram — λ_crit(α)
      </p>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart
          data={PHASE_DIAGRAM_DATA}
          margin={{ top: 8, right: 14, left: -14, bottom: 0 }}
        >
          <defs>
            <linearGradient id="phase-safe-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid {...gridProps} />

          <XAxis
            dataKey="alphaDeg"
            type="number"
            domain={[0, 45]}
            ticks={[0, 9, 18, 27, 36, 39]}
            tickFormatter={(v: number) => `${v}°`}
            {...axisProps}
            tickLine={false}
          />
          <YAxis
            domain={[0, 0.1]}
            ticks={[0, 0.02, 0.04, 0.06, 0.08, 0.1]}
            tickFormatter={(v: number) => v.toFixed(2)}
            {...axisProps}
            tickLine={false}
          />

          <Tooltip content={<PhaseDiagramTooltip />} />

          {/* Verification boundary + safe-zone fill */}
          <Area
            dataKey="lambdaCrit"
            fill="url(#phase-safe-grad)"
            stroke="var(--color-success)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          {/* Stricker reference point (α=9°, λ=0.05) */}
          <ReferenceDot
            x={ALPHA_REF_DEG}
            y={LAMBDA_REF}
            r={5}
            fill="#a78bfa"
            stroke="white"
            strokeWidth={1.5}
          />

          {/* Current operating point */}
          {lam <= 0.1 && (
            <ReferenceDot
              x={alphaDeg}
              y={lam}
              r={4}
              fill={
                currentInSafeZone
                  ? "var(--color-success)"
                  : "var(--color-danger)"
              }
              stroke="white"
              strokeWidth={1}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-3 border rounded-sm bg-success/20 border-success/50" />
          <span className="text-success">Verification possible</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#a78bfa]" />
          <span className="text-muted">Stricker ref (α=9°, λ=0.05)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${currentInSafeZone ? "bg-success" : "bg-danger"}`}
          />
          <span className="text-muted">
            Current (α={alphaDeg.toFixed(0)}°, λ={lam.toFixed(2)})
          </span>
        </span>
      </div>
    </div>
  );
}
