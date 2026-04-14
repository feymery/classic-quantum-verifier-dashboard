import { StepTag } from "./StepTag";
import { ROWS, SUMMARY } from "./complexityRows";

export function ComplexityComparison() {
  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      style={{ background: "#1e1c26", borderColor: "#2d2b3a" }}
    >
      <div className="flex items-center gap-2">
        <StepTag>step E</StepTag>
        <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
          1-Qubit vs 2-Qubit
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="observables" value={SUMMARY.observablesGrowth} />
        <MetricCard label="basis states" value={SUMMARY.basisGrowth} />
        <MetricCard
          label="sampling effort"
          value={SUMMARY.expectedShotMultiplier}
        />
      </div>

      {/* Column headers */}
      <div
        className="grid gap-x-3 pb-1.5 border-b"
        style={{
          gridTemplateColumns: "0.95fr 0.75fr 0.95fr 1.2fr",
          borderColor: "#2d2b3a",
        }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "#6b6780" }}
        >
          aspect
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "#a78bfa" }}
        >
          1-qubit
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "#a78bfa" }}
        >
          2-qubit
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "#6b6780" }}
        >
          why it matters
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-px">
        {ROWS.map((row) => (
          <div
            key={row.aspect}
            className="grid gap-x-3 py-1.5 border-b rounded-sm"
            style={{
              gridTemplateColumns: "0.95fr 0.75fr 0.95fr 1.2fr",
              borderColor: "#1e1c28",
              background: row.highlight ? "rgba(167,139,250,0.03)" : undefined,
              borderLeft: row.highlight
                ? "2px solid rgba(167,139,250,0.2)"
                : "2px solid transparent",
              paddingLeft: 6,
            }}
          >
            <span
              className="font-mono text-[10px]"
              style={{ color: "#9490a8" }}
            >
              {row.aspect}
            </span>
            <span
              className="font-mono text-[11px]"
              style={{ color: "#a78bfacc" }}
            >
              {row.oneQ}
            </span>
            <span
              className="font-mono text-[11px]"
              style={{ color: row.highlight ? "#a78bfa" : "#a78bfacc" }}
            >
              {row.twoQ}
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#9490a8" }}
            >
              {row.why}
            </span>
          </div>
        ))}
      </div>

      {/* Key insight */}
      <div
        className="rounded border-l-2 pl-3 py-2"
        style={{ borderColor: "#34d399", background: "rgba(52,211,153,0.04)" }}
      >
        <p
          className="font-mono text-[10px] leading-relaxed"
          style={{ color: "#9490a8" }}
        >
          The CNOT creates entanglement between work qubits. ⟨Z₂Z₃⟩ = 1 exactly
          — a fake prover cannot satisfy this constraint while also spoofing the
          correct energy, making the 2-qubit protocol strictly harder to attack.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded border px-2.5 py-2"
      style={{ borderColor: "#2d2b3a", background: "#181620" }}
    >
      <p className="font-mono text-[9px]" style={{ color: "#6b6780" }}>
        {label}
      </p>
      <p className="font-mono text-[11px] mt-1" style={{ color: "#a78bfa" }}>
        {value}
      </p>
    </div>
  );
}
