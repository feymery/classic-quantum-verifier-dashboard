import { useMemo } from "react";

import { buildClockState } from "../../modules/oneQubit/physics/hamiltonian";
import { CHART_COLORS } from "./chartTheme";
import type { Counts } from "../../modules/oneQubit/physics/measurements";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { ShotHistogramChart } from "./ShotHistogramChart";
import { ShotHistogramMeta } from "./ShotHistogramMeta";
import type { LegendType } from "./ShotHistogram.types";

interface ShotHistogramProps {
  counts: Counts | null;
  shots: number;
  alpha: number;
}

const BASIS_STATES = ["00", "01", "10", "11"] as const;

const STATE_COLORS: Record<string, string> = {
  "00": "#a78bfa",
  "01": "#9490a8",
  "10": "#a78bfa",
  "11": "#34d399",
};

export function ShotHistogram({ counts, shots, alpha }: ShotHistogramProps) {
  // Born-rule expected probabilities from the exact statevector
  const expected = useMemo(() => {
    const psi = buildClockState(alpha);
    return Object.fromEntries(
      psi.map(([r, i], idx) => [BASIS_STATES[idx], r * r + i * i]),
    );
  }, [alpha]);

  const data = useMemo(
    () =>
      BASIS_STATES.map((state) => {
        const count = counts?.[state] ?? 0;
        const observed = shots > 0 ? count / shots : 0;
        const exp = expected[state] ?? 0;
        return {
          state,
          count,
          observed,
          expected: exp,
          expectedState: exp > 0.001,
        };
      }),
    [counts, shots, expected],
  );

  const leakage = useMemo(() => {
    if (!counts || shots <= 0) return 0;
    const leakedCounts = data
      .filter((row) => !row.expectedState)
      .reduce((acc, row) => acc + row.count, 0);
    return leakedCounts / shots;
  }, [counts, data, shots]);

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StepTag>step D</StepTag>
            <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
              Shot Histogram
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Legend
              type="bar"
              color="#a78bfa55"
              border="#a78bfa"
              label="observed freq."
            />
            <Legend
              type="line"
              color={CHART_COLORS.theoretical}
              label="expected (Born)"
            />
            <Legend type="chip" color="#34d399" label="expected state" />
            <Legend type="chip" color="#f87171" label="non-expected" />
          </div>
        </div>

        {/* Empty state */}
        <ShotHistogramChart
          data={data}
          hasCounts={Boolean(counts)}
          stateColors={STATE_COLORS}
        />

        {/* Expected probability diamond overlay */}
        {counts && (
          <ShotHistogramMeta
            data={data}
            shots={shots}
            leakage={leakage}
            totalCounts={Object.values(counts).reduce((a, b) => a + b, 0)}
          />
        )}
      </div>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Legend({
  type,
  color,
  border,
  label,
}: {
  type: LegendType;
  color: string;
  border?: string;
  label: string;
}) {
  const marker =
    type === "bar" ? (
      <div
        style={{
          width: 10,
          height: 10,
          background: color,
          border: `1px solid ${border ?? color}`,
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
    ) : type === "line" ? (
      <div
        style={{
          width: 10,
          height: 10,
          border: `1.5px solid ${color}`,
          transform: "rotate(45deg)",
          flexShrink: 0,
        }}
      />
    ) : (
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
    );

  return (
    <div className="flex items-center gap-1.5">
      {marker}
      <span className=" text-[10px]" style={{ color: "#9490a8" }}>
        {label}
      </span>
    </div>
  );
}

function StepTag({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="quantum" className="rounded px-1.5 py-0.5  text-[10px]">
      {children}
    </Badge>
  );
}
