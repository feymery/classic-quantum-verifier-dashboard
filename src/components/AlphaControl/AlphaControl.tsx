import type { AlphaControlProps } from "../../types/alpha";
import { AlphaSlider } from "./components/AlphaSlider";
import { AlphaPresets } from "./components/AlphaPresets";
import { AlphaInsightPanel } from "./components/AlphaInsightPanel";
import { Card } from "../../ui";
import { nearestKeyIndex } from "../../utils/alphaUtils";
import { KEY_ALPHAS } from "../../utils/constants";

export function AlphaControl({ alpha, setAlpha }: AlphaControlProps) {
  const keyValues = KEY_ALPHAS.map((k) => k.value);
  const snappedIdx = nearestKeyIndex(alpha, keyValues);
  const preset = snappedIdx >= 0 ? KEY_ALPHAS[snappedIdx] : null;
  return (
    <Card className="rounded-lg" padded="md" title="Alpha Control">
      <div className="space-y-4">
        <AlphaSlider alpha={alpha} onChange={setAlpha} guidedMode={true} />
        <AlphaPresets alpha={alpha} onSelect={setAlpha} />
        {preset && <AlphaInsightPanel alpha={alpha} preset={preset} />}
      </div>
    </Card>
  );
}
