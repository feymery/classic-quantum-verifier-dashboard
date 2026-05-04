import { EnergyGauge } from "../EnergyGauge";
import { SectionLabel } from "../../shared/SectionLabel";
import { TRAP_COLOR } from "../../shared/trapShared.constants";
import { VERDICT_SUBTITLE } from "./ClassicalStateTrap.constants";
import type { EnergyBreakdown } from "../../shared/trapShared.types";
import type { TrapState2Q } from "./ClassicalStateTrap.types";

interface Props {
  isTrap: boolean;
  trapEnergy: EnergyBreakdown;
  trapState: TrapState2Q;
}

export function EnergySection({ isTrap, trapEnergy, trapState }: Props) {
  return (
    <div>
      <SectionLabel>hamiltonian energy</SectionLabel>
      <EnergyGauge energy={isTrap ? trapEnergy.total : 0} energyTheory={0} />
      {isTrap && (
        <>
          <div
            className="mt-2 flex gap-4 text-[10px]"
            style={{ color: "#6b6780" }}
          >
            <span>H_out = {trapEnergy.H_out.toFixed(2)}</span>
            <span>H_in = {trapEnergy.H_in.toFixed(2)}</span>
            <span style={{ color: TRAP_COLOR, fontWeight: 600 }}>
              H_prop = {trapEnergy.H_prop.toFixed(2)} ←
            </span>
          </div>
          <p
            className="mt-1.5 text-[11px]"
            style={{
              color: trapState === "11" ? "#f59e0b" : TRAP_COLOR,
              fontStyle: "italic",
            }}
          >
            {VERDICT_SUBTITLE[trapState]}
          </p>
        </>
      )}
    </div>
  );
}
