// Energy table from Stricker et al. 2024 — independent of α for classical states
export const CLASSICAL_STATE_ROWS = [
  { state: "00", H_out: "0", H_in6: "0", H_prop3: "3/2", total: 1.5 },
  { state: "01", H_out: "0", H_in6: "3/2", H_prop3: "3/2", total: 3.0 },
  { state: "10", H_out: "0", H_in6: "9/2", H_prop3: "3/2", total: 6.0 },
  { state: "11", H_out: "2", H_in6: "0", H_prop3: "3/2", total: 3.5 },
] as const;

export const BAR_DATA = CLASSICAL_STATE_ROWS.map((r) => ({
  label: `|${r.state}⟩`,
  energy: r.total,
}));

export const THRESHOLD = 0.4;
