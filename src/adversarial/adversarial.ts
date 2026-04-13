import { THRESHOLD_HIGH } from "../utils/constants";
import { energy } from "../utils/alphaUtils";

export type AdversarialStrategyType =
  | "bias-shift"
  | "threshold-attack"
  | "noise-adaptive-cheating";

export interface AdversarialInput {
  alpha: number;
  epsilon: number;
  noiseLambda: number;
  shots: number;
  enabled: boolean;
  strategyType: AdversarialStrategyType;
}

export interface AdversarialOutput {
  alpha: number;
  alpha_fake: number;
  E_honest: number;
  E_fake: number;
  deltaE: number;
  strategyType: AdversarialStrategyType;
}

const ALPHA_MIN = 0;
const ALPHA_MAX = Math.PI / 2;

function clampAlpha(value: number) {
  return Math.min(ALPHA_MAX, Math.max(ALPHA_MIN, value));
}

function directionForThreshold(eHonest: number) {
  return eHonest < THRESHOLD_HIGH ? 1 : -1;
}

function alphaForTargetEnergy(targetEnergy: number) {
  const target = Math.min(1, Math.max(0, targetEnergy));
  let low = ALPHA_MIN;
  let high = ALPHA_MAX;

  for (let i = 0; i < 30; i += 1) {
    const mid = (low + high) / 2;
    const eMid = energy(mid);
    if (eMid < target) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

function applyBiasShift(alpha: number, epsilon: number) {
  return clampAlpha(alpha + epsilon);
}

function applyThresholdAttack(alpha: number, epsilon: number) {
  const eHonest = energy(alpha);
  const targetEnergy = THRESHOLD_HIGH + 0.01;
  const alphaNearThreshold = alphaForTargetEnergy(targetEnergy);
  const move = epsilon * 2.5;

  if (Math.abs(eHonest - THRESHOLD_HIGH) < 0.08) {
    return clampAlpha(alphaNearThreshold);
  }

  const dir = directionForThreshold(eHonest);
  return clampAlpha(alpha + dir * move);
}

function applyNoiseAdaptiveCheating(
  alpha: number,
  epsilon: number,
  shots: number,
  noiseLambda: number,
) {
  const lowShotFactor = Math.min(1, Math.max(0, (1500 - shots) / 1500));
  const intensity = 0.35 + 1.65 * lowShotFactor + 0.8 * noiseLambda;
  const eHonest = energy(alpha);
  const dir = directionForThreshold(eHonest);
  return clampAlpha(alpha + dir * epsilon * intensity);
}

export function computeFakeAlpha(input: AdversarialInput) {
  const { alpha, epsilon, noiseLambda, shots, enabled, strategyType } = input;

  if (!enabled) return clampAlpha(alpha);

  switch (strategyType) {
    case "bias-shift":
      return applyBiasShift(alpha, epsilon);
    case "threshold-attack":
      return applyThresholdAttack(alpha, epsilon);
    case "noise-adaptive-cheating":
      return applyNoiseAdaptiveCheating(alpha, epsilon, shots, noiseLambda);
    default:
      return clampAlpha(alpha);
  }
}

export function runAdversarialModel(
  input: AdversarialInput,
): AdversarialOutput {
  const alpha_fake = computeFakeAlpha(input);
  const E_honest = energy(input.alpha);
  const E_fake = energy(alpha_fake);

  return {
    alpha: input.alpha,
    alpha_fake,
    E_honest,
    E_fake,
    deltaE: E_fake - E_honest,
    strategyType: input.strategyType,
  };
}
