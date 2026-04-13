export function ProtocolMappingCard() {
  const rows = [
    {
      label: "state prep",
      oneQ: "|psi_1Q> with one work branch",
      twoQ: "|psi_2Q> with an entangled work pair",
    },
    {
      label: "hamiltonian terms",
      oneQ: "clock-work ZZ/XX terms",
      twoQ: "primary + cross-check + CNOT signature term",
    },
    { label: "measurements", oneQ: "4 observables", twoQ: "10 observables" },
    {
      label: "energy",
      oneQ: "single estimator",
      twoQ: "2 estimators averaged",
    },
  ];

  return (
    <div
      className="space-y-2 rounded border p-3"
      style={{ borderColor: "#2d2b3a", background: "#181620" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px]" style={{ color: "#a78bfa" }}>
          mapping from 1Q base model
        </span>
        <span className="font-mono text-[10px]" style={{ color: "#6b6780" }}>
          pedagogical extension
        </span>
      </div>

      <div className="space-y-px">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-x-2 border-b py-1.5"
            style={{
              gridTemplateColumns: "90px 1fr 1fr",
              borderColor: "#1e1c28",
            }}
          >
            <span
              className="font-mono text-[10px]"
              style={{ color: "#9490a8" }}
            >
              {row.label}
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#a78bfacc" }}
            >
              {row.oneQ}
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#a78bfa" }}
            >
              {row.twoQ}
            </span>
          </div>
        ))}
      </div>

      <p
        className="font-mono text-[10px] leading-relaxed"
        style={{ color: "#9490a8" }}
      >
        Complexity grows mainly from additional correlations, not from deep
        circuits. This keeps the section faithful to the 1Q protocol while
        showing why adversarial spoofing gets harder.
      </p>
    </div>
  );
}
