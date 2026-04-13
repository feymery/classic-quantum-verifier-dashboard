import { theoreticalEnergy } from "../physics/energy";

/** E(α) = sin²(α) — delegates to physics/energy canonical definition */
export function energyFromAlpha(alpha: number): number {
  return theoreticalEnergy(alpha);
}

export function formatEnergy(value: number): string {
  return value.toFixed(4);
}

export function formatAlpha(alpha: number): string {
  return alpha.toFixed(4);
}

export function applyDepolarizingNoise(energy: number, lambda: number): number {
  return Math.max(0, energy * (1 - lambda));
}

export function buildExpectationRecord(alpha: number) {
  const baseEnergy = energyFromAlpha(alpha);
  return {
    "⟨Z₁Z₂⟩": 0,
    "⟨X₁X₂⟩": 0,
    "⟨Z₁⟩": 0,
    "⟨Z₂⟩": 0,
    energyEstimate: baseEnergy,
  };
}
