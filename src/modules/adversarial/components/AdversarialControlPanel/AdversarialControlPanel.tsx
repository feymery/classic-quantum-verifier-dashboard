import type { AdversarialStrategyType } from "../../physics/adversarial";
import { Panel } from "../../../../ui/Panel";
import { Button } from "../../../../ui/Button";

interface AdversarialControlPanelProps {
  alpha: number;
  alphaFake: number;
  epsilon: number;
  enabled: boolean;
  strategyType: AdversarialStrategyType;
  onEpsilonChange: (v: number) => void;
  onEnabledChange: (v: boolean) => void;
  onStrategyChange: (v: AdversarialStrategyType) => void;
}

const strategyDescriptions: Record<AdversarialStrategyType, string> = {
  "bias-shift": "Applies a fixed epsilon shift to alpha.",
  "threshold-attack": "Pushes alpha_fake toward the accept threshold region.",
  "noise-adaptive-cheating":
    "Increases cheating strength when shots are low and noise is high.",
};

export function AdversarialControlPanel({
  alpha,
  alphaFake,
  epsilon,
  enabled,
  strategyType,
  onEpsilonChange,
  onEnabledChange,
  onStrategyChange,
}: AdversarialControlPanelProps) {
  return (
    <Panel
      step="step G"
      title="Adversarial Control"
      description="Configure fake prover behavior and inspect the manipulated alpha value."
    >
      <div className="space-y-4">
        <label
          className="flex items-center justify-between px-3 py-2 border rounded-lg"
          style={{ borderColor: "#2d2b3a", background: "#1d1b25" }}
        >
          <span className=" text-[11px]" style={{ color: "#ddd9ee" }}>
            adversarial mode
          </span>
          <Button
            aria-pressed={enabled}
            onClick={() => onEnabledChange(!enabled)}
            size="sm"
            variant="secondary"
            className="rounded-lg px-3 py-1  text-[10px] font-normal"
            style={{
              background: enabled ? "#a78bfa" : "#2d2b3a",
              color: enabled ? "#131217" : "#9490a8",
            }}
          >
            {enabled ? "ON" : "OFF"}
          </Button>
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between">
            <span className=" text-[10px]" style={{ color: "#6b6780" }}>
              epsilon bias
            </span>
            <span className=" text-[10px]" style={{ color: "#c7a472" }}>
              {epsilon.toFixed(4)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={0.2}
            step={0.0025}
            value={epsilon}
            onChange={(e) => onEpsilonChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg cursor-pointer appearance-none bg-border accent-caution shadow-inner shadow-black/30"
            aria-label="Epsilon bias"
          />
        </label>

        <label className="block space-y-2">
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            strategy type
          </span>
          <select
            value={strategyType}
            onChange={(e) =>
              onStrategyChange(e.target.value as AdversarialStrategyType)
            }
            className="w-full px-3 py-2 text-sm border rounded-lg"
            style={{
              borderColor: "#2d2b3a",
              background: "#1d1b25",
              color: "#ddd9ee",
            }}
          >
            <option value="bias-shift">bias shift</option>
            <option value="threshold-attack">threshold attack</option>
            <option value="noise-adaptive-cheating">
              noise adaptive cheating
            </option>
          </select>
        </label>

        <div
          className="p-3 space-y-1 border rounded-lg"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <p className=" text-[10px]" style={{ color: "#6b6780" }}>
            α (claimed): {alpha.toFixed(4)}
          </p>
          <p className=" text-[10px]" style={{ color: "#c78572" }}>
            α_fake (manipulated): {alphaFake.toFixed(4)}
          </p>
          <p className=" text-[10px]" style={{ color: "#9490a8" }}>
            {strategyDescriptions[strategyType]}
          </p>
        </div>
      </div>
    </Panel>
  );
}
