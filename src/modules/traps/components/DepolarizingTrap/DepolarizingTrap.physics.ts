/**
 * DepolarizingTrap.physics.ts
 * Pure math for Trap 2 — Depolarizing Noise.
 *
 * All functions are side-effect-free and framework-agnostic.
 */

import {
  THRESHOLD,
  PI_HALF,
  N_POINTS,
  LAMBDA_MAX,
} from "./DepolarizingTrap.constants";
import type { EnergyPoint, ContractionPoint } from "./DepolarizingTrap.types";

// ── Energy ────────────────────────────────────────────────────────────────────

/**
 * Exact Hamiltonian energy for the η-state under single-qubit depolarizing
 * noise with parameter λ.
 */
export function computeENoisy(alpha: number, lam: number): number {
  const Z1 = (1 - lam) * Math.cos(alpha) ** 2;
  const Z2 = 0;
  const Z1Z2 = (1 - lam) ** 2 * Math.sin(alpha) ** 2;
  const Z1X2 = (1 - lam) ** 2 * Math.cos(alpha);
  const X1X2 = (1 - lam) ** 2 * Math.sin(alpha);
  const H_out = 0.5 * (1 - Z1 - Z2 + Z1Z2);
  const H_in = 0.25 * (1 - Z1 + Z2 - Z1Z2);
  const H_prop = 0.5 * (1 - Math.cos(alpha) * Z1X2 - Math.sin(alpha) * X1X2);
  return H_out + 6 * H_in + 3 * H_prop;
}

/**
 * Exact critical λ at which E_noisy(α, λ) = THRESHOLD.
 *
 * Derivation: expanding E(λ) in terms of u = (1−λ) gives a quadratic
 *   u²·(sin²α + 3/2) + 2u·cos²α − (3.5 − THRESHOLD) = 0
 * Solved analytically; only the root in [0,1] is physically meaningful.
 */
export function lambdaCritExact(alpha: number): number {
  const c2 = Math.cos(alpha) ** 2;
  const s2 = Math.sin(alpha) ** 2;
  const a = s2 + 1.5;
  const b = 2 * c2;
  const c = THRESHOLD - 3.5; // negative
  const disc = b * b - 4 * a * c;
  const u = (-b + Math.sqrt(disc)) / (2 * a);
  return Math.max(0, Math.min(1, 1 - u));
}

// ── Chart data builders ───────────────────────────────────────────────────────

export function buildEnergyData(lam: number): EnergyPoint[] {
  return Array.from({ length: N_POINTS + 1 }, (_, i) => {
    const a = (i / N_POINTS) * PI_HALF;
    return {
      alpha: a,
      ideal: Math.sin(a) ** 2,
      noisy: computeENoisy(a, lam),
      ref: computeENoisy(a, 0.05),
    };
  });
}

/** Static dataset — never changes, built once at import time. */
export const CONTRACTION_DATA: ContractionPoint[] = Array.from(
  { length: 51 },
  (_, i) => {
    const lam = i / 100; // 0.00 → 0.50
    return { lambda: lam, contraction: (1 - lam) ** 2 };
  },
);

// ── Colour helpers ────────────────────────────────────────────────────────────

/**
 * Interpolates between the app's warning (#f59e0b) and danger (#f87171)
 * tokens as λ → LAMBDA_MAX so the UI communicates increasing noise risk.
 */
export function noisyColor(lam: number): string {
  const t = Math.min(1, lam / LAMBDA_MAX);
  const r = Math.round(245 + (248 - 245) * t);
  const g = Math.round(158 + (113 - 158) * t);
  const b = Math.round(11 + (113 - 11) * t);
  return `rgb(${r},${g},${b})`;
}
