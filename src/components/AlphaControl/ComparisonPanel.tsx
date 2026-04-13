import { COMPARISON_COLORS } from "../../utils/constants";
import { energy, formatAlpha, verifierDecision } from "../../utils/alphaUtils";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";

interface ComparisonPanelProps {
  compareMode: boolean;
  comparisonAlphas: number[];
  onToggleMode: () => void;
  onRemove: (v: number) => void;
  onClear: () => void;
}

export function ComparisonPanel({
  compareMode,
  comparisonAlphas,
  onToggleMode,
  onRemove,
  onClear,
}: ComparisonPanelProps) {
  return (
    <div className="space-y-2">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px]" style={{ color: "#6b6780" }}>
          comparison mode
        </span>
        <div className="flex items-center gap-2">
          {comparisonAlphas.length > 0 && (
            <Button
              onClick={onClear}
              variant="ghost"
              size="sm"
              className="px-0 py-0 font-mono text-[10px] font-normal hover:text-[#f87171]"
              style={{ color: "#6b6780" }}
            >
              clear all
            </Button>
          )}
          <Button
            onClick={onToggleMode}
            variant="secondary"
            size="sm"
            className="rounded px-2.5 py-1 font-mono text-[10px] font-normal"
            style={{
              background: compareMode ? "rgba(167,139,250,0.1)" : "#181620",
              borderColor: compareMode ? "#a78bfa" : "#2d2b3a",
              color: compareMode ? "#a78bfa" : "#6b6780",
            }}
          >
            {compareMode ? "⊞ comparing" : "⊞ compare"}
          </Button>
        </div>
      </div>

      {/* Hint when mode is on but list is empty */}
      {compareMode && comparisonAlphas.length === 0 && (
        <p
          className="font-mono text-[10px] leading-relaxed"
          style={{ color: "#6b6780" }}
        >
          click presets above to add α values to compare
        </p>
      )}

      {/* Comparison list */}
      {comparisonAlphas.length > 0 && (
        <div className="space-y-1">
          {comparisonAlphas.map((a, i) => {
            const e = energy(a);
            const decision = verifierDecision(e);
            const color = COMPARISON_COLORS[i % COMPARISON_COLORS.length];
            return (
              <div
                key={`${a}-${i}`}
                className="flex items-center gap-2 rounded px-2 py-1.5 border"
                style={{ background: `${color}08`, borderColor: `${color}33` }}
              >
                {/* Color swatch */}
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: color }}
                />

                {/* Alpha value */}
                <span
                  className="font-mono text-[11px] flex-1"
                  style={{ color }}
                >
                  {formatAlpha(a)} = {a.toFixed(4)}
                </span>

                {/* Energy */}
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "#e8a020aa" }}
                >
                  E={e.toFixed(3)}
                </span>

                {/* Decision badge */}
                <Badge
                  variant={
                    decision === "accept"
                      ? "success"
                      : decision === "reject"
                        ? "error"
                        : "warning"
                  }
                  className="rounded px-1.5 py-0 font-mono text-[9px] tracking-wider"
                  style={{
                    color:
                      decision === "accept"
                        ? "#34d399"
                        : decision === "reject"
                          ? "#f87171"
                          : "#f59e0b",
                    background: "transparent",
                    borderColor: "transparent",
                  }}
                >
                  {decision.toUpperCase().slice(0, 3)}
                </Badge>

                {/* Remove */}
                <Button
                  onClick={() => onRemove(a)}
                  variant="ghost"
                  size="sm"
                  className="ml-1 px-0 py-0 font-mono text-[10px] font-normal hover:text-[#f87171]"
                  style={{ color: "#6b6780" }}
                  aria-label={`Remove α = ${a.toFixed(4)} from comparison`}
                >
                  ×
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
