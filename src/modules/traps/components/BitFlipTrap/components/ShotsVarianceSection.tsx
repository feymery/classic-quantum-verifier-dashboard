/**
 * ShotsVarianceSection.tsx
 *
 * Compares the theoretical probability distribution with a multinomial
 * sample at the selected shot count. Demonstrates that statistical
 * fluctuations shrink as shots increase — but systematic bias from the
 * bit-flip error persists regardless of shot count.
 */

import { useMemo } from "react";
import { ProbBars } from "../../ProbBars";
import { DistributionCompare } from "../../../shared/DistributionCompare";
import { sampleCounts, countsToDistribution } from "../BitFlipTrap.physics";
import type { StateDistribution } from "../BitFlipTrap.types";

interface Props {
  noisyDist: StateDistribution;
  shots: number;
}

export function ShotsVarianceSection({ noisyDist, shots }: Props) {
  const sampled = useMemo(
    () =>
      countsToDistribution(
        sampleCounts(
          noisyDist,
          shots,
          shots /* use shots as seed for variety */,
        ),
        shots,
      ),
    [noisyDist, shots],
  );

  const accentColor = "var(--color-accent)";
  const sampledColor = "var(--color-warning)";

  const theoreticalCounts = Object.fromEntries(
    Object.entries(noisyDist).map(([k, v]) => [k, Math.round(v * shots)]),
  );

  const sampledCounts = Object.fromEntries(
    Object.entries(sampled).map(([k, v]) => [k, Math.round(v * shots)]),
  );

  return (
    <DistributionCompare
      label={`shot noise at ${shots.toLocaleString()} shots`}
      honestLabel="Theoretical (exact)"
      trapLabel={`Sampled (${shots.toLocaleString()} shots)`}
      isTrap={true}
      honestBars={
        <ProbBars
          counts={theoreticalCounts}
          shots={shots}
          accentColor={accentColor}
        />
      }
      trapBars={
        <ProbBars
          counts={sampledCounts}
          shots={shots}
          accentColor={sampledColor}
        />
      }
      refNote="More shots reduce statistical variance but cannot remove systematic bias introduced by the bit-flip error."
    />
  );
}
