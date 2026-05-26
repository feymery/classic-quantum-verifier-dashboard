export function ConclusionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Conclusions</h1>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        The experiment showed simplified classical verification on real quantum
        hardware.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5 text-sm h-44">
          <p className="mb-3 font-semibold">Verified on hardware</p>
          <p className="leading-6">
            The experiment successfully demonstrated simplified classical verification on real quantum hardware.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 text-sm h-44">
          <p className="mb-3 font-semibold">Dishonest behavior detected</p>
          <p className="leading-6">
            Dishonest executions are easily detectable, as invalid states consistently exceed the acceptance threshold.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 text-sm h-44">
          <p className="mb-3 font-semibold">Simplified implementation</p>
          <p className="leading-6">
            The cryptographic trapdoor layer was removed to simplify implementation and significantly reduce qubit requirements.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 text-sm h-44">
          <p className="mb-3 font-semibold">Scalability challenge</p>
          <p className="leading-6">
            Scaling to larger circuits with full trapdoor-based verification would require many more qubits and remains a major challenge.
          </p>
        </div>
      </div>
    </div>
  );
}
