/**
 * AlphaSweepChart.tsx
 * Reproduces Figures 2(a) and 2(b) of Stricker et al. in a single panel:
 *
 *   (a) Expectation values ⟨O⟩ vs α for the 6 operators
 *       Z₁Z₂, Z₁, Z₂, Z₁X₂, X₁Z₂, X₁X₂
 *   (b) Estimated energy E_est ± σ_E vs α with accept/reject threshold bands.
 *
 * A single "Run Sweep" button triggers both charts from the same backend call.
 */

import { useMemo } from "react";
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
import { ConceptBox } from "../ProtocolExplainer";
import { CHART_COLORS, CHART_HEIGHT, axisProps, gridProps } from "./chartTheme";
import type { AlphaSweepPoint } from "../../services/sweepApi";
import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../../utils/constants";
import { formatAlpha } from "../../utils/alphaUtils";
import { ExpectationSweepChart } from "./ExpectationSweepChart";

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
  boundary: CHART_COLORS.thresholdHigh,
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
      className="px-3 py-2 text-xs border rounded-lg"
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
  points: AlphaSweepPoint[] | null;
  loading: boolean;
  error: string | null;
  onRun: () => void;
}

export function AlphaSweepChart({
  points,
  loading,
  error,
  onRun,
}: AlphaSweepChartProps) {
  const data = useMemo(
    () => (points ? { raw: points, chart: toChartPoints(points) } : null),
    [points],
  );

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
              Figure 2 — expectation values &amp; energy vs α
            </span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={onRun}
            disabled={loading}
            className=" text-[10px] px-3 py-1"
          >
            {loading ? "running…" : "Run Sweep"}
          </Button>
        </div>

        {/* Qiskit execution detail */}
        <ConceptBox
          title="How this runs on Qiskit Aer"
          accentColor="#6ee7b7"
          defaultOpen
        >
          <p>
            Each α point executes <strong>4 circuits</strong> on{" "}
            <code
              style={{
                color: "#6ee7b7",
                background: "#181620",
                borderRadius: 3,
                padding: "0 4px",
              }}
            >
              AerSimulator()
            </code>{" "}
            (noiseless, real shot statistics):
          </p>
          <div
            className="rounded px-2 py-1 mt-1 space-y-0.5 text-[11px]"
            style={{ background: "#181620" }}
          >
            {[
              ["Z basis", "measures Z₁, Z₂, Z₁Z₂"],
              ["ZX basis", "H on q_clock → measures Z₁X₂"],
              ["X basis", "H on both → measures X₁X₂"],
              ["X1Z2 basis", "H on q_clock, Z on q_prover → measures X₁Z₂"],
            ].map(([basis, desc]) => (
              <div key={basis} className="flex gap-2">
                <span style={{ color: "#6ee7b7", minWidth: 80 }}>{basis}</span>
                <span style={{ color: "#9490a8" }}>{desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
            Circuit: H on q_clock → CRY(2α) controlled on q_clock → basis-change
            gates. Transpiled with{" "}
            <code style={{ color: "#6ee7b7" }}>
              generate_preset_pass_manager
            </code>{" "}
            (opt level 1) and executed via{" "}
            <code style={{ color: "#6ee7b7" }}>SamplerV2</code>.
          </p>
          <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
            σ²_O = (1 − ⟨O⟩²) / shots per observable. Coefficients (−2, +1, −1,
            −1.5·cos α, −1.5·sin α) are squared and summed → σ_E. These are the
            error bars in Figure 2(b).
          </p>
        </ConceptBox>

        {/* Error */}
        {error && (
          <p className="text-xs " style={{ color: CHART_COLORS.reject }}>
            {error}
          </p>
        )}

        {/* Placeholder */}
        {!data && !loading && !error && (
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              height: CHART_HEIGHT + 40,
              background: "rgba(14,13,20,0.4)",
              border: "1px dashed #2d2b3a",
              color: "#9490a8",
              fontSize: 11,
              fontFamily: "'Courier New', monospace",
            }}
          >
            click Run Sweep to reproduce Figures 2(a) and 2(b)
          </div>
        )}

        {/* Side-by-side: (a) left, (b) right */}
        {data && (
          <div className="grid grid-cols-2 gap-4">
            {/* ── Figure 2(a) ── */}
            <ExpectationSweepChart points={data.raw} />

            {/* ── Figure 2(b) ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                  style={{ background: "#1e1c2a", color: "#9490a8" }}
                >
                  (b)
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "#ddd9ee" }}
                >
                  E_est ± σ vs α
                </span>
              </div>

              <div
                className="flex flex-wrap items-center gap-3 text-[10px]"
                style={{ color: "#9490a8" }}
              >
                <span className="flex items-center gap-1">
                  <span style={{ color: CHART_COLORS.theoretical }}>——</span>{" "}
                  sin²(α)
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-4 h-2 rounded-sm"
                    style={{ background: "rgba(167,139,250,0.15)" }}
                  />
                  ±σ
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: CHART_COLORS.accept }}
                  />
                  accept
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: CHART_COLORS.thresholdHigh }}
                  />
                  marginal
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: CHART_COLORS.reject }}
                  />
                  reject
                </span>
              </div>

              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <ComposedChart
                  data={data.chart}
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

                  <ReferenceLine
                    y={THRESHOLD_LOW}
                    stroke={CHART_COLORS.thresholdLow}
                    strokeDasharray="4 3"
                    strokeWidth={1}
                    label={{
                      value: `< ${THRESHOLD_LOW}`,
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
                      value: `≥ ${THRESHOLD_HIGH}`,
                      position: "insideTopRight",
                      style: {
                        fontFamily: "'Courier New', monospace",
                        fontSize: 8,
                        fill: CHART_COLORS.thresholdHigh,
                      },
                    }}
                  />

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
                  <Scatter
                    dataKey="energy_est"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    shape={(props: any) => <VerdictDot {...props} />}
                    isAnimationActive={false}
                    legendType="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
