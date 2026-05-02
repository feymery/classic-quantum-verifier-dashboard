import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import type { Counts } from "../../../physics/measurements";
import {
  HISTOGRAM_HEIGHT,
  CHART_COLORS,
  BASIS_STATE_COLORS,
  BASIS_STATE_COLORS_DIM,
  NON_EXPECTED_COLOR,
  NON_EXPECTED_COLOR_DIM,
  axisProps,
  gridProps,
} from "../../../../../components/charts/chartTheme";
import { ChartTooltip } from "../../../../../components/charts/ChartTooltip";
import { ChartLegendItem } from "../../../../../components/charts/ChartLegend";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BasisDatum {
  state: string;
  count: number;
  observed: number;
  expected: number;
  expectedState: boolean;
}

export interface BasisMeasurementSectionProps {
  /** Section label, e.g. "ZZ basis · computational" */
  label: string;
  /** Ordered list of basis state labels, e.g. ["00","01","10","11"] */
  states: readonly string[];
  /** Color per state key */
  stateColors: Record<string, string>;
  /** Raw measurement counts */
  counts: Counts | null;
  /** Born-rule (exact) probabilities per state key */
  expectedProbs: Record<string, number>;
  shots: number;
  loading: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BasisMeasurementSection({
  label,
  states,
  stateColors,
  counts,
  expectedProbs,
  shots,
  loading,
}: BasisMeasurementSectionProps) {
  const data: BasisDatum[] = useMemo(
    () =>
      states.map((state) => {
        const count = counts?.[state] ?? 0;
        const observed = shots > 0 ? count / shots : 0;
        const expected = expectedProbs[state] ?? 0;
        return {
          state,
          count,
          observed,
          expected,
          expectedState: expected > 0.001,
        };
      }),
    [states, counts, shots, expectedProbs],
  );

  const leakage = useMemo(() => {
    if (!counts || shots <= 0) return 0;
    return (
      data
        .filter((d) => !d.expectedState)
        .reduce((acc, d) => acc + d.count, 0) / shots
    );
  }, [counts, data, shots]);

  const totalCounts = useMemo(
    () => (counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0),
    [counts],
  );

  const maxObserved = useMemo(
    () => Math.max(...data.map((d) => d.observed), 0.01),
    [data],
  );

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-subtle">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <ChartLegendItem
            type="bar"
            color={BASIS_STATE_COLORS["00"]}
            label="observed"
          />
          <ChartLegendItem
            type="diamond"
            color={CHART_COLORS.theoretical}
            label="Born-rule"
          />
        </div>
      </div>

      {/* Chart */}
      {!loading && counts ? (
        <ResponsiveContainer width="100%" height={HISTOGRAM_HEIGHT}>
          <BarChart
            data={data}
            margin={{ top: 6, right: 4, bottom: 0, left: -16 }}
            barSize={28}
          >
            <CartesianGrid {...gridProps} vertical={false} />
            <XAxis
              dataKey="state"
              {...axisProps}
              tickFormatter={(v: string) => `|${v}⟩`}
            />
            <YAxis
              {...axisProps}
              domain={[0, Math.min(1, maxObserved * 1.25)]}
              tickFormatter={(v: number) => v.toFixed(1)}
            />

            {/* Born-rule reference lines per state as thin dashed marks */}
            {data.map((d) => (
              <ReferenceLine
                key={`ref-${d.state}`}
                x={d.state}
                y={d.expected}
                stroke={CHART_COLORS.theoretical}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            ))}

            <Bar
              dataKey="observed"
              name="observed"
              radius={[3, 3, 0, 0]}
              isAnimationActive
              animationDuration={400}
            >
              {data.map((d) => (
                <Cell
                  key={d.state}
                  fill={
                    d.expectedState
                      ? (BASIS_STATE_COLORS_DIM[d.state] ??
                        BASIS_STATE_COLORS_DIM["00"])
                      : NON_EXPECTED_COLOR_DIM
                  }
                  stroke={
                    d.expectedState
                      ? (stateColors[d.state] ?? BASIS_STATE_COLORS[d.state])
                      : NON_EXPECTED_COLOR
                  }
                  strokeWidth={1}
                />
              ))}
            </Bar>

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload as BasisDatum;
                return (
                  <ChartTooltip
                    active={active}
                    payload={payload}
                    title={`|${d.state}⟩`}
                    rows={[
                      {
                        label: "observed",
                        value: d.observed.toFixed(4),
                        color:
                          stateColors[d.state] ?? BASIS_STATE_COLORS[d.state],
                      },
                      {
                        label: "Born-rule",
                        value: d.expected.toFixed(4),
                        color: CHART_COLORS.theoretical,
                      },
                      {
                        label: "counts",
                        value: String(d.count),
                        color: BASIS_STATE_COLORS["01"],
                      },
                      {
                        label: "Δ",
                        value: `${d.observed - d.expected >= 0 ? "+" : ""}${(d.observed - d.expected).toFixed(4)}`,
                        color:
                          Math.abs(d.observed - d.expected) < 0.03
                            ? CHART_COLORS.accept
                            : CHART_COLORS.thresholdHigh,
                      },
                    ]}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="flex items-center justify-center rounded border text-[10px]"
          style={{
            height: HISTOGRAM_HEIGHT,
            borderColor: "var(--color-border)",
            color: loading ? "var(--color-accent)" : "var(--color-subtle)",
          }}
        >
          {loading ? "running…" : "run experiment to see distribution"}
        </div>
      )}

      {/* Numeric counts table */}
      {!loading && (
        <div className="space-y-1">
          {data.map(({ state, count, observed, expected, expectedState }) => {
            const color = stateColors[state] ?? BASIS_STATE_COLORS["00"];
            const maxCount = counts ? Math.max(1, ...Object.values(counts)) : 1;
            const barPct = counts ? (count / maxCount) * 100 : 0;
            return (
              <div
                key={state}
                className="flex items-center gap-2"
                aria-label={`State |${state}⟩: ${count} counts (${(observed * 100).toFixed(1)}%)`}
              >
                <span
                  className="text-[11px] w-5 text-center shrink-0"
                  style={{ color: expectedState ? color : NON_EXPECTED_COLOR }}
                >
                  {state}
                </span>
                <div className="flex-1 h-2.5 rounded-sm bg-border">
                  {counts && (
                    <div
                      className="h-full transition-all duration-500 rounded-sm"
                      style={{
                        width: `${barPct}%`,
                        background: expectedState
                          ? (BASIS_STATE_COLORS_DIM[state] ??
                            BASIS_STATE_COLORS_DIM["00"])
                          : NON_EXPECTED_COLOR_DIM,
                        borderRight: `2px solid ${expectedState ? color : NON_EXPECTED_COLOR}`,
                        minWidth: count > 0 ? 2 : 0,
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1.5 w-32 justify-end shrink-0">
                  <span
                    className="text-[11px] tabular-nums"
                    style={{
                      color: expectedState ? color : NON_EXPECTED_COLOR,
                    }}
                  >
                    {count}
                  </span>
                  <span className="text-[10px] tabular-nums text-subtle">
                    ({(observed * 100).toFixed(1)}%)
                  </span>
                  <span
                    className="text-[9px] tabular-nums"
                    style={{ color: CHART_COLORS.theoretical }}
                  >
                    B:{(expected * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: leakage + legend note */}
      <div
        className="flex items-center gap-4 border-t pt-1 text-[9px] text-subtle"
        style={{ borderColor: "var(--color-elevated)" }}
      >
        <span>{shots.toLocaleString()} shots</span>
        <span>q₀=clock (left) · q₁=work (right)</span>
        {counts && (
          <span
            style={{
              color:
                leakage < 0.02
                  ? "var(--color-success)"
                  : leakage < 0.05
                    ? "var(--color-warning)"
                    : "var(--color-danger)",
            }}
          >
            leakage={(leakage * 100).toFixed(2)}%
          </span>
        )}
        {counts && (
          <span className="ml-auto">total={totalCounts.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}
