/**
 * chartTheme.ts
 * Centralised Recharts style tokens — import once, use everywhere.
 * All values are typed so mis-spellings fail at compile time.
 */

export const CHART_COLORS = {
  curve: "#a78bfa",
  curveGlow: "rgba(167,139,250,0.15)",
  theoretical: "#a78bfa",
  estimated: "#e8a020",
  secondaryMuted: "#9a91ad",
  secondaryLine: "rgba(154,145,173,0.3)",
  adversarialClaim: "#b7a8cf",
  adversarialActual: "#c7a472",
  thresholdLow: "#f87171",
  thresholdHigh: "#f59e0b",
  accept: "#34d399",
  reject: "#f87171",
  grid: "rgba(46,43,58,0.7)",
  axis: "#6b6780",
  tooltip: "#181620",
  tooltipBorder: "#2d2b3a",
  comparison: ["#a78bfa", "#d8b4fe", "#f59e0b", "#34d399"] as const,
} as const;

export const CHART_FONT = {
  family: "'Courier New', monospace",
  size: 10,
  fill: "#6b6780",
} as const;

/** Standard axis props — spread into <XAxis> / <YAxis> */
export const axisProps = {
  tick: {
    fontFamily: CHART_FONT.family,
    fontSize: CHART_FONT.size,
    fill: CHART_FONT.fill,
  },
  axisLine: { stroke: "rgba(46,43,58,0.5)", strokeWidth: 0.5 },
  tickLine: { stroke: "rgba(46,43,58,0.5)", strokeWidth: 0.5 },
} as const;

/** Standard CartesianGrid props */
export const gridProps = {
  stroke: CHART_COLORS.grid,
  strokeWidth: 0.5,
  strokeDasharray: "3 3",
} as const;

/** Recharts responsive container default height */
export const CHART_HEIGHT = 200;
export const HISTOGRAM_HEIGHT = 140;
