import { KEY_ALPHAS } from "../../../utils/constants";
import { energy, nearestKeyIndex } from "../../../utils/alphaUtils";
import { Button } from "../../../ui/Button";

interface AlphaPresetsProps {
  alpha: number;
  compareMode: boolean;
  comparisonAlphas: number[];
  onSelect: (v: number) => void;
  onAddToComparison: (v: number) => void;
}

export function AlphaPresets({
  alpha,
  compareMode,
  comparisonAlphas,
  onSelect,
  onAddToComparison,
}: AlphaPresetsProps) {
  const keyValues = KEY_ALPHAS.map((k) => k.value);
  const snappedIdx = nearestKeyIndex(alpha, keyValues);

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {KEY_ALPHAS.map((ka, i) => {
        const isActive = snappedIdx === i && !compareMode;
        const isInComparison = comparisonAlphas.some(
          (a) => Math.abs(a - ka.value) < 0.001,
        );
        const e = energy(ka.value);

        const handleClick = () => {
          if (compareMode) {
            onAddToComparison(ka.value);
          } else {
            onSelect(ka.value);
          }
        };

        return (
          <Button
            key={ka.label}
            onClick={handleClick}
            variant="secondary"
            size="sm"
            className="group relative flex h-auto flex-col gap-0.5 rounded border px-2.5 py-2 text-left font-normal transition-all duration-150"
            style={{
              background: isActive
                ? `${ka.color}18`
                : isInComparison
                  ? `${ka.color}10`
                  : "#181620",
              borderColor: isActive
                ? ka.color
                : isInComparison
                  ? `${ka.color}66`
                  : "#2d2b3a",
              boxShadow: isActive ? `0 0 12px ${ka.color}22` : "none",
            }}
          >
            {/* Label row */}
            <div className="flex items-center justify-between">
              <span
                className=" text-[11px] font-medium leading-none"
                style={{ color: isActive ? ka.color : "#9490a8" }}
              >
                {ka.label}
              </span>
              {isInComparison && (
                <span
                  className="w-1.5 h-1.5 rounded-lg"
                  style={{ background: ka.color }}
                />
              )}
            </div>

            {/* Desc + energy */}
            <div className="flex items-center justify-between mt-0.5">
              <span
                className="text-[10px] leading-none"
                style={{ color: "#6b6780" }}
              >
                {ka.desc}
              </span>
              <span
                className=" text-[10px] leading-none"
                style={{ color: isActive ? ka.color + "cc" : "#6b6780" }}
              >
                {e.toFixed(2)}
              </span>
            </div>

            {/* Compare mode badge */}
            {compareMode && !isInComparison && (
              <div
                className="absolute inset-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-100  text-[10px]"
                style={{ background: `${ka.color}22`, color: ka.color }}
              >
                + add to compare
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
}
