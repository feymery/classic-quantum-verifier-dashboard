/**
 * DepolarizingTrap.types.ts
 * Shared TypeScript interfaces for Trap 2 — Depolarizing Noise.
 */

// ── Domain models ─────────────────────────────────────────────────────────────

export interface EnergyPoint {
  alpha: number;
  ideal: number;
  noisy: number;
  ref: number;
}

export interface ContractionPoint {
  lambda: number;
  contraction: number;
}

/** Live-computed observables at current (alpha, lambda). */
export interface Observables {
  Z1X2_noisy: number;
  X1X2_noisy: number;
  Z1Z2_noisy: number;
  E_noisy: number;
  E_ideal: number;
}

// ── Component props ───────────────────────────────────────────────────────────

export interface DepolarizingTrapProps {
  alpha?: number;
  lambda?: number;
}

/** Props shared down to every sub-component. */
export interface ContentProps {
  alpha: number;
  lam: number;
  setLam: (v: number) => void;
  lineColor: string;
  obs: Observables;
  lcrit: number;
  aboveCrit: boolean;
  energyData: EnergyPoint[];
}
