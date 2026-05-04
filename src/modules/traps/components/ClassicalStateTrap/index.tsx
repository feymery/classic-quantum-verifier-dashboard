import { useMemo, useState } from "react";
import { TrapCard } from "../TrapCard";
import { MeasurementDistribution } from "../../shared/MeasurementDistribution";
import { SectionLabel } from "../../shared/SectionLabel";
import { DEFAULT_SHOTS } from "../../shared/trapShared.constants";
import { trapEnergyBreakdown } from "./ClassicalStateTrap.physics";
import { ConceptBox } from "./ConceptBox";
import { StateSelector } from "./StateSelector";
import { EnergySection } from "./EnergySection";
import { ZBasisTable } from "./ZBasisTable";
import { DetectionBreakdownTable } from "./DetectionBreakdownTable";
import { HamiltonianExplainer } from "./HamiltonianExplainer";
import type { TrapState2Q } from "./ClassicalStateTrap.types";
import { honestCounts } from "../../physics/traps";

interface Props {
  alpha: number;
}

export function ClassicalStateTrap({ alpha }: Props) {
  const [trapState, setTrapState] = useState<TrapState2Q>("11");

  const trapEnergy = useMemo(
    () => trapEnergyBreakdown(trapState, alpha),
    [trapState, alpha],
  );
  const honestCts = useMemo(() => honestCounts(alpha, DEFAULT_SHOTS), [alpha]);
  const trapCts: Record<string, number> = useMemo(
    () => ({ [trapState]: DEFAULT_SHOTS }),
    [trapState],
  );

  return (
    <TrapCard
      id="Trap-1"
      title="Classical State Instead of Superposition"
      description="The dishonest prover skips the entire quantum circuit and submits a single classical basis state |ab⟩ instead of the 2-qubit clock history superposition |η(α)⟩. The Hamiltonian H_prop always detects the missing temporal coherence."
      alpha={alpha}
      circuitAnnotation={`submits |${trapState}⟩ directly — no quantum evolution`}
      circuitShowDiffToggle
    >
      {({ isTrap }) => (
        <>
          {isTrap && (
            <StateSelector trapState={trapState} onChange={setTrapState} />
          )}
          <MeasurementDistribution
            honestCounts={honestCts}
            trapCounts={trapCts}
            isTrap={isTrap}
            trapLabel={`Trap |${trapState}⟩`}
          />
          <EnergySection
            isTrap={isTrap}
            trapEnergy={trapEnergy}
            trapState={trapState}
          />
          {isTrap && <DetectionBreakdownTable trapState={trapState} />}
          {isTrap && <HamiltonianExplainer />}
          {isTrap && (
            <div>
              <SectionLabel>z-basis outcomes</SectionLabel>
              <ZBasisTable trapState={trapState} alpha={alpha} />
            </div>
          )}
          <ConceptBox mode={isTrap ? "trap" : "honest"} trapState={trapState} />
        </>
      )}
    </TrapCard>
  );
}

export default ClassicalStateTrap;
