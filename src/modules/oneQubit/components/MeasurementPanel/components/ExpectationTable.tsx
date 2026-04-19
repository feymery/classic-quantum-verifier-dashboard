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
      <div
        className="grid grid-cols-[1fr_72px_72px_72px] gap-x-2 pb-1 border-b"
        style={{ borderColor: "#2d2b3a" }}
      >
        <span className=" text-[10px]" style={{ color: "#6b6780" }}>
          observable
        </span>
        <span className=" text-[10px] text-right" style={{ color: "#6b6780" }}>
          sampled
        </span>
        {exact && (
          <span
            className=" text-[10px] text-right"
            style={{ color: "#6b6780" }}
          >
            theoretical
          </span>
        )}
        {exact && (
          <span
            className=" text-[10px] text-right"
            style={{ color: "#6b6780" }}
          >
            Δ
          </span>
        )}
      </div>

      {OBSERVABLES.map(({ key, label, desc }) => {
        const sampledVal = sampled?.[key];
        const exactVal = exact?.[key];
        const isLoading = loading;

        return (
          <div
            key={key}
            className="grid grid-cols-[1fr_72px_72px_72px] gap-x-2 py-1.5 border-b"
            style={{ borderColor: "#1e1c28" }}
          >
            {/* Label + desc */}
            <div className="flex flex-col gap-0.5">
              <span className=" text-[11px]" style={{ color: "#ddd9ee" }}>
                {label}
              </span>
              <span
                className="text-[9px] leading-none"
                style={{ color: "#6b6780" }}
              >
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
                <span className=" text-[11px]" style={{ color: "#6b6780" }}>
                  —
                </span>
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
                  <span className=" text-[11px]" style={{ color: "#6b6780" }}>
                    —
                  </span>
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
                  <span className=" text-[11px]" style={{ color: "#6b6780" }}>
                    —
                  </span>
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
  const color = dim
    ? "#6b6780"
    : value > 0
      ? "#e8a020"
      : value < 0
        ? "#a78bfa"
        : "#ddd9ee";
  const sign = value > 0 ? "+" : "";
  return (
    <span className=" text-[11px] tabular-nums" style={{ color }}>
      {sign}
      {value.toFixed(4)}
    </span>
  );
}

function LoadingDots() {
  return (
    <span className=" text-[11px]" style={{ color: "#6b6780" }}>
      ···
    </span>
  );
}

function DeltaCell({ value }: { value: number }) {
  const color = Math.abs(value) < 0.02 ? "#34d399" : "#f59e0b";
  const sign = value > 0 ? "+" : "";
  return (
    <span className=" text-[11px] tabular-nums" style={{ color }}>
      {sign}
      {value.toFixed(4)}
    </span>
  );
}
