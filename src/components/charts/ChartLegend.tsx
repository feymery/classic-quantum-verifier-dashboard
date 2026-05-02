/**
 * ChartLegend.tsx
 * Shared legend item for all Recharts panels.
 *
 * Types:
 *   "line"    — thin horizontal line (curve / theoretical)
 *   "bar"     — small rect with semi-transparent fill (histogram bar)
 *   "dot"     — circle (scatter point / chip)
 *   "diamond" — rotated square border (Born-rule / dashed reference)
 */

export type ChartLegendType = "line" | "bar" | "dot" | "diamond";

interface ChartLegendItemProps {
  type: ChartLegendType;
  /** Stroke / main colour */
  color: string;
  /**
   * Fill background override for "bar" type.
   * Defaults to `${color}44` (≈27 % opacity).
   */
  fillColor?: string;
  label: string;
}

export function ChartLegendItem({
  type,
  color,
  fillColor,
  label,
}: ChartLegendItemProps) {
  const bg = fillColor ?? `${color}44`;

  let marker: React.ReactNode;

  switch (type) {
    case "line":
      marker = (
        <div
          style={{ width: 16, height: 1.5, background: color, flexShrink: 0 }}
        />
      );
      break;
    case "bar":
      marker = (
        <div
          style={{
            width: 10,
            height: 10,
            background: bg,
            border: `1px solid ${color}`,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
      );
      break;
    case "dot":
      marker = (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
      );
      break;
    case "diamond":
      marker = (
        <div
          style={{
            width: 8,
            height: 8,
            border: `1.5px solid ${color}`,
            transform: "rotate(45deg)",
            flexShrink: 0,
          }}
        />
      );
      break;
  }

  return (
    <div className="flex items-center gap-1.5">
      {marker}
      <span className="text-[10px] text-subtle">{label}</span>
    </div>
  );
}
