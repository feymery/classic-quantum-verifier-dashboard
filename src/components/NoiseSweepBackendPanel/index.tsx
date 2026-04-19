/**
 * NoiseSweepBackendPanel — Phase 3
 *
 * Triggers a POST /sweep/noise call that uses the real AerSimulator + NoiseModel
 * and renders the resulting energy-vs-noise-lambda curve with error bars.
 */

import { useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ErrorBar,
} from "recharts";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import {
  CHART_COLORS,
  CHART_FONT,
  axisProps,
  gridProps,
} from "../charts/chartTheme";
import { ChartTooltip } from "../charts/ChartTooltip";
import {
  runNoiseSweep,
  type NoiseSweepBackendPoint,
} from "../../services/sweepApi";
import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../../utils/constants";

interface NoiseSweepBackendPanelProps {
  alpha: number;
  shots: number;
}

type LoadState = "idle" | "loading" | "done" | "error";

export function NoiseSweepBackendPanel({
  alpha,
  shots,
}: NoiseSweepBackendPanelProps) {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [points, setPoints] = useState<NoiseSweepBackendPoint[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const run = useCallback(async () => {
    setLoadState("loading");
    setErrorMsg("");
    try {
      const result = await runNoiseSweep(alpha, shots);
      setPoints(result.points);
      setLoadState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setLoadState("error");
    }
  }, [alpha, shots]);

  // Build chart data: energy_est ± energy_error as ErrorBar payload
  const chartData = points.map((p) => ({
    noise_p: p.noise_p,
    energy_est: p.energy_est,
    energy_theory: p.energy_theory,
    energy_error: p.energy_error,
    verdict: p.verdict,
  }));

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="px-1.5 py-0.5 rounded  text-[9px] font-semibold tracking-wider"
              style={{
                background: "rgba(167,139,250,0.12)",
                color: "#a78bfa",
                border: "1px solid rgba(167,139,250,0.25)",
              }}
            >
              phase 3
            </span>
            <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
              Backend Noise Sweep
            </span>
          </div>
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            AerSimulator + NoiseModel
          </span>
        </div>

        <p
          className=" text-[10px] leading-relaxed"
          style={{ color: "#6b6780" }}
        >
          Runs the 3 measurement circuits at α = {alpha.toFixed(4)} rad with
          increasing depolarizing noise λ using real Qiskit&nbsp;Aer simulation.
        </p>

        {/* Run button */}
        <Button
          onClick={run}
          disabled={loadState === "loading"}
          variant="primary"
          size="sm"
        >
          {loadState === "loading" ? "Running…" : "Run Noise Sweep"}
        </Button>

        {loadState === "error" && (
          <p className=" text-[10px]" style={{ color: "#f87171" }}>
            Error: {errorMsg}
          </p>
        )}

        {/* Chart */}
        {loadState === "done" && chartData.length > 0 && (
          <div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 16, left: -20, bottom: 4 }}
              >
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="noise_p"
                  type="number"
                  domain={[0, "dataMax"]}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{
                    value: "λ (noise)",
                    position: "insideBottomRight",
                    offset: -4,
                    fontFamily: CHART_FONT.family,
                    fontSize: 9,
                    fill: CHART_FONT.fill,
                  }}
                  {...axisProps}
                />
                <YAxis
                  domain={[0, 1]}
                  tickCount={5}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  {...axisProps}
                />
                <Tooltip content={<ChartTooltip />} />

                {/* acceptance / rejection thresholds */}
                <ReferenceLine
                  y={THRESHOLD_LOW}
                  stroke={CHART_COLORS.thresholdLow}
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  label={{
                    value: `accept < ${THRESHOLD_LOW}`,
                    position: "insideTopLeft",
                    fontFamily: CHART_FONT.family,
                    fontSize: 9,
                    fill: CHART_COLORS.thresholdLow,
                  }}
                />
                <ReferenceLine
                  y={THRESHOLD_HIGH}
                  stroke={CHART_COLORS.thresholdHigh}
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  label={{
                    value: `reject ≥ ${THRESHOLD_HIGH}`,
                    position: "insideTopLeft",
                    fontFamily: CHART_FONT.family,
                    fontSize: 9,
                    fill: CHART_COLORS.thresholdHigh,
                  }}
                />

                {/* theoretical (noiseless) */}
                <Line
                  dataKey="energy_theory"
                  stroke={CHART_COLORS.theoretical}
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  dot={false}
                  name="E theory"
                />

                {/* estimated with real noise — error bars */}
                <Line
                  dataKey="energy_est"
                  stroke={CHART_COLORS.estimated}
                  strokeWidth={2}
                  dot={{ r: 3, fill: CHART_COLORS.estimated }}
                  name="E est (Aer)"
                  isAnimationActive={false}
                >
                  <ErrorBar
                    dataKey="energy_error"
                    width={4}
                    strokeWidth={1.5}
                    stroke={CHART_COLORS.estimated}
                    opacity={0.6}
                    direction="y"
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["accept", "marginal", "reject"] as const).map((v) => {
                const count = chartData.filter((p) => p.verdict === v).length;
                const color =
                  v === "accept"
                    ? CHART_COLORS.accept
                    : v === "reject"
                      ? CHART_COLORS.reject
                      : "#f59e0b";
                return (
                  <div
                    key={v}
                    className="p-2 rounded text-center"
                    style={{
                      background: "#181620",
                      border: `1px solid #2d2b3a`,
                    }}
                  >
                    <div className=" text-[10px]" style={{ color }}>
                      {v}
                    </div>
                    <div
                      className=" text-sm font-bold"
                      style={{ color: "#ddd9ee" }}
                    >
                      {count}
                    </div>
                    <div className=" text-[9px]" style={{ color: "#6b6780" }}>
                      points
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
