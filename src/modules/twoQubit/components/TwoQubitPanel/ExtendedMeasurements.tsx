import type {
  SampledExpectations2Q,
  ExactExpectations2Q,
} from "../../physics/measurements2Q";
import { Card } from "../../../../ui/Card";
import { StepTag } from "./StepTag";
import { ExtendedEnergySummary } from "./ExtendedEnergySummary";
import { ROWS, SPECIAL_COLORS } from "./extendedMeasurementsConfig";

interface ExtendedMeasurementsProps {
  sampled: SampledExpectations2Q | null;
  exact?: ExactExpectations2Q | null;
  energy: {
    estimated: number;
    theoretical: number;
    cnot_signature: number;
    decision: string;
  } | null;
  loading: boolean;
}

export function ExtendedMeasurements({
  sampled,
  exact,
  energy,
  loading,
}: ExtendedMeasurementsProps) {
  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <StepTag>step E</StepTag>
          <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
            Extended Measurements
          </span>
          <span
            className="font-mono text-[10px] ml-auto"
            style={{ color: "#6b6780" }}
          >
            10 observables
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {(["primary", "crosscheck", "cnot"] as const).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: SPECIAL_COLORS[k] }}
              />
              <span
                className="font-mono text-[9px]"
                style={{ color: "#6b6780" }}
              >
                {k === "primary"
                  ? "energy primary"
                  : k === "crosscheck"
                    ? "cross-check"
                    : "CNOT signature"}
              </span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="space-y-px">
          {/* Header row */}
          <div
            className="grid pb-1 border-b gap-x-2"
            style={{
              gridTemplateColumns: "1fr 80px 80px",
              borderColor: "#2d2b3a",
            }}
          >
            <span
              className="font-mono text-[10px]"
              style={{ color: "#6b6780" }}
            >
              observable
            </span>
            <span
              className="font-mono text-[10px] text-right"
              style={{ color: "#6b6780" }}
            >
              sampled
            </span>
            <span
              className="font-mono text-[10px] text-right"
              style={{ color: "#6b6780" }}
            >
              exact
            </span>
          </div>

          {ROWS.map(({ key, label, desc, special }) => {
            const sv = sampled?.[key];
            const ev = exact?.[key];
            const accentColor = special ? SPECIAL_COLORS[special] : undefined;

            return (
              <div
                key={key}
                className="grid gap-x-2 py-1.5 border-b"
                style={{
                  gridTemplateColumns: "1fr 80px 80px",
                  borderColor: "#1e1c28",
                  background:
                    special === "cnot" && sampled
                      ? "rgba(52,211,153,0.04)"
                      : undefined,
                }}
              >
                <div className="flex items-center gap-1.5">
                  {special && (
                    <div
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ background: SPECIAL_COLORS[special] }}
                    />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: accentColor ?? "#ddd9ee" }}
                    >
                      {label}
                    </span>
                    <span className="text-[9px]" style={{ color: "#6b6780" }}>
                      {desc}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {loading ? (
                    <Dots />
                  ) : sv !== undefined ? (
                    <Val v={sv} color={accentColor} />
                  ) : (
                    <Dash />
                  )}
                </div>

                <div className="text-right">
                  {loading ? (
                    <Dots />
                  ) : ev !== undefined ? (
                    <Val v={ev} dim />
                  ) : (
                    <Dash />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Energy summary */}
        {energy && !loading && <ExtendedEnergySummary energy={energy} />}
      </div>
    </Card>
  );
}

// ── Micro-components ──────────────────────────────────────────────────────────

function Val({ v, color, dim }: { v: number; color?: string; dim?: boolean }) {
  const c = dim
    ? "#6b6780"
    : (color ?? (v > 0 ? "#e8a020" : v < 0 ? "#a78bfa" : "#ddd9ee"));
  return (
    <span
      className="font-mono text-[11px]"
      style={{ color: c, fontVariantNumeric: "tabular-nums" }}
    >
      {v >= 0 ? "+" : ""}
      {v.toFixed(4)}
    </span>
  );
}

function Dots() {
  return (
    <span className="font-mono text-[11px]" style={{ color: "#6b6780" }}>
      ···
    </span>
  );
}

function Dash() {
  return (
    <span className="font-mono text-[11px]" style={{ color: "#6b6780" }}>
      —
    </span>
  );
}
