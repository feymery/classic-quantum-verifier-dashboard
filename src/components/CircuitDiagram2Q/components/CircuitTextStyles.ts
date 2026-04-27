const LABEL_COLOR = "#9490a8";

export const labelStyle = {
  fontFamily: "'Courier New', monospace",
  fontSize: 12,
  fill: LABEL_COLOR,
} as const;

export const dimStyle = {
  fontFamily: "'Courier New', monospace",
  fontSize: 9,
  fill: "#6b6780",
} as const;

export const roleStyle = {
  fontFamily: "'Courier New', monospace",
  fontSize: 10,
} as const;

// ── Shared circuit color tokens ───────────────────────────────────────────────
// Use these in all circuit diagram components instead of hardcoding hex values.

export const CIRCUIT_WIRE_COLOR = "#3d3b4a";
export const CIRCUIT_GATE_BG = "#1e1c2a";
export const CIRCUIT_DIM_COLOR = "#6b6780";
export const CIRCUIT_DIMMER_COLOR = "#4b4860";
