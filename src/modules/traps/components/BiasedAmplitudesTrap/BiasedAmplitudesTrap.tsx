/**
 * BiasedAmplitudesTrap.tsx — Trap 3: Biased Amplitudes (container)
 *
 * State management only. All presentation is delegated to BiasedAmplitudesContent.
 */

import { useMemo, useState } from "react";
import { TrapCard } from "../TrapCard";
import { BiasedAmplitudesContent } from "./BiasedAmplitudesContent";
import {
  biasedEnergyBreakdown,
  stepProbabilities,
} from "./BiasedAmplitudesTrap.physics";
import { noisyStepProbs, isDetected } from "./BiasedAmplitudesTrap.helpers";
import { DEFAULT_DELTA, DEFAULT_SHOTS } from "./BiasedAmplitudesTrap.types";

export function BiasedAmplitudesTrap({ alpha }: { alpha: number }) {
  const [delta, setDelta] = useState(DEFAULT_DELTA);
  const [shots, setShots] = useState(DEFAULT_SHOTS);

  const energy = useMemo(
    () => biasedEnergyBreakdown(delta, alpha),
    [delta, alpha],
  );
  const weights = useMemo(() => stepProbabilities(delta), [delta]);
  const noisyWeights = useMemo(
    () => noisyStepProbs(delta, shots),
    [delta, shots],
  );

  return (
    <TrapCard
      id="trap-3"
      title="Biased Amplitudes"
      description="Full history state — correct gates, but non-uniform step weights. Only H_prop detects broken coherence."
      alpha={alpha}
      circuitStepWeights={weights}
    >
      {({ isTrap }) => (
        <BiasedAmplitudesContent
          alpha={alpha}
          delta={delta}
          shots={shots}
          isTrap={isTrap}
          setDelta={setDelta}
          setShots={setShots}
          energy={isTrap ? energy : { H_out: 0, H_in: 0, H_prop: 0, total: 0 }}
          weights={weights}
          noisyWeights={noisyWeights}
          detected={isTrap && isDetected(energy.total)}
        />
      )}
    </TrapCard>
  );
}
