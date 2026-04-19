interface ExtendedEnergySummaryProps {
  energy: {
    estimated: number;
    theoretical: number;
    cnot_signature: number;
    decision: string;
  };
}

export function ExtendedEnergySummary({ energy }: ExtendedEnergySummaryProps) {
  return (
    <div
      className="space-y-1.5 rounded border p-2.5"
      style={{ borderColor: "#2d2b3a", background: "#181620" }}
    >
      <div className="flex items-center justify-between">
        <span className=" text-[10px]" style={{ color: "#6b6780" }}>
          energy estimate (averaged)
        </span>
        <span className=" text-sm" style={{ color: "#e8a020" }}>
          {energy.estimated.toFixed(4)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className=" text-[10px]" style={{ color: "#6b6780" }}>
          theoretical E = sin²(α)
        </span>
        <span className=" text-sm" style={{ color: "#a78bfa" }}>
          {energy.theoretical.toFixed(4)}
        </span>
      </div>
      <div
        className="flex items-center justify-between border-t pt-1.5"
        style={{ borderColor: "#2d2b3a" }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="h-1.5 w-1.5 rounded-lg"
            style={{ background: "#34d399" }}
          />
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            ⟨Z₂Z₃⟩ CNOT signature
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className=" text-[11px]" style={{ color: "#34d399" }}>
            {energy.cnot_signature.toFixed(4)}
          </span>
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            (expect ≈ 1)
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className=" text-[10px]" style={{ color: "#6b6780" }}>
          verifier
        </span>
        <span
          className=" text-[11px] font-semibold tracking-widest"
          style={{
            color:
              energy.decision === "accept"
                ? "#34d399"
                : energy.decision === "reject"
                  ? "#f87171"
                  : "#f59e0b",
          }}
        >
          {energy.decision.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
