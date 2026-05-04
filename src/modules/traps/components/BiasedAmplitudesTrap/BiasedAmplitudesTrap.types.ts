/**
 * BiasedAmplitudesTrap.types.ts
 * Types and UI constants for Trap 3 — Biased Amplitudes.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EnergyBreakdown {
  H_out: number;
  H_in: number;
  H_prop: number;
  total: number;
}

export interface Trap3Params {
  alpha: number;
  delta: number;
  shots: number;
}

export interface Trap3ContentProps {
  alpha: number;
  delta: number;
  shots: number;
  isTrap: boolean;
  setDelta: (v: number) => void;
  setShots: (v: number) => void;
  energy: EnergyBreakdown;
  weights: [number, number, number];
  noisyWeights: [number, number, number];
  detected: boolean;
}

export type Mode = "honest" | "trap";

// ── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_ALPHA = Math.PI / 4;
export const DEFAULT_DELTA = 0.15;
export const DEFAULT_SHOTS = 512;

export const DELTA_MAX = 1 / 3;
export const SHOT_OPTIONS = [64, 128, 256, 512, 1024] as const;

export const HONEST_COLOR = "#34d399";
export const TRAP_COLOR = "#f87171";
export const BIAS_COLOR = "#f59e0b";

export const DETECTION_THRESHOLD = 0.4;

export const VERDICT_TEXT: Record<Mode, string> = {
  honest: "✓ HONEST — temporal coherence intact, E = 0",
  trap: "⚠ TRAP — biased amplitudes break H_prop coherence, energy rises with δ",
};
