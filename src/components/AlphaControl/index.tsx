import { useState, useCallback } from "react";
import type { AlphaControlProps } from "../../types/alpha";
import { AlphaSlider } from "./AlphaSlider";
import { AlphaPresets } from "./AlphaPresets";
import { AlphaInsight } from "./AlphaInsight";
import { ComparisonPanel } from "./ComparisonPanel";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Text } from "../../ui/Text";

const MAX_COMPARISON = 4;

export function AlphaControl({
  alpha,
  setAlpha,
  comparisonAlphas,
  setComparisonAlphas,
}: AlphaControlProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [guidedMode, setGuidedMode] = useState(true);

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="quantum"
              className="rounded px-1.5 py-0.5  text-[10px]"
            >
              step B
            </Badge>
            <Text
              as="span"
              variant="caption"
              className="text-xs font-medium text-[#ddd9ee]"
            >
              Alpha Control
            </Text>
          </div>
          <Text
            as="span"
            variant="caption"
            className="text-[10px]"
            style={{ color: "#6b6780" }}
          >
            U(α) = cos(α)·Z + sin(α)·X
          </Text>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className=" text-[10px]" style={{ color: "#6b6780" }}>
              α input mode
            </span>
            <div
              className="inline-flex overflow-hidden border rounded"
              style={{ borderColor: "#2d2b3a" }}
            >
              <Button
                onClick={() => setGuidedMode(true)}
                size="sm"
                variant="secondary"
                className="rounded-none border-0 px-2 py-1  text-[10px]"
                style={{
                  color: guidedMode ? "#0f0e14" : "#9490a8",
                  background: guidedMode ? "#a78bfa" : "#181620",
                }}
              >
                guided
              </Button>
              <Button
                onClick={() => setGuidedMode(false)}
                size="sm"
                variant="secondary"
                className="rounded-none border-0 px-2 py-1  text-[10px]"
                style={{
                  color: !guidedMode ? "#0f0e14" : "#9490a8",
                  background: !guidedMode ? "#e8a020" : "#181620",
                }}
              >
                free
              </Button>
            </div>
          </div>

          <AlphaSlider
            alpha={alpha}
            onChange={setAlpha}
            guidedMode={guidedMode}
          />

          <p className=" text-[10px]" style={{ color: "#6b6780" }}>
            {guidedMode
              ? "guided: slider snaps to key protocol values"
              : "free: continuous alpha selection, no snapping"}
          </p>
        </div>

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
