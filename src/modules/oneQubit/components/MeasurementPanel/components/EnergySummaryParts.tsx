import { THRESHOLD_HIGH, THRESHOLD_LOW } from "../../../../../utils/constants";

interface EnergyCellProps {
  label: string;
  value?: number;
  loading: boolean;
  color: string;
}

interface MarginCellProps {
  label: string;
  value: number;
}

interface ThresholdSectionProps {
  value?: number;
  loading: boolean;
}

export function EnergyCell({ label, value, loading, color }: EnergyCellProps) {
  return (
    <div className="rounded border p-2.5 flex flex-col gap-1 bg-surface border-border">
      <span className="text-[10px] text-subtle">{label}</span>
      <span className="text-base tabular-nums" style={{ color }}>
        {loading ? "···" : value != null ? value.toFixed(4) : "—"}
      </span>
    </div>
  );
}

export function MarginCell({ label, value }: MarginCellProps) {
  const isPos = value >= 0;
  return (
    <div className="rounded border px-2 py-1.5 flex items-center justify-between bg-surface border-border">
      <span className="text-[9px] text-subtle">{label}</span>
      <span
        className={`text-[11px] tabular-nums ${isPos ? "text-success" : "text-danger"}`}
      >
        {isPos ? "+" : ""}
        {value != null ? value.toFixed(4) : "—"}
      </span>
    </div>
  );
}

export function ThresholdSection({ value, loading }: ThresholdSectionProps) {
  if (loading) {
    return (
      <div className="p-2 border rounded bg-surface border-border">
        <span className="text-[10px] text-subtle">···</span>
      </div>
    );
  }

  if (value == null) {
    return (
      <div className="p-2 border rounded bg-surface border-border">
        <span className="text-[10px] text-subtle">—</span>
      </div>
    );
  }

  const pct = value * 100;

  return (
    <div className="space-y-1">
      <div className="relative h-1.5 w-full rounded-lg bg-border">
        <div
          className="absolute top-0 left-0 h-full rounded-l-full bg-danger/20"
          style={{ width: `${THRESHOLD_LOW * 100}%` }}
        />
        <div
          className="absolute top-0 h-full bg-warning/20"
          style={{
            left: `${THRESHOLD_LOW * 100}%`,
            width: `${(THRESHOLD_HIGH - THRESHOLD_LOW) * 100}%`,
          }}
        />
        <div
          className="absolute top-0 right-0 h-full rounded-r-full bg-success/20"
          style={{ width: `${(1 - THRESHOLD_HIGH) * 100}%` }}
        />
        {value !== undefined && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-lg border-2 transition-all duration-100"
            style={{
              left: `${Math.min(pct, 100)}%`,
              borderColor: "var(--color-gold)",
              background: "var(--color-canvas)",
              boxShadow: "0 0 6px var(--color-gold)",
            }}
          />
        )}
      </div>

      <div className="relative w-full h-4">
        <span
          className="absolute text-[9px] -translate-x-1/2 text-danger/70"
          style={{ left: `${THRESHOLD_LOW * 100}%` }}
        >
          {THRESHOLD_LOW}
        </span>
        <span
          className="absolute text-[9px] -translate-x-1/2 text-warning/70"
          style={{ left: `${THRESHOLD_HIGH * 100}%` }}
        >
          {THRESHOLD_HIGH}
        </span>
        <span className="absolute right-0 text-[9px] text-success/50">1</span>
        <span className="absolute left-0 text-[9px] text-danger/50">0</span>
      </div>
    </div>
  );
}
