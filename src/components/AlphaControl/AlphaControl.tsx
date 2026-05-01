import type { AlphaControlProps } from "../../types/alpha";
import { AlphaSlider } from "./components/AlphaSlider";
import { AlphaPresets } from "./components/AlphaPresets";
import { Card, Text } from "../../ui";
import { nearestKeyIndex } from "../../utils/alphaUtils";
import { KEY_ALPHAS } from "../../utils/constants";

export function AlphaControl({ alpha, setAlpha }: AlphaControlProps) {
  const keyValues = KEY_ALPHAS.map((k) => k.value);
  const snappedIdx = nearestKeyIndex(alpha, keyValues);
  const preset = snappedIdx >= 0 ? KEY_ALPHAS[snappedIdx] : null;
  return (
    <Card className="flex-1 rounded-lg" padded="md">
      <div className="space-y-4">
        <AlphaSlider alpha={alpha} onChange={setAlpha} guidedMode={true} />
        <AlphaPresets alpha={alpha} onSelect={setAlpha} />
        {preset && (
          <Text variant="caption" className="mt-2">
            {preset.insight}
          </Text>
        )}
      </div>
    </Card>
  );
}
