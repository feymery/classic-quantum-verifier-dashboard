/**
 * ClassicalStateTrap — Trap 1: Classical State Prover
 *
 * Visualises why a classical prover cannot pass the Stricker et al. 2024
 * verification protocol: any computational basis state |b₁b₂⟩ has ⟨X⟩ = 0
 * exactly, so H_prop = 1/2 always, giving energy ≥ 1.5 >> 0.4 threshold.
 */

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
    <>
      {/* ── Two-column body ── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "minmax(0,52fr) minmax(0,48fr)" }}
      >
        {/* LEFT — why classical provers fail */}
        <div className="flex flex-col gap-4">
          <p className="text-[12px] leading-relaxed text-muted">
            Any basis state{" "}
            <span className="font-mono text-foreground">|b₁b₂⟩</span> has{" "}
            <span className="font-mono text-foreground">⟨X⟩&nbsp;=&nbsp;0</span>
            , so{" "}
            <span className="font-mono text-foreground">
              H_prop&nbsp;=&nbsp;½
            </span>{" "}
            always — giving{" "}
            <span className="font-mono text-foreground">E&nbsp;≥&nbsp;1.5</span>
            , far above the acceptance threshold of{" "}
            <span className="font-mono text-foreground">0.4</span>.
          </p>

          <ObservableTable
            cosA={cosA}
            sinA={sinA}
            E_quantum={E_quantum}
            showQuantum={showQuantum}
          />
          <EnergyTable />
        </div>

        {/* RIGHT — energy chart */}
        <EnergyBarChart
          alpha={alpha}
          cosA={cosA}
          sinA={sinA}
          E_quantum={E_quantum}
          showQuantum={showQuantum}
        />
      </div>
    </>
  );
}

export default ClassicalStateTrap;
