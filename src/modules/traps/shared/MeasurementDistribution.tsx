import { ProbBars } from "../components/ProbBars";
import { SectionLabel } from "./SectionLabel";
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
    <div>
      <SectionLabel>
        measurement distribution ({DEFAULT_SHOTS} shots)
      </SectionLabel>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p
            className="mb-2 text-[11px] font-medium"
            style={{ color: HONEST_COLOR }}
          >
            Honest |η(α)⟩
          </p>
          <ProbBars
            counts={honestCounts}
            shots={DEFAULT_SHOTS}
            accentColor={HONEST_COLOR}
          />
        </div>
        <div>
          <p
            className="mb-2 text-[11px] font-medium"
            style={{ color: isTrap ? TRAP_COLOR : "#4b4860" }}
          >
            {trapLabel}
          </p>
          <ProbBars
            counts={trapCounts}
            shots={DEFAULT_SHOTS}
            accentColor={isTrap ? TRAP_COLOR : "#4b4860"}
          />
        </div>
      </div>
    </div>
  );
}
