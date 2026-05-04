export type Mode = "honest" | "trap";

export interface EnergyBreakdown {
  H_out: number;
  H_in: number;
  H_prop: number;
  total: number;
}
