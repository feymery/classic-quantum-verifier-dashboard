import { formatAlpha } from "../../../../utils/alphaUtils";
import type { TooltipPayload } from "recharts";
import { ChartTooltip } from "../../ChartTooltip";

interface EnergyPlotTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayload;
  label?: unknown;
}

export function EnergyPlotTooltipContent({
  active,
  payload,
  label,
}: EnergyPlotTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const alphaVal = Number(label);
  const rows = payload
    .filter((point) => point.value !== undefined)
    .map((point) => ({
      label: String(point.name),
      value: Number(point.value).toFixed(4),
      color: String(point.color),
    }));

  return (
    <ChartTooltip
      active={active}
      payload={payload}
      title={`α = ${formatAlpha(alphaVal)} (${alphaVal.toFixed(3)})`}
      rows={rows}
    />
  );
}
