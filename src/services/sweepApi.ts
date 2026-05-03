/**
 * sweepApi.ts — client for POST /sweep/alpha and POST /sweep/shots.
 */

import { fetchJson } from "./apiClient";
import type { Verdict } from "../types/dashboard";

const API_BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() || "/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlphaSweepObservables {
  Z1: number;
  Z2: number;
  Z1Z2: number;
  Z1X2: number;
  X1Z2: number;
  X1X2: number;
}

export interface AlphaSweepPoint {
  alpha: number;
  energy_est: number;
  energy_error: number;
  energy_theory: number;
  lambda_min: number;
  verdict: Verdict;
  /** Measured expectation values for all 6 operators (Figure 2a) */
  observables?: AlphaSweepObservables;
  /** Theoretical expectation values ⟨O⟩ for the honest clock state (Figure 2a) */
  observables_theory?: AlphaSweepObservables;
}

export interface AlphaSweepResult {
  points: AlphaSweepPoint[];
  shots: number;
  n_points: number;
}

export interface ShotsSweepPoint {
  shots: number;
  energy_est: number;
  energy_error: number;
  energy_theory: number;
  verdict: Verdict;
}

export interface ShotsSweepResult {
  points: ShotsSweepPoint[];
  alpha: number;
}

// ── Noise sweep (Phase 3 — real Aer + NoiseModel) ─────────────────────────────

export interface NoiseSweepBackendPoint {
  noise_p: number;
  energy_est: number;
  energy_error: number;
  energy_theory: number;
  lambda_min: number;
  verdict: Verdict;
}

export interface NoiseSweepBackendResult {
  points: NoiseSweepBackendPoint[];
  alpha: number;
  shots: number;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function runAlphaSweep(
  shots = 1024,
  nPoints = 30,
): Promise<AlphaSweepResult> {
  return fetchJson<AlphaSweepResult>(`${API_BASE}/sweep/alpha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shots, n_points: nPoints, backend: "aer" }),
  });
}

export async function runShotsSweep(
  alpha: number,
  shotsList?: number[],
): Promise<ShotsSweepResult> {
  const body: Record<string, unknown> = { alpha, backend: "aer" };
  if (shotsList) body.shots_list = shotsList;
  return fetchJson<ShotsSweepResult>(`${API_BASE}/sweep/shots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function runNoiseSweep(
  alpha: number,
  shots = 1024,
  lambdaList?: number[],
): Promise<NoiseSweepBackendResult> {
  const body: Record<string, unknown> = { alpha, shots };
  if (lambdaList) body.lambda_list = lambdaList;
  return fetchJson<NoiseSweepBackendResult>(`${API_BASE}/sweep/noise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
