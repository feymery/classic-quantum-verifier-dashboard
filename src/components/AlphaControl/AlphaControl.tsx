import type { AlphaControlProps } from "../../types/alpha";
import { AlphaSlider } from "./components/AlphaSlider";
import { AlphaPresets } from "./components/AlphaPresets";
import { Card } from "../../ui";

export function AlphaControl({
  alpha,
  setAlpha,
  selectedAlphas = [],
  toggleAlpha = () => {},
}: AlphaControlProps) {
  return (
    <Card className="rounded-lg" padded="md" title="Alpha Control">
      <div className="space-y-4">
        <AlphaSlider alpha={alpha} onChange={setAlpha} guidedMode={true} />
        <AlphaPresets
          alpha={alpha}
          onSelect={setAlpha}
          selectedAlphas={selectedAlphas}
          onToggle={toggleAlpha}
        />
      </div>
    </Card>
  );
}
