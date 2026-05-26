import { formatAlpha } from "../../../../utils/alphaUtils";
import type { TooltipPayload } from "recharts";
import { ChartTooltip } from "../../ChartTooltip";
import { CHART_COLORS } from "../../chartTheme";
import type { EnergyPlotPoint } from "../EnergyPlot.types";

interface EnergyPlotTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayload;
  label?: unknown;
}

const VERDICT_COLOR: Record<string, string> = {
  accept: CHART_COLORS.accept,
  reject: CHART_COLORS.reject,
  boundary: CHART_COLORS.thresholdHigh,
};

export function EnergyPlotTooltipContent({
  active,
  payload,
  label,
}: EnergyPlotTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const alphaVal = Number(label);

  // Check if the hovered point carries sweep data (injected into chartData)
  const pt = payload[0]?.payload as EnergyPlotPoint | undefined;
  if (pt?.sweepEst !== undefined) {
    const color =
      VERDICT_COLOR[pt.sweepDecision ?? ""] ?? CHART_COLORS.estimated;
    const displayAlpha = pt.sweepAlpha ?? alphaVal;
    return (
      <ChartTooltip
        active={active}
        payload={payload}
        title={`α = ${formatAlpha(displayAlpha)} (${displayAlpha.toFixed(3)})`}
        rows={[
          { label: "estimated", value: pt.sweepEst.toFixed(4), color },
          {
            label: "theoretical",
            value: pt.theoretical.toFixed(4),
            color: CHART_COLORS.theoretical,
          },
          { label: "verdict", value: pt.sweepDecision ?? "—", color },
          { label: "backend", value: pt.sweepBackend ?? "—", color: "#9490a8" },
        ]}
      />
    );
  }

  // Default: theoretical curve hover
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
