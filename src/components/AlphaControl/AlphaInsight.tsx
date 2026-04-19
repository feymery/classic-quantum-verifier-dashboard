import {
  KEY_ALPHAS,
  THRESHOLD_HIGH,
  THRESHOLD_LOW,
} from "../../utils/constants";
import {
  energy,
  formatAlpha,
  nearestKeyIndex,
  verifierDecision,
} from "../../utils/alphaUtils";

interface AlphaInsightProps {
  alpha: number;
}

const DECISION_STYLES = {
  accept: { color: "#34d399", label: "ACCEPT" },
  reject: { color: "#f87171", label: "REJECT" },
  boundary: { color: "#f59e0b", label: "BOUNDARY" },
} as const;

export function AlphaInsight({ alpha }: AlphaInsightProps) {
  const e = energy(alpha);
  const keyValues = KEY_ALPHAS.map((k) => k.value);
  const snappedIdx = nearestKeyIndex(alpha, keyValues);
  const decision = verifierDecision(e, THRESHOLD_LOW, THRESHOLD_HIGH);
  const style = DECISION_STYLES[decision];
  const preset = snappedIdx >= 0 ? KEY_ALPHAS[snappedIdx] : null;

  return (
    <div
      className="rounded border p-3 space-y-2.5 transition-colors duration-200"
      style={{
        background: preset ? `${preset.color}08` : "#181620",
        borderColor: preset ? `${preset.color}33` : "#2d2b3a",
      }}
    >
      {/* Current value row */}
      <div className="flex items-center justify-between">
        <span className=" text-[11px]" style={{ color: "#9490a8" }}>
          current α
        </span>
        <span
          className="text-sm font-semibold "
          style={{ color: preset?.color ?? "#ddd9ee" }}
        >
          {formatAlpha(alpha)} = {alpha.toFixed(4)}
        </span>
      </div>

      {/* Energy row */}
      <div className="flex items-center justify-between">
        <span className=" text-[11px]" style={{ color: "#9490a8" }}>
          E = sin²(α)
        </span>
        <span className="text-sm " style={{ color: "#e8a020" }}>
          {e.toFixed(4)}
        </span>
      </div>

      {/* Threshold comparison */}
      <div className="space-y-1">
        <ThresholdBar
          value={e}
          low={THRESHOLD_LOW}
          high={THRESHOLD_HIGH}
          color={preset?.color}
        />
      </div>

      {/* Verifier decision */}
      <div
        className="flex items-center justify-between pt-0.5 border-t"
        style={{ borderColor: "#2d2b3a" }}
      >
        <span className=" text-[11px]" style={{ color: "#9490a8" }}>
          verifier
        </span>
        <span
          className=" text-[11px] font-semibold tracking-widest"
          style={{ color: style.color }}
        >
          {style.label}
        </span>
      </div>

      {/* Protocol insight (only when snapped to a preset) */}
      {preset && (
        <p
          className="text-[10px] leading-relaxed pt-0.5 border-t"
          style={{ color: "#9490a8", borderColor: "#2d2b3a" }}
        >
          {preset.insight}
        </p>
      )}
    </div>
  );
}

// ── Mini threshold bar ────────────────────────────────────────────────────────

function ThresholdBar({
  value,
  low,
  high,
  color,
}: {
  value: number;
  low: number;
  high: number;
  color?: string;
}) {
  const pct = value * 100; // value is already 0–1

  return (
    <div className="space-y-1">
      <div className="relative h-1.5 w-full rounded-lg bg-border">
        {/* Reject zone */}
        <div
          className="absolute top-0 left-0 h-full rounded-l-full bg-danger/20"
          style={{ width: `${low * 100}%` }}
        />
        {/* Boundary zone */}
        <div
          className="absolute top-0 h-full bg-warning/20"
          style={{ left: `${low * 100}%`, width: `${(high - low) * 100}%` }}
        />
        {/* Accept zone */}
        <div
          className="absolute top-0 right-0 h-full rounded-r-full bg-success/20"
          style={{ width: `${(1 - high) * 100}%` }}
        />
        {/* Current energy marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-lg border-2 transition-all duration-100"
          style={{
            left: `${Math.min(pct, 100)}%`,
            borderColor: color ?? "#a78bfa",
            background: "#0f0e14",
            boxShadow: `0 0 6px ${color ?? "#a78bfa"}`,
          }}
        />
        {/* Threshold lines */}
        <div
          className="absolute top-0 w-px h-full bg-danger/60"
          style={{ left: `${low * 100}%` }}
        />
        <div
          className="absolute top-0 w-px h-full bg-warning/60"
          style={{ left: `${high * 100}%` }}
        />
      </div>

      {/* Labels */}
      <div className="relative w-full">
        <span
          className="absolute -translate-x-1/2  text-[9px]"
          style={{ left: `${low * 100}%`, color: "#f87171aa" }}
        >
          {low}
        </span>
        <span
          className="absolute -translate-x-1/2  text-[9px]"
          style={{ left: `${high * 100}%`, color: "#f59e0baa" }}
        >
          {high}
        </span>
        <span
          className="absolute right-0  text-[9px]"
          style={{ color: "#34d399aa" }}
        >
          1
        </span>
      </div>
    </div>
  );
}
