export interface HistogramDatum {
  state: string;
  count: number;
  observed: number;
  expected: number;
  expectedState: boolean;
}

export type LegendType = "bar" | "line" | "chip";
