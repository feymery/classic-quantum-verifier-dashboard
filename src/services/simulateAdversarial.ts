import {
  runAdversarialModel,
  type AdversarialInput,
  type AdversarialOutput,
} from "../adversarial/adversarial";
import {
  evaluateDetection,
  type DetectionOutput,
} from "../adversarial/detection";

export interface SimulateAdversarialParams extends AdversarialInput {
  confidenceLevel: number;
}

export interface SimulateAdversarialResult {
  honest: {
    alpha: number;
    energy: number;
  };
  adversarial: AdversarialOutput;
  detection: DetectionOutput & {
    deltaE: number;
  };
}

function energyVariance(e: number) {
  return Math.max(1e-6, e * (1 - e));
}

export function simulateAdversarial(
  params: SimulateAdversarialParams,
): SimulateAdversarialResult {
  const adversarial = runAdversarialModel(params);
  const variance = Math.max(
    energyVariance(adversarial.E_honest),
    energyVariance(adversarial.E_fake),
  );

  const detection = evaluateDetection({
    deltaE: adversarial.deltaE,
    variance,
    shots: params.shots,
    confidenceLevel: params.confidenceLevel,
  });

  return {
    honest: {
      alpha: adversarial.alpha,
      energy: adversarial.E_honest,
    },
    adversarial,
    detection: {
      ...detection,
      deltaE: adversarial.deltaE,
    },
  };
}
