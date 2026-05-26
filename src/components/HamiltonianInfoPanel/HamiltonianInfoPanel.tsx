import { Card } from "../../ui/Card";

function Frac({ num, den }: { num: string; den: string }) {
  return (
    <span className="inline-flex flex-col items-center leading-none mx-0.5 align-middle">
      <span className="font-mono text-xs text-white/80">{num}</span>
      <span className="block w-full border-t border-white/30 my-px" />
      <span className="font-mono text-xs text-white/80">{den}</span>
    </span>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-widest text-white/70">
      {children}
    </span>
  );
}

function TermRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface/60 px-3 py-2">
      <span className="text-[11px] font-semibold text-subtle font-mono shrink-0 w-12">
        {label}
      </span>
      <span className="font-mono text-sm text-white/85 inline-flex items-center">
        {children}
      </span>
    </div>
  );
}

export function HamiltonianInfoPanel() {
  return (
    <Card className="rounded-lg" padded="md">
      <span className="text-[10px] uppercase tracking-widest text-white/80">
        Hamiltonian Determination
      </span>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center gap-3">
          <ColTitle>Global Hamiltonian</ColTitle>
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <span className="font-mono text-xl tracking-tight text-white/95">
              H = &#8239;H<sub>out</sub> + 6H<sub>in</sub> + 3H<sub>prop</sub>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <ColTitle>Component Breakdown</ColTitle>
          <div className="flex flex-col gap-1.5 w-full">
            <TermRow label="H_in">
              <Frac num="1" den="4" />
              &#8288;(1 − ⟨Z₁⟩ + ⟨Z₂⟩ − ⟨Z₁Z₂⟩)
            </TermRow>
            <TermRow label="H_out">
              <Frac num="1" den="2" />
              &#8288;(1 − ⟨Z₁⟩ − ⟨Z₂⟩ + ⟨Z₁Z₂⟩)
            </TermRow>
            <TermRow label="H_prop">
              <Frac num="1" den="2" />
              &#8288;(1 − cosα·⟨Z₁X₂⟩ − sinα·⟨X₁X₂⟩)
            </TermRow>
          </div>
        </div>
      </div>
    </Card>
  );
}
