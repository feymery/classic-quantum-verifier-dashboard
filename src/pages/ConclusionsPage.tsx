const CARDS = [
  {
    tag: "Hardware",
    accent: "var(--color-success)",
    title: "Verified on hardware",
    body: "The experiment successfully demonstrated simplified classical verification on real quantum hardware.",
  },
  {
    tag: "Detection",
    accent: "var(--color-danger)",
    title: "Dishonest behavior detected",
    body: "Dishonest executions are easily detectable, as invalid states consistently exceed the acceptance threshold.",
  },
  {
    tag: "Protocol",
    accent: "var(--color-accent)",
    title: "Simplified implementation",
    body: "The cryptographic trapdoor layer was removed to simplify implementation and significantly reduce qubit requirements.",
  },
  {
    tag: "Limitations",
    accent: "var(--color-warning)",
    title: "Scalability challenge",
    body: "Scaling to larger circuits with full trapdoor-based verification would require many more qubits and remains a major challenge.",
  },
];

export function ConclusionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mt-1 text-[13px] text-muted">
          The experiment showed simplified classical verification on real
          quantum hardware.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map(({ tag, accent, title, body }) => (
          <div
            key={title}
            className="flex flex-col gap-3 p-5 border-2 rounded-lg border-border bg-surface"
            style={{ borderLeftColor: accent, borderLeftWidth: 4 }}
          >
            <span
              className="self-start text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ color: accent, background: accent + "22" }}
            >
              {tag}
            </span>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-[13px] text-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
