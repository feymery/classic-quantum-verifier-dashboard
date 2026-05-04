import { SectionLabel } from "../../shared/SectionLabel";
import { STEP_HINT } from "./FinalStateTrap.constants";
import type { ClaimStep } from "./FinalStateTrap.types";

interface Props {
  claimStep: ClaimStep;
  onChange: (s: ClaimStep) => void;
}

export function StepSelector({ claimStep, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <SectionLabel>time step claimed by prover</SectionLabel>
      <select
        value={claimStep}
        onChange={(e) => onChange(e.target.value as ClaimStep)}
        className="w-full rounded-lg px-3 py-2 font-mono text-[12px] outline-none"
        style={{
          background: "#1e1c2a",
          border: "1px solid #3d3b4a",
          color: "#ddd9ee",
        }}
      >
        <option value="t0">t=0 — initial state |ψ₀⟩ = |00⟩</option>
        <option value="t1">t=1 — intermediate state |ψ₁⟩</option>
        <option value="t2">t=2 — final state |ψ₂⟩ (hardest to detect)</option>
      </select>
      <p
        className="text-[11px]"
        style={{ color: "#9490a8", fontStyle: "italic" }}
      >
        {STEP_HINT[claimStep]}
      </p>
      <div
        className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
        style={{
          borderColor: "rgba(245,158,11,0.45)",
          background: "rgba(120,53,15,0.18)",
          color: "#fcd34d",
        }}
      >
        <span className="mr-2 font-semibold">
          ⚠ Why is this harder to detect than Trap 1?
        </span>
        Unlike Trap 1, this prover actually knows U(α) and prepares a real
        quantum state — just the wrong one. The final state |ψ_2⟩ looks correct
        in Z-basis measurements and satisfies H_out. Only H_prop reveals that
        the temporal history is incomplete: the prover jumped straight to the
        end without showing their work.
      </div>
    </div>
  );
}
