import type { AlphaControlProps } from "../../types/alpha";
import { AlphaSlider } from "./components/AlphaSlider";
import { AlphaPresets } from "./components/AlphaPresets";
import { AlphaInsight } from "./components/AlphaInsight";
import { Card } from "../../ui/Card";

export function AlphaControl({ alpha, setAlpha }: AlphaControlProps) {
  return (
    <Card className="flex-1 rounded-lg" padded="md">
      <div className="space-y-4">
        <AlphaSlider alpha={alpha} onChange={setAlpha} guidedMode={true} />

        {/* Preset buttons */}
        <AlphaPresets alpha={alpha} onSelect={setAlpha} />

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "#1e1c28" }} />

        {/* Insight card */}
        <AlphaInsight alpha={alpha} />
      </div>
    </Card>
  );
}
