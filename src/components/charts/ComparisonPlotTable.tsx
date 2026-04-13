import { THRESHOLD_HIGH, THRESHOLD_LOW } from "../../utils/constants";
import type { ComparisonSummaryRow } from "./ComparisonPlot.types";

interface ComparisonPlotTableProps {
  summaryRows: ComparisonSummaryRow[];
}

export function ComparisonPlotTable({ summaryRows }: ComparisonPlotTableProps) {
  return (
    <div
      className="space-y-px border-t pt-2"
      style={{ borderColor: "#1e1c28" }}
    >
      <div className="grid grid-cols-[16px_80px_80px_80px_80px] gap-x-3 pb-1">
        {["", "α", "label", "E(α)", "decision"].map((h) => (
          <span
            key={h}
            className="font-mono text-[9px] uppercase tracking-wider"
            style={{ color: "#6b6780" }}
          >
            {h}
          </span>
        ))}
      </div>
      {summaryRows.map((row, i) => {
        const decision =
          row.energy > THRESHOLD_HIGH
            ? "accept"
            : row.energy < THRESHOLD_LOW
              ? "reject"
              : "boundary";
        const dColor =
          decision === "accept"
            ? "#34d399"
            : decision === "reject"
              ? "#f87171"
              : "#f59e0b";
        return (
          <div
            key={i}
            className="grid grid-cols-[16px_80px_80px_80px_80px] gap-x-3 border-b py-1"
            style={{ borderColor: "#1e1c28" }}
          >
            <div
              className="mt-0.5 h-2 w-2 rounded-full"
              style={{ background: row.color }}
            />
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{ color: row.color }}
            >
              {row.alpha.toFixed(4)}
            </span>
            <span
              className="font-mono text-[11px]"
              style={{ color: "#9490a8" }}
            >
              {row.label}
            </span>
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{ color: "#e8a020" }}
            >
              {row.energy.toFixed(4)}
            </span>
            <span
              className="font-mono text-[10px] tracking-wider"
              style={{ color: dColor }}
            >
              {decision.toUpperCase().slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
