import { formatAlpha } from "../../../../utils/alphaUtils";
import { CHART_COLORS } from "../../chartTheme";

interface EnergyPlotSummaryProps {
  alpha: number;
  currentE: number;
  estimatedE: number | undefined;
}

export function EnergyPlotSummary({
  alpha,
  currentE,
  estimatedE,
}: EnergyPlotSummaryProps) {
  return (
    <>
      <div
        className="flex items-center gap-4 border-t pt-1"
        style={{ borderColor: "#1e1c28" }}
      >
        <Stat label="α" value={formatAlpha(alpha)} color="#a78bfa" />
        <Stat
          label="theoretical"
          value={currentE.toFixed(4)}
          color={CHART_COLORS.theoretical}
        />
        {estimatedE != null && (
          <Stat
            label="estimated"
            value={estimatedE.toFixed(4)}
            color={CHART_COLORS.estimated}
          />
        )}
        {estimatedE != null && (
          <Stat
            label="Δ"
            value={`${estimatedE - currentE >= 0 ? "+" : ""}${(estimatedE - currentE).toFixed(4)}`}
            color={
              Math.abs(estimatedE - currentE) < 0.02 ? "#34d399" : "#f59e0b"
            }
          />
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className=" text-[10px]" style={{ color: "#6b6780" }}>
        {label}
      </span>
      <span className=" text-[11px]" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
