/**
 * AlphaSweepChart.tsx
 * Reproduces Figure 2(b) of Stricker et al.:
 *   E_est ± σ_E vs α with the accept / reject threshold bands.
 *
 * Uses a ComposedChart:
 *   • Area between (energy_est - error) and (energy_est + error) — uncertainty band
 *   • Line for E_theory = sin²(α)
 *   • Scatter for the measured E_est points, coloured by verdict
 *   • ReferenceLine at 0.4 (accept) and 0.5 (reject)
 */

import { useState, useCallback } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { CHART_COLORS, CHART_HEIGHT, axisProps, gridProps } from "./chartTheme";
import { runAlphaSweep, type AlphaSweepPoint } from "../../services/sweepApi";
import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../../utils/constants";
import { formatAlpha } from "../../utils/alphaUtils";

// ── Chart data shape ──────────────────────────────────────────────────────────

interface SweepChartPoint {
  alpha: number;
  energy_theory: number;
  upper: number;
  lower: number;
  energy_est: number;
  verdict: AlphaSweepPoint["verdict"];
}

function toChartPoints(points: AlphaSweepPoint[]): SweepChartPoint[] {
  return points.map((p) => ({
    alpha: p.alpha,
    energy_theory: p.energy_theory,
    upper: Math.min(1.05, p.energy_est + p.energy_error),
    lower: Math.max(0, p.energy_est - p.energy_error),
    energy_est: p.energy_est,
    verdict: p.verdict,
  }));
}

// ── Verdict dot renderer ──────────────────────────────────────────────────────

const VERDICT_COLOR: Record<AlphaSweepPoint["verdict"], string> = {
  accept: CHART_COLORS.accept,
  reject: CHART_COLORS.reject,
  marginal: CHART_COLORS.thresholdHigh,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VerdictDot(props: any) {
  const { cx, cy, payload } = props as {
    cx: number;
    cy: number;
    payload: SweepChartPoint;
  };
  const color = VERDICT_COLOR[payload.verdict];
  return (
    <circle
      key={`dot-${payload.alpha}`}
      cx={cx}
      cy={cy}
      r={3}
      fill={color}
      stroke="#181620"
      strokeWidth={0.5}
    />
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SweepTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as SweepChartPoint;
  const verdictColor = VERDICT_COLOR[d.verdict];
  return (
    <div
      className="px-3 py-2  text-xs border rounded-lg"
      style={{
        background: CHART_COLORS.tooltip,
        borderColor: CHART_COLORS.tooltipBorder,
        color: "#ddd9ee",
        minWidth: 150,
      }}
    >
      <div>α = {d.alpha.toFixed(4)}</div>
      <div>E_est = {d.energy_est.toFixed(4)}</div>
      <div>
        ±σ = [{d.lower.toFixed(4)}, {d.upper.toFixed(4)}]
      </div>
      <div>E_theory = {d.energy_theory.toFixed(4)}</div>
      <div style={{ color: verdictColor }}>verdict: {d.verdict}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface AlphaSweepChartProps {
  shots?: number;
  nPoints?: number;
}

export function AlphaSweepChart({
  shots = 1024,
  nPoints = 30,
}: AlphaSweepChartProps) {
  const [data, setData] = useState<SweepChartPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSweep = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runAlphaSweep(shots, nPoints);
      setData(toChartPoints(result.points));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sweep failed");
    } finally {
      setLoading(false);
    }
  }, [shots, nPoints]);

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5  text-[9px] font-medium uppercase tracking-wider"
              style={{ background: "#1e1c2a", color: "#9490a8" }}
            >
              sweep
            </span>
            <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
              E_est ± σ vs α — Figure 2(b)
            </span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={runSweep}
            disabled={loading}
            className=" text-[10px] px-3 py-1"
          >
            {loading ? "running…" : "Run Sweep"}
          </Button>
        </div>

        {/* Legend */}
        {data && (
          <div
            className="flex flex-wrap items-center gap-4 text-[10px] "
            style={{ color: "#9490a8" }}
          >
            <span className="flex items-center gap-1">
              <span style={{ color: CHART_COLORS.theoretical }}>——</span>{" "}
              E_theory = sin²(α)
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-4 h-2 rounded-sm"
                style={{ background: "rgba(167,139,250,0.15)" }}
              />
              ±σ band
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-lg"
                style={{ background: CHART_COLORS.accept }}
              />
              accept
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-lg"
                style={{ background: CHART_COLORS.thresholdHigh }}
              />
              marginal
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-lg"
                style={{ background: CHART_COLORS.reject }}
              />
              reject
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className=" text-xs" style={{ color: CHART_COLORS.reject }}>
            {error}
          </p>
        )}

        {/* Placeholder */}
        {!data && !loading && !error && (
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              height: CHART_HEIGHT,
              background: "rgba(14,13,20,0.4)",
              border: "1px dashed #2d2b3a",
              color: "#9490a8",
              fontSize: 11,
              fontFamily: "'Courier New', monospace",
            }}
          >
            click Run Sweep to reproduce Figure 2(b)
          </div>
        )}

        {/* Chart */}
        {data && (
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
                  value: "α (radians)",
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
                domain={[0, 1.05]}
                tickFormatter={(v: number) => v.toFixed(1)}
                label={{
                  value: "E",
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
              <Tooltip content={<SweepTooltip />} />

              {/* Threshold lines */}
              <ReferenceLine
                y={THRESHOLD_LOW}
                stroke={CHART_COLORS.thresholdLow}
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{
                  value: `accept < ${THRESHOLD_LOW}`,
                  position: "insideTopRight",
                  style: {
                    fontFamily: "'Courier New', monospace",
                    fontSize: 8,
                    fill: CHART_COLORS.thresholdLow,
                  },
                }}
              />
              <ReferenceLine
                y={THRESHOLD_HIGH}
                stroke={CHART_COLORS.thresholdHigh}
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{
                  value: `reject ≥ ${THRESHOLD_HIGH}`,
                  position: "insideTopRight",
                  style: {
                    fontFamily: "'Courier New', monospace",
                    fontSize: 8,
                    fill: CHART_COLORS.thresholdHigh,
                  },
                }}
              />

              {/* ±σ uncertainty band */}
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

              {/* E_theory curve */}
              <Line
                type="monotone"
                dataKey="energy_theory"
                stroke={CHART_COLORS.theoretical}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 3"
                isAnimationActive={false}
                legendType="none"
              />

              {/* E_est scatter with verdict colouring */}
              <Scatter
                dataKey="energy_est"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => <VerdictDot {...props} />}
                isAnimationActive={false}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
