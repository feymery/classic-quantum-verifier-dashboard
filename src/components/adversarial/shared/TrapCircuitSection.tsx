import { Circuit1Q } from "../../quantum/Circuit1Q";

interface Props {
  alpha: number;
  isTrap: boolean;
  annotation?: string;
  showDiff?: boolean;
  /** Biased-amplitudes trap: pass non-uniform step weights to Circuit1Q */
  stepWeights?: [number, number, number];
}

export function TrapCircuitSection({
  alpha,
  isTrap,
  annotation,
  showDiff = true,
  stepWeights,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2"></div>
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
