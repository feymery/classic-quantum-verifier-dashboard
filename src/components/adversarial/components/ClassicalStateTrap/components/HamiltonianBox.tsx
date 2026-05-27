import { SectionLabel } from "../../../shared/SectionLabel";

export function HamiltonianBox() {
  return (
    <div>
      <SectionLabel>Hamiltonian terms</SectionLabel>
      <div
        className="rounded-lg border px-4 py-3 font-mono text-[11px] leading-loose"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-elevated)",
          color: "var(--color-muted)",
        }}
      >
        <div>
          <span style={{ color: "var(--color-foreground)" }}>H_out</span>
          {" = "}
          <span style={{ color: "var(--color-subtle)" }}>
            ½(1 − Z₁ − Z₂ + Z₁Z₂)
          </span>
        </div>
        <div>
          <span style={{ color: "var(--color-foreground)" }}>H_in</span>
          {"\u00a0\u00a0= "}
          <span style={{ color: "var(--color-subtle)" }}>
            ¼(1 − Z₁ + Z₂ − Z₁Z₂)
          </span>
        </div>
        <div>
          <span style={{ color: "var(--color-accent)" }}>H_prop</span>
          {" = "}
          <span style={{ color: "var(--color-subtle)" }}>
            ½(1 −{" "}
            <span style={{ color: "var(--color-success)" }}>cos&thinsp;α</span>
            {" Z₁X₂ − "}
            <span style={{ color: "var(--color-success)" }}>sin&thinsp;α</span>
            {" X₁X₂)"}
          </span>
        </div>
        <div
          className="mt-1 text-[10px]"
          style={{ color: "var(--color-subtle)" }}
        >
          Full Hamiltonian: H = H_out + 6·H_in + 3·H_prop
        </div>
      </div>
    </div>
  );
}
