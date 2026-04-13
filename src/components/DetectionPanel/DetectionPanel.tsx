import { Panel } from "../../ui/Panel";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Text } from "../../ui/Text";

interface DetectionPanelProps {
  deltaE: number;
  detectionProbability: number;
  minShotsRequired: number;
  shots: number;
  confidenceLevel: number;
  detectabilityScore: number;
  isDetectable: boolean;
  riskLevel: "green" | "amber" | "red";
  onConfidenceChange: (v: number) => void;
}

function riskColor(riskLevel: "green" | "amber" | "red") {
  if (riskLevel === "green") return "#34d399";
  if (riskLevel === "amber") return "#c7a472";
  return "#f87171";
}

function riskLabel(riskLevel: "green" | "amber" | "red") {
  if (riskLevel === "green") return "safe";
  if (riskLevel === "amber") return "borderline";
  return "detectable cheating";
}

export function DetectionPanel({
  deltaE,
  detectionProbability,
  minShotsRequired,
  shots,
  confidenceLevel,
  detectabilityScore,
  isDetectable,
  riskLevel,
  onConfidenceChange,
}: DetectionPanelProps) {
  const accent = riskColor(riskLevel);

  return (
    <Panel
      step="step G"
      title="Detection Analysis"
      description="Shot-noise robustness against adversarial manipulation."
      wide
    >
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["ΔE", `${deltaE >= 0 ? "+" : ""}${deltaE.toFixed(4)}`],
          [
            "detection probability",
            `${(detectionProbability * 100).toFixed(1)}%`,
          ],
          [
            "minimum shots",
            Number.isFinite(minShotsRequired)
              ? minShotsRequired.toLocaleString()
              : "> 1M",
          ],
          ["detectability score", `${(detectabilityScore * 100).toFixed(1)}%`],
        ].map(([label, value]) => (
          <Card
            key={label}
            className="rounded-xl"
            padded="sm"
            style={{ borderColor: "#2d2b3a", background: "#1d1b25" }}
          >
            <Text
              variant="caption"
              className="uppercase tracking-[0.22em]"
              style={{ color: "#6b6780" }}
            >
              {label}
            </Text>
            <Text variant="subtitle" className="mt-2 text-lg">
              {value}
            </Text>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <Card
          className="rounded-xl"
          padded="sm"
          style={{ borderColor: "#2d2b3a", background: "#1d1b25" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="font-mono text-[10px]"
              style={{ color: "#6b6780" }}
            >
              confidence level
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#c7a472" }}
            >
              {(confidenceLevel * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min={0.9}
            max={0.99}
            step={0.01}
            value={confidenceLevel}
            onChange={(e) => onConfidenceChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full cursor-pointer appearance-none bg-[#2d2b3a] accent-[#c7a472] shadow-inner shadow-black/30"
            aria-label="Confidence level"
          />
          <p
            className="mt-2 font-mono text-[10px]"
            style={{ color: "#6b6780" }}
          >
            current shots: {shots.toLocaleString()}
          </p>
        </Card>

        <Card
          className="rounded-xl"
          padded="sm"
          style={{
            borderColor: accent,
            background: "#1b1823",
          }}
        >
          <Text
            variant="caption"
            className="uppercase tracking-[0.24em]"
            style={{ color: "#6b6780" }}
          >
            status
          </Text>
          <Text
            as="p"
            variant="subtitle"
            className="mt-2 text-lg"
            style={{ color: accent }}
          >
            {isDetectable ? "DETECTABLE" : "NOT DETECTABLE"}
          </Text>
          <Badge
            variant={
              riskLevel === "green"
                ? "success"
                : riskLevel === "amber"
                  ? "warning"
                  : "error"
            }
            className="mt-2 rounded px-0 py-0 font-mono text-[10px] font-normal"
            style={{
              background: "transparent",
              borderColor: "transparent",
              color: "#9490a8",
            }}
          >
            risk level: {riskLabel(riskLevel)}
          </Badge>
          <p
            className="mt-1 font-mono text-[10px]"
            style={{ color: "#9490a8" }}
          >
            detectability reference at {(confidenceLevel * 100).toFixed(0)}%
            confidence
          </p>
        </Card>
      </div>
    </Panel>
  );
}
