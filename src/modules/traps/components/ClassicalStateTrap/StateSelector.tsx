import { SectionLabel } from "../../shared/SectionLabel";
import { STATE_HINT } from "./ClassicalStateTrap.constants";
import type { TrapState2Q } from "./ClassicalStateTrap.types";

interface Props {
  trapState: TrapState2Q;
  onChange: (s: TrapState2Q) => void;
}

export function StateSelector({ trapState, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <SectionLabel>state claimed by prover</SectionLabel>
      <select
        value={trapState}
        onChange={(e) => onChange(e.target.value as TrapState2Q)}
        className="w-full rounded-lg px-3 py-2 font-mono text-[12px] outline-none"
        style={{
          background: "#1e1c2a",
          border: "1px solid #3d3b4a",
          color: "#ddd9ee",
        }}
      >
        <option value="00">|00⟩ — correct input, wrong output</option>
        <option value="01">|01⟩ — may appear in honest distribution</option>
        <option value="10">|10⟩ — penalized directly by H_in</option>
        <option value="11">
          |11⟩ — correct output, wrong history (hardest to detect)
        </option>
      </select>
      <p
        className="text-[11px]"
        style={{ color: "#9490a8", fontStyle: "italic" }}
      >
        {STATE_HINT[trapState]}
      </p>
      <div
        className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
        style={{
          borderColor: "rgba(245,158,11,0.45)",
          background: "rgba(120,53,15,0.18)",
          color: "#fcd34d",
        }}
      >
        <span className="mr-2 font-semibold">⚠ Hardest to detect</span>A smart
        prover always chooses <span className="font-mono">|11⟩</span> — it
        satisfies H_out and appears in the honest measurement distribution. Only{" "}
        <span className="font-mono">H_prop</span> reveals the deception, because
        the quantum transition U(α) was never actually performed.
      </div>
    </div>
  );
}
