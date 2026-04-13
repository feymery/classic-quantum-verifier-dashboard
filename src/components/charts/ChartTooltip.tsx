import type { TooltipPayload } from "recharts";
import { CHART_COLORS, CHART_FONT } from "./chartTheme";

interface TooltipRow {
  label: string;
  value: string | number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string | number;
  rows?: TooltipRow[];
  title?: string;
}

/**
 * ChartTooltip — used as the `content` prop on Recharts <Tooltip>.
 * Pass `rows` for full control, or let Recharts pass payload automatically.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  rows,
  title,
}: ChartTooltipProps) {
  if (!active) return null;

  const displayRows: TooltipRow[] =
    rows ??
    (payload ?? []).map((p) => {
      const v = p.value;
      const strVal = Array.isArray(v)
        ? v.join(" – ")
        : typeof v === "number"
          ? v.toFixed(4)
          : String(v ?? "");
      return {
        label: String(p.name ?? ""),
        value: strVal,
        color: String(p.color ?? CHART_COLORS.curve),
      };
    });

  if (displayRows.length === 0) return null;

  return (
    <div
      style={{
        background: CHART_COLORS.tooltip,
        border: `1px solid ${CHART_COLORS.tooltipBorder}`,
        borderRadius: 6,
        padding: "8px 10px",
        fontFamily: CHART_FONT.family,
        fontSize: 10,
        pointerEvents: "none",
      }}
    >
      {(title ?? label) !== undefined && (
        <div style={{ color: "#9490a8", marginBottom: 5 }}>
          {title ?? label}
        </div>
      )}
      {displayRows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: row.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#9490a8", minWidth: 80 }}>{row.label}</span>
          <span style={{ color: row.color } as React.CSSProperties}>
            {typeof row.value === "number" ? row.value.toFixed(4) : row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
