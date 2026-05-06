/**
 * ClassicalStateTrap — Trap 1: Classical State Prover
 *
 * Visualises why a classical prover cannot pass the Stricker et al. 2024
 * verification protocol: any computational basis state |b₁b₂⟩ has ⟨X⟩ = 0
 * exactly, so H_prop = 1/2 always, giving energy ≥ 1.5 >> 0.4 threshold.
 */

import { HamiltonianBox } from "./components/HamiltonianBox";
import { ObservableTable } from "./components/ObservableTable";
import { EnergyTable } from "./components/EnergyTable";
import { EnergyBarChart } from "./components/EnergyBarChart";

interface Props {
  alpha: number;
  /** When true (default) shows the honest-prover reference in chart and table. */
  showQuantum?: boolean;
}

export function ClassicalStateTrap({ alpha, showQuantum = true }: Props) {
  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);
  const E_quantum = sinA * sinA;

  return (
    <div className="rounded-lg border border-border bg-canvas p-5">
      {/* ── Header ── */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
          Trap 1
        </span>
        <h2 className="text-[14px] font-semibold text-foreground">
          Classical State Prover
        </h2>
      </div>

      {/* ── Two-column body ── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "minmax(0,55fr) minmax(0,45fr)" }}
      >
        {/* LEFT — explanation */}
        <div className="flex flex-col gap-5">
          <p className="text-[12px] leading-relaxed text-muted">
            A classical prover can only emit a computational basis state{" "}
            <span className="font-mono text-foreground">|b₁b₂⟩</span>. Because
            every basis state is an eigenstate of Z with no superposition, the
            expectation value{" "}
            <span className="font-mono text-foreground">⟨X⟩&nbsp;=&nbsp;0</span>{" "}
            exactly. Consequently both off-diagonal observables vanish —{" "}
            <span className="font-mono text-foreground">
              ⟨Z₁X₂⟩&nbsp;=&nbsp;0
            </span>{" "}
            and{" "}
            <span className="font-mono text-foreground">
              ⟨X₁X₂⟩&nbsp;=&nbsp;0
            </span>{" "}
            — so{" "}
            <span className="font-mono text-foreground">
              H_prop&nbsp;=&nbsp;1/2
            </span>{" "}
            always, pushing the total energy to at least 1.5, far above the
            acceptance threshold of 0.4.
          </p>

          <HamiltonianBox />
          <ObservableTable
            cosA={cosA}
            sinA={sinA}
            E_quantum={E_quantum}
            showQuantum={showQuantum}
          />
          <EnergyTable />
        </div>

        {/* RIGHT — chart */}
        <EnergyBarChart
          alpha={alpha}
          cosA={cosA}
          sinA={sinA}
          E_quantum={E_quantum}
          showQuantum={showQuantum}
        />
      </div>
    </div>
  );
}

export default ClassicalStateTrap;
