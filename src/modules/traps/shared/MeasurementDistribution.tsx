import { ProbBars } from "../components/ProbBars";
import { DistributionCompare } from "./DistributionCompare";
import {
  DEFAULT_SHOTS,
  HONEST_COLOR,
  TRAP_COLOR,
} from "./trapShared.constants";

interface Props {
  honestCounts: Record<string, number>;
  trapCounts: Record<string, number>;
  isTrap: boolean;
  trapLabel: string;
}

export function MeasurementDistribution({
  honestCounts,
  trapCounts,
  isTrap,
  trapLabel,
}: Props) {
  return (
    <DistributionCompare
      label={`measurement distribution (${DEFAULT_SHOTS} shots)`}
      honestLabel="Honest |η(α)⟩"
      trapLabel={trapLabel}
      isTrap={isTrap}
      honestBars={
        <ProbBars
          counts={honestCounts}
          shots={DEFAULT_SHOTS}
          accentColor={HONEST_COLOR}
        />
      }
      trapBars={
        <ProbBars
          counts={trapCounts}
          shots={DEFAULT_SHOTS}
          accentColor={isTrap ? TRAP_COLOR : "#4b4860"}
        />
      }
    />
  );
}
