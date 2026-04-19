import { useMemo } from "react";
import { type AdversarialStrategyType } from "../../physics/adversarial";
import { simulateAdversarial } from "../../services/simulateAdversarial";
import { CHART_COLORS } from "../../../../components/charts/chartTheme";
import { AdversarialPlotChart } from "./components/AdversarialPlotChart";

interface AdversarialPlotProps {
  alpha: number;
  epsilon: number;
  strategyType: AdversarialStrategyType;
  noiseLambda: number;
  shots: number;
  enabled: boolean;
  confidenceLevel: number;
}

export function AdversarialPlot({
  alpha,
  epsilon,
  strategyType,
  noiseLambda,
  shots,
  enabled,
  confidenceLevel,
}: AdversarialPlotProps) {
  const data = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => {
        const alphaValue = (i / 119) * (Math.PI / 2);
        const simulation = simulateAdversarial({
          alpha: alphaValue,
          epsilon,
          strategyType,
          noiseLambda,
          shots,
          enabled,
          confidenceLevel,
        });

        const honest = simulation.adversarial.E_honest;
        const fake = simulation.adversarial.E_fake;
        const low = Math.min(honest, fake);
        const deltaAbs = Math.abs(fake - honest);

        return {
          alpha: alphaValue,
          honest,
          fake,
          low,
          deltaAbs,
        };
      }),
    [confidenceLevel, enabled, epsilon, noiseLambda, shots, strategyType],
  );

  const live = useMemo(
    () =>
      simulateAdversarial({
        alpha,
        epsilon,
        strategyType,
        noiseLambda,
        shots,
        enabled,
        confidenceLevel,
      }),
    [
      alpha,
      confidenceLevel,
      enabled,
      epsilon,
      noiseLambda,
      shots,
      strategyType,
    ],
  );

  return (
    <div
      className="p-3 space-y-2 border rounded-lg"
      style={{ borderColor: "#2d2b3a", background: "#181620" }}
    >
      <div>
        <p className=" text-[10px]" style={{ color: "#ddd9ee" }}>
          Adversarial Energy Curves
        </p>
        <p className=" text-[9px]" style={{ color: "#6b6780" }}>
          Honest E(alpha) versus manipulated E(alpha_fake).
        </p>
      </div>

      <AdversarialPlotChart
        data={data}
        liveAlpha={live.adversarial.alpha}
        liveHonest={live.adversarial.E_honest}
        liveFake={live.adversarial.E_fake}
      />

      <div
        className="flex items-center gap-4  text-[9px]"
        style={{ color: "#6b6780" }}
      >
        <span style={{ color: CHART_COLORS.theoretical }}>honest curve</span>
        <span style={{ color: "#c78572" }}>adversarial curve</span>
        <span style={{ color: "#c7a472" }}>|ΔE| gap</span>
      </div>
    </div>
  );
}
