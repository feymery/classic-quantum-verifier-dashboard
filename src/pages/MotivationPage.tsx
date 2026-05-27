const assumptions = [
  {
    index: "1",
    title: "Alice poses a QMA-complete problem",
    accent: "var(--color-accent)",
  },
  {
    index: "2",
    title: "Only a quantum device can answer",
    accent: "var(--color-warning)",
  },
  {
    index: "3",
    title: "Alice verifies without quantum hardware",
    accent: "var(--color-warning)",
  },
];

export function MotivationPage() {
  return (
    <div className="space-y-8">
      {/* Core question */}
      <div className="p-6 border-2 rounded-lg border-border bg-surface">
        <p className="mb-3 text-xs font-bold tracking-widest uppercase text-muted">
          The central question
        </p>
        <p className="text-xl font-semibold leading-snug">
          When you delegate a computation to a remote quantum device, how can
          you trust the result is correct?
        </p>
      </div>

      {/* Two actors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 space-y-1 text-center border rounded-lg border-border bg-surface">
          <p
            className="font-bold tracking-widest uppercase text-md"
            style={{ color: "var(--color-accent)" }}
          >
            Alice: Classical Verifier
          </p>
          <p className="text-xs leading-relaxed text-muted">
            A laptop. No quantum hardware. Wants to know if Bob did his job
            correctly.
          </p>
        </div>
        <div className="p-4 space-y-1 text-center border rounded-lg border-border bg-surface">
          <p
            className="font-bold tracking-widest uppercase text-md"
            style={{ color: "var(--color-warning)" }}
          >
            Bob: Quantum Prover
          </p>
          <p className="text-xs leading-relaxed text-muted">
            A powerful but untrusted quantum computer. Claims to have run the
            circuit honestly.
          </p>
        </div>
      </div>

      {/* Assumption cards */}
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-widest uppercase text-muted">
          Key assumptions
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {assumptions.map((a) => (
            <div
              key={a.index}
              className="flex gap-4 p-4 border rounded-lg border-border bg-surface"
            >
              <span
                className="text-lg font-bold leading-none  shrink-0"
                style={{ color: a.accent }}
              >
                {a.index}
              </span>
              <p className="text-xs font-semibold text-foreground">{a.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <p className="pl-4 text-xs leading-relaxed border-l-2 text-muted border-accent">
        Therefore: if Bob passes the test, he{" "}
        <span className="font-medium text-foreground">must</span> be a quantum
        device that performed the computation honestly. Mahadev (2018), refined
        by Stricker et al. (2024).
      </p>
    </div>
  );
}
