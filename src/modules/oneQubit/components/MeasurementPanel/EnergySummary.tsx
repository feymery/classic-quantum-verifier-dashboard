import type { EnergyAnalysis, VerifierDecision } from "../../../../physics/energy";
import { EnergyCell, MarginCell, ThresholdSection } from "./EnergySummaryParts";

interface EnergySummaryProps {
  analysis: EnergyAnalysis | null;
  loading: boolean;
}

const DECISION_CONFIG: Record<
  VerifierDecision,
  { color: string; bg: string; border: string; label: string }
> = {
  accept: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.3)",
    label: "ACCEPT",
  },
  reject: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.3)",
    label: "REJECT",
  },
  boundary: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
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
          color="#a78bfa"
        />
        <EnergyCell
          label="estimated"
          value={analysis?.estimated}
          loading={loading}
          color="#e8a020"
        />
      </div>

      {/* Deviation */}
      {analysis && !loading && (
        <div
          className="flex items-center justify-between px-2 py-1 rounded border"
          style={{ background: "#181620", borderColor: "#2d2b3a" }}
        >
          <span className="font-mono text-[10px]" style={{ color: "#6b6780" }}>
            deviation
          </span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{
                color:
                  Math.abs(analysis.deviation) < 0.01 ? "#34d399" : "#f59e0b",
              }}
            >
              {analysis.deviation >= 0 ? "+" : ""}
              {analysis.deviation.toFixed(4)}
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#6b6780" }}
            >
              ({analysis.relativePct.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      {/* Threshold bar */}
      <ThresholdSection value={analysis?.estimated} loading={loading} />

      {/* Verifier decision */}
      {cfg && analysis && !loading ? (
        <div
          className="flex items-center justify-between rounded px-3 py-2 border"
          style={{ background: cfg.bg, borderColor: cfg.border }}
        >
          <span className="font-mono text-[11px]" style={{ color: cfg.color }}>
            verifier decision
          </span>
          <span
            className="font-mono text-sm font-semibold tracking-widest"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
      ) : (
        <div
          className="rounded px-3 py-2 border"
          style={{ background: "#181620", borderColor: "#2d2b3a" }}
        >
          <span className="font-mono text-[10px]" style={{ color: "#6b6780" }}>
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
