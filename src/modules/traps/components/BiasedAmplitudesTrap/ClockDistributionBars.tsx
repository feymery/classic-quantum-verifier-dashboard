/**
 * ClockDistributionBars.tsx
 * Honest vs trap clock-step distribution for BiasedAmplitudesTrap.
 * Uses DistributionCompare + ClockStepBars from shared/.
 */

import { DistributionCompare } from "../../shared/DistributionCompare";
import { ClockStepBars } from "../../shared/ClockStepBars";
import { HONEST_COLOR, TRAP_COLOR } from "./BiasedAmplitudesTrap.types";

interface Props {
  /** Trap step probabilities [t=0, t=1, t=2]. */
  trapWeights: [number, number, number];
  shots: number;
}

const HONEST_WEIGHTS: [number, number, number] = [1 / 3, 1 / 3, 1 / 3];

export function ClockDistributionBars({ trapWeights, shots }: Props) {
  return (
    <DistributionCompare
      label="clock step distribution"
      honestLabel="Honest — uniform (1/3 each)"
      trapLabel="Trap — biased amplitudes"
      isTrap
      honestBars={
        <ClockStepBars
          weights={HONEST_WEIGHTS}
          shots={shots}
          color={HONEST_COLOR}
        />
      }
      trapBars={
        <ClockStepBars
          weights={trapWeights}
          shots={shots}
          color={TRAP_COLOR}
          showRef
        />
      }
      refNote="╎ green tick = honest reference (1/3)"
    />
  );
}
