import { useState, useCallback } from "react";
import type { AlphaControlProps } from "../../types/alpha";
import { AlphaSlider } from "./components/AlphaSlider";
import { AlphaPresets } from "./components/AlphaPresets";
import { AlphaInsight } from "./components/AlphaInsight";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { Card } from "../../ui/Card";

const MAX_COMPARISON = 4;

export function AlphaControl({
  alpha,
  setAlpha,
  comparisonAlphas,
  setComparisonAlphas,
}: AlphaControlProps) {
  const [compareMode, setCompareMode] = useState(false);

  const handleAddToComparison = useCallback(
    (v: number) => {
      if (comparisonAlphas.some((a) => Math.abs(a - v) < 0.001)) return; // no duplicates
      if (comparisonAlphas.length >= MAX_COMPARISON) return; // cap at 4
      setComparisonAlphas([...comparisonAlphas, v]);
    },
    [comparisonAlphas, setComparisonAlphas],
  );

  const handleRemoveFromComparison = useCallback(
    (v: number) => {
      setComparisonAlphas(
        comparisonAlphas.filter((a) => Math.abs(a - v) >= 0.001),
      );
    },
    [comparisonAlphas, setComparisonAlphas],
  );

  const handleToggleMode = useCallback(() => setCompareMode((m) => !m), []);

  const handleClearComparison = useCallback(
    () => setComparisonAlphas([]),
    [setComparisonAlphas],
  );

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-4">
        <AlphaSlider alpha={alpha} onChange={setAlpha} guidedMode={true} />

        {/* Preset buttons */}
        <AlphaPresets
          alpha={alpha}
          compareMode={compareMode}
          comparisonAlphas={comparisonAlphas}
          onSelect={setAlpha}
          onAddToComparison={handleAddToComparison}
        />

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "#1e1c28" }} />

        {/* Insight card */}
        <AlphaInsight alpha={alpha} />

        {/* Comparison panel */}
        <ComparisonPanel
          compareMode={compareMode}
          comparisonAlphas={comparisonAlphas}
          onToggleMode={handleToggleMode}
          onRemove={handleRemoveFromComparison}
          onClear={handleClearComparison}
        />
      </div>
    </Card>
  );
}
