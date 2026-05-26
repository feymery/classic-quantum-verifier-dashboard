import { Card } from "../../ui/Card";

function Frac({ num, den }: { num: string; den: string }) {
  return (
    <span className="inline-flex flex-col items-center leading-none mx-0.5 align-middle">
      <span
        className="font-mono text-xs"
        style={{ color: "var(--color-muted)" }}
      >
        {num}
      </span>
      <span
        className="block w-full border-t my-px"
        style={{ borderColor: "var(--color-border)" }}
      />
      <span
        className="font-mono text-xs"
        style={{ color: "var(--color-muted)" }}
      >
        {den}
      </span>
    </span>
  );
}

const TERM_COLOR: Record<string, string> = {
  H_out: "#b7a8cf",
  H_in: "#b7a8cf",
  H_prop: "#a78bfa",
};

function TermRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const color = TERM_COLOR[label] ?? "var(--color-subtle)";
  return (
    <div
      className="flex items-center gap-2.5 rounded-md border px-3 py-2"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <span
        className="text-[11px] font-semibold font-mono shrink-0 w-14"
        style={{ color }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[12px] inline-flex items-center flex-wrap"
        style={{ color: "var(--color-foreground)" }}
      >
        {children}
      </span>
    </div>
  );
}

export function HamiltonianInfoPanel() {
  return (
    <Card padded="md">
      {/* Header */}
      <div className="mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-subtle)" }}
        >
          Hamiltonian Determination
        </p>
        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>
          The circuit U(α) = cos α·Z + sin α·X is encoded into three Hermitian
          penalty terms. Any deviation from the ideal computation raises the
          energy above the acceptance threshold.
        </p>
      </div>

      {/* Global formula */}
      <div
        className="rounded-lg px-4 py-3 mb-3 text-center"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span
          className="font-mono text-base tracking-tight"
          style={{ color: "var(--color-foreground)" }}
        >
          H&#8239;=&#8239;H<sub>out</sub>&#8239;+&#8239;6·H<sub>in</sub>
          &#8239;+&#8239;3·H<sub>prop</sub>
        </span>
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-1.5">
        <TermRow label="H_out">
          <Frac num="1" den="2" />
          &#8288;(1 − ⟨Z₁⟩ − ⟨Z₂⟩ + ⟨Z₁Z₂⟩)
        </TermRow>
        <TermRow label="H_in">
          <Frac num="1" den="4" />
          &#8288;(1 − ⟨Z₁⟩ + ⟨Z₂⟩ − ⟨Z₁Z₂⟩)
        </TermRow>
        <TermRow label="H_prop">
          <Frac num="1" den="2" />
          &#8288;(1 − cos α·⟨Z₁X₂⟩ − sin α·⟨X₁X₂⟩)
        </TermRow>
      </div>
    </Card>
  );
}
