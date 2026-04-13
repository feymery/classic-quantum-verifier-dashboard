export interface DetectionInput {
  deltaE: number;
  variance: number;
  shots: number;
  confidenceLevel: number;
}

export interface DetectionOutput {
  minShotsRequired: number;
  confidenceLevel: number;
  detectabilityScore: number;
  detectionProbability: number;
  isDetectable: boolean;
  riskLevel: "green" | "amber" | "red";
}

const EPS = 1e-8;
const POWER_Z = 0.84;

function normalCdfApprox(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return x > 0 ? 1 - p : p;
}

function zFromConfidence(confidenceLevel: number) {
  if (confidenceLevel >= 0.99) return 2.576;
  if (confidenceLevel >= 0.95) return 1.96;
  if (confidenceLevel >= 0.9) return 1.645;
  return 1.282;
}

export function minimumShotsToDetect(
  deltaE: number,
  variance: number,
  confidenceLevel: number,
) {
  const delta = Math.abs(deltaE);
  if (delta < EPS) return Number.POSITIVE_INFINITY;

  const safeVariance = Math.max(variance, EPS);
  const zAlpha = zFromConfidence(confidenceLevel);
  const zTotal = zAlpha + POWER_Z;

  return (zTotal * zTotal * safeVariance) / (delta * delta);
}

export function evaluateDetection(input: DetectionInput): DetectionOutput {
  const safeVariance = Math.max(input.variance, EPS);
  const minShotsRaw = minimumShotsToDetect(
    input.deltaE,
    safeVariance,
    input.confidenceLevel,
  );
  const minShotsRequired = Number.isFinite(minShotsRaw)
    ? Math.max(1, Math.ceil(minShotsRaw))
    : Number.POSITIVE_INFINITY;

  const signalToNoise =
    Math.abs(input.deltaE) * Math.sqrt(Math.max(input.shots, 1) / safeVariance);
  const zAlpha = zFromConfidence(input.confidenceLevel);
  const detectionProbability = Math.max(
    0,
    Math.min(1, 2 * normalCdfApprox(signalToNoise) - 1),
  );

  const detectabilityScore = Math.max(
    0,
    Math.min(1, signalToNoise / (zAlpha + POWER_Z)),
  );

  const isDetectable =
    input.shots >= minShotsRequired && detectionProbability >= 0.7;

  const riskLevel = isDetectable
    ? "red"
    : detectionProbability >= 0.45
      ? "amber"
      : "green";

  return {
    minShotsRequired,
    confidenceLevel: input.confidenceLevel,
    detectabilityScore,
    detectionProbability,
    isDetectable,
    riskLevel,
  };
}
