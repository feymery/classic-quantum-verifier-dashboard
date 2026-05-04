import { Circuit1Q } from "../../../components/quantum/Circuit1Q";
import { SectionLabel } from "./SectionLabel";

interface Props {
  alpha: number;
  isTrap: boolean;
  annotation?: string;
  showDiff?: boolean;
  /** When provided and isTrap is true, renders a hide/show diff toggle button */
  onToggleDiff?: () => void;
  /** Biased-amplitudes trap: pass non-uniform step weights to Circuit1Q */
  stepWeights?: [number, number, number];
}

export function TrapCircuitSection({
  alpha,
  isTrap,
  annotation,
  showDiff = true,
  onToggleDiff,
  stepWeights,
}: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>circuit — 2-qubit clock state</SectionLabel>
        {onToggleDiff && isTrap && (
          <button
            onClick={onToggleDiff}
            className="text-[10px] underline-offset-2"
            style={{ color: "#6b6780" }}
          >
            {showDiff ? "hide diff" : "show diff"}
          </button>
        )}
      </div>
      <Circuit1Q
        alpha={alpha}
        mode={isTrap ? "trap" : "honest"}
        showDiff={showDiff}
        annotation={annotation}
        stepWeights={stepWeights}
      />
    </div>
  );
}
