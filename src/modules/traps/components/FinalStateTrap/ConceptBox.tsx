import type { Mode } from "../../shared/trapShared.types";
import type { ClaimStep } from "./FinalStateTrap.types";

interface Props {
  mode: Mode;
  claimStep: ClaimStep;
}

const LABELS: Record<ClaimStep, string> = {
  t2: "✗ FINAL STATE ONLY",
  t1: "✗ INTERMEDIATE STATE ONLY",
  t0: "✗ INITIAL STATE ONLY",
};

const TEXTS: Record<ClaimStep, string> = {
  t2: "The prover knows U(α) and prepares the correct final state |ψ_2⟩, but presents it without the computational history. H_out is satisfied, but H_prop penalizes the two missing transitions.",
  t1: "The prover claims the intermediate step |ψ_1⟩. Neither H_out nor H_prop is satisfied — both transitions are absent.",
  t0: "The prover claims |ψ_0⟩ = |00⟩. H_in passes, but H_out and H_prop both fail immediately.",
};

export function ConceptBox({ mode, claimStep }: Props) {
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
        The prover applies H and CRY(2α) sequentially. The clock state |η⟩
        encodes all three time steps simultaneously with uniform amplitude 1/√3.
        Every transition is present. Energy = 0.
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
      <span className="mr-2 font-semibold">{LABELS[claimStep]}</span>
      {TEXTS[claimStep]}
    </div>
  );
}
