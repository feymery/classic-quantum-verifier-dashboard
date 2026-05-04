import type { TrapState2Q } from "./ClassicalStateTrap.types";
import type { EnergyBreakdown } from "../../shared/trapShared.types";

export function trapEnergyBreakdown(
  trapState: TrapState2Q,
  alpha: number,
): EnergyBreakdown {
  const validOutput = trapState === "00" || trapState === "11";
  const H_out = validOutput ? 0 : 0.5;
  const H_in_penalty = trapState === "10" ? 1.5 : 0;
  const H_prop = 1.5 * (1 - Math.cos(2 * alpha) / 2);
  return {
    H_out,
    H_in: H_in_penalty,
    H_prop,
    total: H_out + H_in_penalty + H_prop,
  };
}
