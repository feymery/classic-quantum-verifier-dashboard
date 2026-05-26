import { Card } from "../../../../ui/Card";

const ALICE_C = "#b7a8cf";
const BOB_C = "#a78bfa";

type Actor = "ALICE" | "BOB";

interface ProtocolStep {
  n: number;
  from: Actor;
  to?: Actor;
  title: string;
  detail: string;
  tags?: string[];
}

const STEPS: ProtocolStep[] = [
  {
    n: 1,
    from: "ALICE",
    to: "BOB",
    title: "Send circuit description",
    detail:
      "Alice publicly defines the unitary U(α) = cos α·Z + sin α·X and derives the Hamiltonian H. Bob receives the full description before preparing anything.",
    tags: ["U(α)", "H"],
  },
  {
    n: 2,
    from: "BOB",
    title: "Prepare history state",
    detail:
      "Bob privately prepares the 2-qubit history state |η(α)⟩ that encodes the full computation history as a superposition of clock and work qubits.",
    tags: ["|η(α)⟩ = (|00⟩ + cosα|01⟩ + sinα|11⟩)/√2"],
  },
  {
    n: 3,
    from: "ALICE",
    to: "BOB",
    title: "Send measurement challenge",
    detail:
      "Alice randomly picks one of three incompatible Pauli bases and sends the challenge after Bob has committed to his state — Bob cannot adapt retroactively.",
    tags: ["ZZ", "ZX", "XX"],
  },
  {
    n: 4,
    from: "BOB",
    to: "ALICE",
    title: "Return expectation values",
    detail:
      "Bob measures in the requested basis and honestly reports the five expectation values needed to reconstruct ⟨H⟩. A dishonest Bob cannot fake consistent results.",
    tags: ["⟨Z₁⟩", "⟨Z₂⟩", "⟨Z₁Z₂⟩", "⟨Z₁X₂⟩", "⟨X₁X₂⟩"],
  },
  {
    n: 5,
    from: "ALICE",
    title: "Compute energy & decide",
    detail:
      "Alice linearly combines the reported values to obtain E = ⟨H⟩. A genuine quantum prover achieves E = sin²α < 0.5. A classical prover cannot do better than E = 1.5 — always rejected.",
    tags: ["E = ⟨H⟩", "ACCEPT  E < 0.5", "REJECT  E > 0.5"],
  },
];

function StepRow({ step }: { step: ProtocolStep }) {
  const fromColor = step.from === "ALICE" ? ALICE_C : BOB_C;
  const toColor = step.to ? (step.to === "ALICE" ? ALICE_C : BOB_C) : null;

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-elevated)",
      }}
    >
      {/* Header: step number + actors + title */}
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0"
          style={{ background: fromColor, color: "var(--color-canvas)" }}
        >
          {step.n}
        </span>
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: fromColor }}
        >
          {step.from}
        </span>
        {toColor && (
          <>
            <span
              className="text-[10px] font-bold"
              style={{ color: "var(--color-subtle)" }}
            >
              →
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: toColor }}
            >
              {step.to}
            </span>
          </>
        )}
        <span
          className="text-[10px] font-semibold ml-0.5"
          style={{ color: fromColor }}
        >
          {step.title}
        </span>
      </div>

      {/* Detail */}
      <p className="text-[10px] mb-1.5" style={{ color: "var(--color-muted)" }}>
        {step.detail}
      </p>

      {/* Tags */}
      {step.tags && (
        <div className="flex flex-wrap gap-1">
          {step.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono font-medium"
              style={{ background: fromColor + "22", color: fromColor }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProtocolFlow1Q() {
  return (
    <Card padded="md">
      {/* Header */}
      <div className="mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-subtle)" }}
        >
          Protocol Interaction · Round structure
        </p>
        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>
          Five ordered rounds between the classical verifier and the quantum
          prover. The ordering and commitment constraints are what make
          verification possible.
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-3">
        {[
          { label: "ALICE — classical verifier", color: ALICE_C },
          { label: "BOB — quantum prover", color: BOB_C },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ background: color }}
            />
            <span
              className="text-[9px] uppercase tracking-widest font-semibold"
              style={{ color }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step) => (
          <StepRow key={step.n} step={step} />
        ))}
      </div>
    </Card>
  );
}
