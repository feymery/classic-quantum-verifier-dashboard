import { useMemo, useState } from "react";
import { TrapCard } from "../TrapCard";
import { MeasurementDistribution } from "../../shared/MeasurementDistribution";
import { SectionLabel } from "../../shared/SectionLabel";
import { DEFAULT_SHOTS } from "../../shared/trapShared.constants";
import { trapEnergyBreakdown, trapCounts2Q } from "./FinalStateTrap.physics";
import { TICK_ANNOTATION } from "./FinalStateTrap.constants";
import { ConceptBox } from "./ConceptBox";
import { StepSelector } from "./StepSelector";
import { EnergySection } from "./EnergySection";
import { ZBasisTable } from "./ZBasisTable";
import { ClockDistChart } from "./ClockDistChart";
import type { ClaimStep } from "./FinalStateTrap.types";
import { honestCounts } from "../../physics/traps";

interface Props {
  alpha: number;
}

export function FinalStateTrap({ alpha }: Props) {
  const [claimStep, setClaimStep] = useState<ClaimStep>("t2");

  const claimLabel = claimStep === "t0" ? "0" : claimStep === "t1" ? "1" : "2";

  const trapEnergy = useMemo(
    () => trapEnergyBreakdown(claimStep, alpha),
    [claimStep, alpha],
  );
  const honestCts = useMemo(() => honestCounts(alpha, DEFAULT_SHOTS), [alpha]);
  const trapCts = useMemo(
    () => trapCounts2Q(claimStep, alpha, DEFAULT_SHOTS),
    [claimStep, alpha],
  );

  return (
    <TrapCard
      id="Trap-2"
      title="Final State Only"
      description="The dishonest prover knows U(α) and submits only the final time step |ψ_2⟩⊗|2⟩ instead of the full clock history superposition |η(α)⟩. H_out is satisfied when claimStep = t2, but H_prop always detects the missing transitions."
      alpha={alpha}
      circuitAnnotation={TICK_ANNOTATION[claimStep]}
    >
      {({ isTrap }) => (
        <>
          {isTrap && (
            <StepSelector claimStep={claimStep} onChange={setClaimStep} />
          )}
          <ClockDistChart claimStep={claimStep} isTrap={isTrap} />
          <MeasurementDistribution
            honestCounts={honestCts}
            trapCounts={trapCts}
            isTrap={isTrap}
            trapLabel={`Trap |ψ${claimLabel}⟩`}
          />
          <EnergySection
            isTrap={isTrap}
            trapEnergy={trapEnergy}
            claimStep={claimStep}
          />
          {isTrap && (
            <div>
              <SectionLabel>z-basis outcomes</SectionLabel>
              <ZBasisTable claimStep={claimStep} alpha={alpha} />
            </div>
          )}
          <ConceptBox mode={isTrap ? "trap" : "honest"} claimStep={claimStep} />
        </>
      )}
    </TrapCard>
  );
}

export default FinalStateTrap;
