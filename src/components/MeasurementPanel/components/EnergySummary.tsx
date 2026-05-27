import type { EnergyAnalysis, VerifierDecision } from "../../../physics/energy";
import { EnergyCell, MarginCell, ThresholdSection } from "./EnergySummaryParts";

interface EnergySummaryProps {
  analysis: EnergyAnalysis | null;
  loading: boolean;
}

const DECISION_CONFIG: Record<
  VerifierDecision,
  { classes: string; label: string }
> = {
  accept: {
    classes: "text-success bg-success/8 border-success/30",
    label: "ACCEPT",
  },
  reject: {
    classes: "text-danger  bg-danger/8  border-danger/30",
    label: "REJECT",
  },
  boundary: {
    classes: "text-warning bg-warning/8 border-warning/30",
    label: "BOUNDARY",
  },
};

export function EnergySummary({ analysis, loading }: EnergySummaryProps) {
  const cfg = analysis ? DECISION_CONFIG[analysis.decision] : null;

  return (
    <div className="space-y-2.5">
      {/* Energy values row */}
      <div className="grid grid-cols-2 gap-2">
        <EnergyCell
          label="theoretical"
          value={analysis?.theoretical}
          loading={loading}
          color="var(--color-accent)"
        />
        <EnergyCell
          label="estimated"
          value={analysis?.estimated}
          loading={loading}
          color="var(--color-gold)"
        />
      </div>

      {/* Deviation */}
      {analysis && !loading && (
        <div className="flex items-center justify-between px-2 py-1 rounded border bg-surface border-border">
          <span className="text-[10px] text-subtle">deviation</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] tabular-nums ${
                analysis.deviation != null &&
                Math.abs(analysis.deviation) < 0.01
                  ? "text-success"
                  : "text-warning"
              }`}
            >
              {analysis.deviation != null
                ? analysis.deviation >= 0
                  ? "+"
                  : ""
                : ""}
              {analysis.deviation?.toFixed(4) ?? "—"}
            </span>
            <span className="text-[10px] text-subtle">
              ({analysis.relativePct?.toFixed(1) ?? "—"}%)
            </span>
          </div>
        </div>
      )}

      {/* Threshold bar */}
      <ThresholdSection value={analysis?.estimated} loading={loading} />

      {/* Verifier decision */}
      {cfg && analysis && !loading ? (
        <div
          className={`flex items-center justify-between rounded px-3 py-2 border ${cfg.classes}`}
        >
          <span className="text-[11px]">verifier decision</span>
          <span className="text-sm font-semibold tracking-widest">
            {cfg.label}
          </span>
        </div>
      ) : (
        <div className="rounded px-3 py-2 border bg-surface border-border">
          <span className="text-[10px] text-subtle">
            {loading ? "computing…" : "run experiment to get decision"}
          </span>
        </div>
      )}

      {/* Margin info */}
      {analysis && !loading && (
        <div className="grid grid-cols-2 gap-2">
          <MarginCell label="margin / low" value={analysis.marginLow} />
          <MarginCell label="margin / high" value={analysis.marginHigh} />
        </div>
      )}
    </div>
  );
}
