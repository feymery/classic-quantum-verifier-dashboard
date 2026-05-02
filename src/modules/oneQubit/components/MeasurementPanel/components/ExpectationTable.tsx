import type {
  SampledExpectations,
  ExactExpectations,
} from "../../../physics/measurements";

interface ExpectationTableProps {
  sampled: SampledExpectations | null;
  exact?: ExactExpectations | null;
  loading: boolean;
}

const OBSERVABLES: {
  key: keyof SampledExpectations;
  label: string;
  desc: string;
}[] = [
  { key: "Z1Z2", label: "⟨Z₁Z₂⟩", desc: "ZZ correlator — clock·work" },
  { key: "X1X2", label: "⟨X₁X₂⟩", desc: "XX correlator — clock·work" },
  { key: "X1Z2", label: "⟨X₁Z₂⟩", desc: "XZ correlator — clock·work" },
  { key: "Z1", label: "⟨Z₁⟩", desc: "clock qubit magnetisation" },
  { key: "Z2", label: "⟨Z₂⟩", desc: "work qubit magnetisation" },
];

export function ExpectationTable({
  sampled,
  exact,
  loading,
}: ExpectationTableProps) {
  return (
    <div className="space-y-px">
      {/* Header */}
      <div className="grid grid-cols-[1fr_72px_72px_72px] gap-x-2 pb-1 border-b border-border">
        <span className="text-[10px] text-subtle">observable</span>
        <span className="text-[10px] text-right text-subtle">sampled</span>
        {exact && (
          <span className="text-[10px] text-right text-subtle">
            theoretical
          </span>
        )}
        {exact && <span className="text-[10px] text-right text-subtle">Δ</span>}
      </div>

      {OBSERVABLES.map(({ key, label, desc }) => {
        const sampledVal = sampled?.[key];
        const exactVal = exact?.[key];
        const isLoading = loading;

        return (
          <div
            key={key}
            className="grid grid-cols-[1fr_72px_72px_72px] gap-x-2 py-1.5 border-b border-elevated"
          >
            {/* Label + desc */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-foreground">{label}</span>
              <span className="text-[9px] leading-none text-subtle">
                {desc}
              </span>
            </div>

            {/* Sampled value */}
            <div className="text-right">
              {isLoading ? (
                <LoadingDots />
              ) : sampledVal !== undefined ? (
                <ValueCell value={sampledVal} />
              ) : (
                <span className="text-[11px] text-subtle">—</span>
              )}
            </div>

            {/* Exact value (optional comparison column) */}
            {exact !== undefined && (
              <div className="text-right">
                {isLoading ? (
                  <LoadingDots />
                ) : exactVal !== undefined ? (
                  <ValueCell value={exactVal} dim />
                ) : (
                  <span className="text-[11px] text-subtle">—</span>
                )}
              </div>
            )}

            {/* Deviation sampled - exact */}
            {exact !== undefined && (
              <div className="text-right">
                {isLoading ? (
                  <LoadingDots />
                ) : sampledVal !== undefined && exactVal !== undefined ? (
                  <DeltaCell value={sampledVal - exactVal} />
                ) : (
                  <span className="text-[11px] text-subtle">—</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ValueCell({ value, dim }: { value: number; dim?: boolean }) {
  const colorClass = dim
    ? "text-subtle"
    : value > 0
      ? "text-gold"
      : value < 0
        ? "text-accent"
        : "text-foreground";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`text-[11px] tabular-nums ${colorClass}`}>
      {sign}
      {value.toFixed(4)}
    </span>
  );
}

function LoadingDots() {
  return <span className="text-[11px] text-subtle">···</span>;
}

function DeltaCell({ value }: { value: number }) {
  const colorClass = Math.abs(value) < 0.02 ? "text-success" : "text-warning";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`text-[11px] tabular-nums ${colorClass}`}>
      {sign}
      {value.toFixed(4)}
    </span>
  );
}
