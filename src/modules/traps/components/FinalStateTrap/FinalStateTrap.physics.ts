import type { ClaimStep } from "./FinalStateTrap.types";
import type { EnergyBreakdown } from "../../shared/trapShared.types";

export function trapEnergyBreakdown(
  claimStep: ClaimStep,
  alpha: number,
): EnergyBreakdown {
  const H_out = claimStep === "t2" ? 0 : 0.5;
  const H_in = claimStep === "t0" ? 0 : 0.25;
  const H_prop = 2 * 0.75 * (1 - Math.cos(2 * alpha) / 2);
  return { H_out, H_in, H_prop, total: H_out + H_in + H_prop };
}

export function trapCounts2Q(
  claimStep: ClaimStep,
  alpha: number,
  shots: number,
): Record<string, number> {
  switch (claimStep) {
    case "t0":
      return { "00": shots, "01": 0, "10": 0, "11": 0 };
    case "t1": {
      const c2 = Math.pow(Math.cos(alpha / 2), 2);
      const s2 = Math.pow(Math.sin(alpha / 2), 2);
      return {
        "00": Math.round((c2 / 2) * shots),
        "10": Math.round((s2 / 2) * shots),
        "01": Math.round((s2 / 2) * shots),
        "11": Math.round((c2 / 2) * shots),
      };
    }
    case "t2":
      return {
        "00": Math.round(((1 + Math.cos(alpha)) / 4) * shots),
        "01": Math.round(((1 - Math.cos(alpha)) / 4) * shots),
        "10": Math.round(((1 - Math.cos(alpha)) / 4) * shots),
        "11": Math.round(((1 + Math.cos(alpha)) / 4) * shots),
      };
  }
}
