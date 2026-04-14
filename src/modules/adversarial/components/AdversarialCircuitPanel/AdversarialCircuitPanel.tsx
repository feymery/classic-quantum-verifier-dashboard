/**
 * AdversarialCircuitPanel — Phase 3
 *
 * Triggers a POST /adversarial/circuit call, runs honest (alpha) and
 * adversarial (alpha_fake) circuits through the real Aer backend, and
 * visualises the bitstring distribution comparison as grouped bars plus a
 * metrics summary (TVD, KL divergence, energy delta).
 */

import { useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "../../../../ui/Card";
import { Button } from "../../../../ui/Button";
import {
  CHART_COLORS,
  CHART_FONT,
  axisProps,
  gridProps,
} from "../../../../components/charts/chartTheme";
import { ChartTooltip } from "../../../../components/charts/ChartTooltip";
import {
  runAdversarialCircuit,
  type AdversarialCircuitResult,
} from "../../services/adversarialApi";

interface AdversarialCircuitPanelProps {
  alpha: number;
  alphaFake: number;
  shots: number;
}

type LoadState = "idle" | "loading" | "done" | "error";

function verdictColor(v: string) {
  if (v === "accept") return CHART_COLORS.accept;
  if (v === "reject") return CHART_COLORS.reject;
  return "#f59e0b";
}

export function AdversarialCircuitPanel({
  alpha,
  alphaFake,
  shots,
}: AdversarialCircuitPanelProps) {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [result, setResult] = useState<AdversarialCircuitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const run = useCallback(async () => {
    setLoadState("loading");
    setErrorMsg("");
    try {
      const data = await runAdversarialCircuit(alpha, alphaFake, shots);
      setResult(data);
      setLoadState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setLoadState("error");
    }
  }, [alpha, alphaFake, shots]);

  // Build distribution comparison chart data
  const chartData = result
    ? (() => {
        const allStates = Array.from(
          new Set([
            ...Object.keys(result.honest.probabilities),
            ...Object.keys(result.adversarial.probabilities),
          ]),
        ).sort();
        return allStates.map((s) => ({
          state: s,
          honest: result.honest.probabilities[s] ?? 0,
          adversarial: result.adversarial.probabilities[s] ?? 0,
        }));
      })()
    : [];

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold tracking-wider"
              style={{
                background: "rgba(167,139,250,0.12)",
                color: "#a78bfa",
                border: "1px solid rgba(167,139,250,0.25)",
              }}
            >
              phase 3
            </span>
            <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
              Circuit-Level Adversarial Analysis
            </span>
          </div>
          <span className="font-mono text-[10px]" style={{ color: "#6b6780" }}>
            bitstring distribution comparison
          </span>
        </div>

        <p
          className="font-mono text-[10px] leading-relaxed"
          style={{ color: "#6b6780" }}
        >
          Runs the full measurement circuit for α = {alpha.toFixed(4)} (honest)
          and α_fake = {alphaFake.toFixed(4)} (adversarial) on Aer and compares
          the resulting bitstring distributions.
        </p>

        <Button
          onClick={run}
          disabled={loadState === "loading"}
          variant="primary"
          size="sm"
        >
          {loadState === "loading"
            ? "Running circuits…"
            : "Run Circuit Comparison"}
        </Button>

        {loadState === "error" && (
          <p className="font-mono text-[10px]" style={{ color: "#f87171" }}>
            Error: {errorMsg}
          </p>
        )}

        {loadState === "done" && result && (
          <div className="space-y-3">
            {/* Bitstring distribution grouped bar chart */}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                barCategoryGap="25%"
                barGap={2}
              >
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="state"
                  tick={{
                    fontFamily: CHART_FONT.family,
                    fontSize: CHART_FONT.size,
                    fill: CHART_FONT.fill,
                  }}
                  axisLine={{ stroke: "rgba(46,43,58,0.5)", strokeWidth: 0.5 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, "dataMax"]}
                  tickCount={5}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  {...axisProps}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: CHART_FONT.family,
                    fontSize: CHART_FONT.size,
                    color: CHART_FONT.fill,
                  }}
                />
                <Bar
                  dataKey="honest"
                  name="Honest"
                  fill={CHART_COLORS.theoretical}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="adversarial"
                  name="Adversarial"
                  fill={CHART_COLORS.estimated}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Energy + verdict comparison */}
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { label: "Honest", key: "honest" as const },
                  { label: "Adversarial", key: "adversarial" as const },
                ] as const
              ).map(({ label, key }) => (
                <div
                  key={key}
                  className="p-2 space-y-1 rounded"
                  style={{ background: "#181620", border: "1px solid #2d2b3a" }}
                >
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: "#9490a8" }}
                  >
                    {label}
                  </div>
                  <div
                    className="font-mono text-sm font-bold"
                    style={{ color: "#ddd9ee" }}
                  >
                    E = {result[key].energy.toFixed(4)}
                  </div>
                  <div
                    className="font-mono text-[10px] font-semibold"
                    style={{ color: verdictColor(result[key].verdict) }}
                  >
                    {result[key].verdict}
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div
              className="p-3 rounded"
              style={{ background: "#181620", border: "1px solid #2d2b3a" }}
            >
              <div
                className="font-mono text-[10px] mb-2"
                style={{ color: "#9490a8" }}
              >
                distribution metrics
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div
                    className="font-mono text-[9px]"
                    style={{ color: "#6b6780" }}
                  >
                    TVD
                  </div>
                  <div
                    className="font-mono text-xs font-bold"
                    style={{ color: "#e8a020" }}
                  >
                    {result.metrics.tvd.toFixed(4)}
                  </div>
                  <div
                    className="font-mono text-[9px]"
                    style={{ color: "#6b6780" }}
                  >
                    total variation
                  </div>
                </div>
                <div>
                  <div
                    className="font-mono text-[9px]"
                    style={{ color: "#6b6780" }}
                  >
                    KL div
                  </div>
                  <div
                    className="font-mono text-xs font-bold"
                    style={{ color: "#a78bfa" }}
                  >
                    {result.metrics.kl_honest_to_fake.toFixed(4)}
                  </div>
                  <div
                    className="font-mono text-[9px]"
                    style={{ color: "#6b6780" }}
                  >
                    nats
                  </div>
                </div>
                <div>
                  <div
                    className="font-mono text-[9px]"
                    style={{ color: "#6b6780" }}
                  >
                    ΔE
                  </div>
                  <div
                    className="font-mono text-xs font-bold"
                    style={{ color: "#34d399" }}
                  >
                    {result.metrics.delta_energy.toFixed(4)}
                  </div>
                  <div
                    className="font-mono text-[9px]"
                    style={{ color: "#6b6780" }}
                  >
                    energy gap
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
