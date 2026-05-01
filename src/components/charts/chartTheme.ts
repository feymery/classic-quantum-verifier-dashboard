/**
 * chartTheme.ts
 * Centralised Recharts style tokens — import once, use everywhere.
 * Values reference CSS custom properties from @theme in index.css so the
 * chart palette updates automatically when design tokens change.
 * All values are typed so mis-spellings fail at compile time.
 */

export const CHART_COLORS = {
  curve: "var(--color-accent)",
  curveGlow: "rgba(167,139,250,0.15)" /* accent/15 — SVG compat */,
  theoretical: "var(--color-accent)",
  estimated: "var(--color-gold)",
  secondaryMuted: "var(--color-muted)",
  secondaryLine: "rgba(154,145,173,0.3)" /* muted/30  — SVG compat */,
  adversarialClaim: "#b7a8cf" /* unique shade, no token */,
  adversarialActual: "var(--color-caution)",
  thresholdLow: "var(--color-danger)",
  thresholdHigh: "var(--color-warning)",
  accept: "var(--color-success)",
  reject: "var(--color-danger)",
  grid: "rgba(46,43,58,0.7)" /* border/70 — SVG compat */,
  axis: "var(--color-subtle)",
  tooltip: "var(--color-surface)",
  tooltipBorder: "var(--color-border)",
} as const;

export const CHART_FONT = {
  family: "'Courier New', monospace",
  size: 10,
  fill: "var(--color-subtle)",
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
