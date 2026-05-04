import type { Mode } from "../../shared/trapShared.types";
import { VERDICT_SUBTITLE } from "./ClassicalStateTrap.constants";
import type { TrapState2Q } from "./ClassicalStateTrap.types";

interface Props {
  mode: Mode;
  trapState: TrapState2Q;
}

export function ConceptBox({ mode, trapState }: Props) {
  if (mode === "honest") {
    return (
      <div
        className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
        style={{
          borderColor: "#1e3a2a",
          background: "#0f1f16",
          color: "#86efac",
        }}
      >
        <span className="mr-2 font-semibold">✓ HONEST PROVER</span>
        The prover applies H and CRY(2α) correctly. The clock qubit enters
        superposition, and the Hamiltonian sees coherent temporal correlations
        across all three time steps simultaneously. Energy = 0 — accepted.
      </div>
    );
  }
  return (
    <div
      className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
      style={{
        borderColor: "#3a1e1e",
        background: "#1f0f0f",
        color: "#fca5a5",
      }}
    >
      <span className="mr-2 font-semibold">✗ TRAP DETECTED</span>
      The prover skipped H and CRY(2α) entirely and submitted the classical
      state <span className="font-mono">|{trapState}⟩</span> with no temporal
      superposition. {VERDICT_SUBTITLE[trapState]}
    </div>
  );
}
