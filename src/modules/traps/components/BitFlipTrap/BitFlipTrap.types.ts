export type FlipTarget = "clock" | "work" | "both";

export interface BitFlipObservables {
  Z1: number;
  Z2: number;
  Z1Z2: number;
  Z1X2: number;
  X1X2: number;
  E_noisy: number;
  E_ideal: number;
}

export interface StateDistribution {
  "00": number;
  "01": number;
  "10": number;
  "11": number;
}
