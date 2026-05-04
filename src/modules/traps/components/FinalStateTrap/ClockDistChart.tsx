import { DistributionCompare } from "../../shared/DistributionCompare";
import { ClockStepBars } from "../../shared/ClockStepBars";
import { HONEST_COLOR, TRAP_COLOR } from "../../shared/trapShared.constants";
import { DEFAULT_SHOTS } from "../../shared/trapShared.constants";
import type { ClaimStep } from "./FinalStateTrap.types";

interface Props {
  claimStep: ClaimStep;
  isTrap: boolean;
}

const HONEST_WEIGHTS: [number, number, number] = [1 / 3, 1 / 3, 1 / 3];

function trapWeights(claimStep: ClaimStep): [number, number, number] {
  return [
    claimStep === "t0" ? 1 : 0,
    claimStep === "t1" ? 1 : 0,
    claimStep === "t2" ? 1 : 0,
  ];
}

export function ClockDistChart({ claimStep, isTrap }: Props) {
  const weights = trapWeights(claimStep);

  return (
    <DistributionCompare
      label="clock step distribution"
      honestLabel="Honest — uniform (1/3 each)"
      trapLabel={`Trap — claims |ψ_${claimStep.replace("t", "")}⟩`}
      isTrap={isTrap}
      honestBars={
        <ClockStepBars
          weights={HONEST_WEIGHTS}
          shots={DEFAULT_SHOTS}
          color={HONEST_COLOR}
        />
      }
      trapBars={
        <ClockStepBars
          weights={weights}
          shots={DEFAULT_SHOTS}
          color={isTrap ? TRAP_COLOR : "#3d3b4a"}
        />
      }
    />
  );
}
