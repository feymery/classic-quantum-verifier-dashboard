import { formatAlpha, verifierDecision } from "../../utils/alphaUtils";
import { THRESHOLD_HIGH, THRESHOLD_LOW } from "../../utils/constants";
import { CHART_COLORS } from "./chartTheme";

interface EnergyPlotSummaryProps {
  alpha: number;
  currentE: number;
  estimatedE: number | undefined;
  comparisonAlphas: number[];
  comparisonTheoretical: number[];
  comparisonMeasured: Array<number | undefined>;
  comparisonLoading: boolean;
}

export function EnergyPlotSummary({
  alpha,
  currentE,
  estimatedE,
  comparisonAlphas,
  comparisonTheoretical,
  comparisonMeasured,
  comparisonLoading,
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
        {estimatedE !== undefined && (
          <Stat
            label="estimated"
            value={estimatedE.toFixed(4)}
            color={CHART_COLORS.estimated}
          />
        )}
        {estimatedE !== undefined && (
          <Stat
            label="Δ"
            value={`${estimatedE - currentE >= 0 ? "+" : ""}${(estimatedE - currentE).toFixed(4)}`}
            color={
              Math.abs(estimatedE - currentE) < 0.02 ? "#34d399" : "#f59e0b"
            }
          />
        )}
      </div>

      {comparisonAlphas.length > 0 && (
        <div
          className="overflow-hidden rounded border"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <div
            className="grid grid-cols-[84px_76px_76px_60px_72px_72px] gap-x-2 border-b px-2.5 py-1.5"
            style={{ borderColor: "#2d2b3a" }}
          >
            {["α", "E_theory", "E_meas", "Δ", "theory", "measured"].map(
              (head) => (
                <span
                  key={head}
                  className=" text-[10px] text-right first:text-left"
                  style={{ color: "#6b6780" }}
                >
                  {head}
                </span>
              ),
            )}
          </div>

          <div className="divide-y" style={{ borderColor: "#1e1c28" }}>
            {comparisonAlphas.map((ca, i) => {
              const theory = comparisonTheoretical[i];
              const measured = comparisonMeasured[i];
              const delta = measured !== undefined ? measured - theory : null;
              const dTheory = verifierDecision(
                theory,
                THRESHOLD_LOW,
                THRESHOLD_HIGH,
              );
              const dMeasured =
                measured !== undefined
                  ? verifierDecision(measured, THRESHOLD_LOW, THRESHOLD_HIGH)
                  : null;
              const color =
                CHART_COLORS.comparison[i % CHART_COLORS.comparison.length];

              return (
                <div
                  key={`cmp-row-${i}`}
                  className="grid grid-cols-[84px_76px_76px_60px_72px_72px] gap-x-2 px-2.5 py-1.5"
                >
                  <span className=" text-[11px]" style={{ color }}>
                    {formatAlpha(ca)}
                  </span>
                  <span
                    className=" text-[11px] text-right"
                    style={{ color: "#a78bfa" }}
                  >
                    {theory.toFixed(4)}
                  </span>
                  <span
                    className=" text-[11px] text-right"
                    style={{ color: "#e8a020" }}
                  >
                    {measured !== undefined
                      ? measured.toFixed(4)
                      : comparisonLoading
                        ? "..."
                        : "--"}
                  </span>
                  <span
                    className=" text-[11px] text-right"
                    style={{
                      color:
                        delta === null
                          ? "#6b6780"
                          : Math.abs(delta) < 0.02
                            ? "#34d399"
                            : "#f59e0b",
                    }}
                  >
                    {delta === null
                      ? "--"
                      : `${delta >= 0 ? "+" : ""}${delta.toFixed(3)}`}
                  </span>
                  <DecisionBadge decision={dTheory} />
                  <DecisionBadge decision={dMeasured} />
                </div>
              );
            })}
          </div>
        </div>
      )}
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

function DecisionBadge({
  decision,
}: {
  decision: "accept" | "reject" | "boundary" | null;
}) {
  if (!decision) {
    return (
      <span className="text-right  text-[10px]" style={{ color: "#6b6780" }}>
        --
      </span>
    );
  }

  const style =
    decision === "accept"
      ? { color: "#34d399", label: "ACCEPT" }
      : decision === "reject"
        ? { color: "#f87171", label: "REJECT" }
        : { color: "#f59e0b", label: "BOUNDARY" };

  return (
    <span
      className="text-right  text-[9px] tracking-wide"
      style={{ color: style.color }}
    >
      {style.label}
    </span>
  );
}
