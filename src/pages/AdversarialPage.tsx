import { useMemo, useState } from "react";
import { NoisePanel } from "../components/NoisePanel";
import { AdversarialControlPanel } from "../components/AdversarialControlPanel/AdversarialControlPanel";
import { AdversarialPlot } from "../components/AdversarialPlot/AdversarialPlot";
import { DetectionPanel } from "../components/DetectionPanel/DetectionPanel";
import type { AdversarialStrategyType } from "../adversarial/adversarial";
import { simulateAdversarial } from "../services/simulateAdversarial";
import { useAppState } from "../state/useAppState";

export function AdversarialPage() {
  const { dashboard } = useAppState();
  const [epsilon, setEpsilon] = useState(0.04);
  const [enabled, setEnabled] = useState(true);
  const [strategyType, setStrategyType] =
    useState<AdversarialStrategyType>("bias-shift");
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);

  const analysis = useMemo(
    () =>
      simulateAdversarial({
        alpha: dashboard.alpha,
        epsilon,
        strategyType,
        noiseLambda: dashboard.noiseLambda,
        shots: dashboard.shots,
        enabled,
        confidenceLevel,
      }),
    [
      dashboard.alpha,
      dashboard.noiseLambda,
      dashboard.shots,
      confidenceLevel,
      enabled,
      epsilon,
      strategyType,
    ],
  );

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <NoisePanel
        alpha={dashboard.alpha}
        noiseLambda={dashboard.noiseLambda}
        onNoiseLambdaChange={dashboard.setNoiseLambda}
      />

      <AdversarialControlPanel
        alpha={dashboard.alpha}
        alphaFake={analysis.adversarial.alpha_fake}
        epsilon={epsilon}
        enabled={enabled}
        strategyType={strategyType}
        onEpsilonChange={setEpsilon}
        onEnabledChange={setEnabled}
        onStrategyChange={setStrategyType}
      />

      <div className="xl:col-span-2">
        <AdversarialPlot
          alpha={dashboard.alpha}
          epsilon={epsilon}
          strategyType={strategyType}
          noiseLambda={dashboard.noiseLambda}
          shots={dashboard.shots}
          enabled={enabled}
          confidenceLevel={confidenceLevel}
        />
      </div>

      <div className="xl:col-span-2">
        <DetectionPanel
          deltaE={analysis.detection.deltaE}
          detectionProbability={analysis.detection.detectionProbability}
          minShotsRequired={analysis.detection.minShotsRequired}
          shots={dashboard.shots}
          confidenceLevel={analysis.detection.confidenceLevel}
          detectabilityScore={analysis.detection.detectabilityScore}
          isDetectable={analysis.detection.isDetectable}
          riskLevel={analysis.detection.riskLevel}
          onConfidenceChange={setConfidenceLevel}
        />
      </div>
    </div>
  );
}
