/**
 * EnergyVsAlphaChart.tsx
 * Primary Recharts line chart: Hamiltonian energy vs α under various λ values.
 * Lines: ideal (success), noisy at current λ (dynamic colour), reference λ=0.05 (muted).
 * Shaded "verifiable zone" below the E = 0.4 threshold.
 */

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  axisProps,
  gridProps,
} from "../../../../../components/charts/chartTheme";
import { THRESHOLD, PI_HALF } from "../DepolarizingTrap.constants";
import type { EnergyPoint } from "../DepolarizingTrap.types";

// ── Tooltip ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EnergyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as EnergyPoint;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-[11px] text-foreground">
      <div className="mb-1 font-mono text-[10px] text-subtle">
        α = {((d.alpha / PI_HALF) * 90).toFixed(1)}°
      </div>
      <div className="space-y-0.5">
        <div>
          <span className="text-success">E ideal </span>
          <span className="font-mono">{d.ideal.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-warning">E noisy </span>
          <span className="font-mono">{d.noisy.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-muted">E λ=0.05 </span>
          <span className="font-mono">{d.ref.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  alpha: number;
  lam: number;
  lineColor: string;
  energyData: EnergyPoint[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EnergyVsAlphaChart({
  alpha,
  lam,
  lineColor,
  energyData,
}: Props) {
  const shadedData = energyData.map((d) => ({
    ...d,
    ideal: Math.min(d.ideal, THRESHOLD),
  }));

  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-subtle">
        Hamiltonian energy vs α
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart
          data={energyData}
          margin={{ top: 8, right: 14, left: -14, bottom: 0 }}
        >
          <defs>
            {/* stopColor must be a hex/rgb value — CSS vars are not resolved inside SVG */}
            <linearGradient
              id="depol-verifiable-grad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.04} />
            </linearGradient>
          </defs>

          <CartesianGrid {...gridProps} />

          <XAxis
            dataKey="alpha"
            type="number"
            domain={[0, PI_HALF]}
            ticks={[0, PI_HALF / 4, PI_HALF / 2, (3 * PI_HALF) / 4, PI_HALF]}
            tickFormatter={(v: number) => `${((v / PI_HALF) * 90).toFixed(0)}°`}
            {...axisProps}
            tickLine={false}
          />
          <YAxis
            domain={[0, 2.0]}
            ticks={[0, 0.4, 0.5, 1.0, 1.5, 2.0]}
            {...axisProps}
            tickLine={false}
          />

          <Tooltip content={<EnergyTooltip />} />

          {/* Verifiable zone shading */}
          <Area
            dataKey="ideal"
            data={shadedData}
            fill="url(#depol-verifiable-grad)"
            stroke="none"
            isAnimationActive={false}
          />

          {/* Acceptance threshold */}
          <ReferenceLine
            y={THRESHOLD}
            stroke="rgba(255,255,255,0.35)"
            strokeDasharray="5 3"
            strokeWidth={1}
            label={{
              value: "E = 0.4 threshold",
              position: "insideTopRight",
              fill: "rgba(255,255,255,0.45)",
              fontSize: 9,
              fontFamily: "'Courier New', monospace",
            }}
          />

          {/* Current α vertical marker */}
          <ReferenceLine
            x={alpha}
            stroke="rgba(167,139,250,0.5)"
            strokeWidth={1}
            strokeDasharray="3 2"
          />

          {/* Reference λ=0.05 line (muted, dashed) */}
          <Line
            dataKey="ref"
            data={energyData}
            stroke="var(--color-muted)"
            strokeWidth={1}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />

          {/* Ideal line */}
          <Line
            dataKey="ideal"
            data={energyData}
            stroke="var(--color-success)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />

          {/* Noisy line at current λ */}
          <Line
            dataKey="noisy"
            data={energyData}
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-success" />
          <span className="text-success">ideal (λ=0)</span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: lineColor }}
          />
          <span style={{ color: lineColor }}>noisy (λ={lam.toFixed(2)})</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 border-t border-dashed border-muted" />
          <span className="text-muted">ref λ=0.05</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-4 bg-success/15" />
          <span className="text-foreground/60">verifiable zone</span>
        </span>
      </div>
    </div>
  );
}
