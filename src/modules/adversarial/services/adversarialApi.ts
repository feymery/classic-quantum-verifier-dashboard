/**
 * adversarialApi.ts — client for POST /adversarial/circuit (Phase 3).
 *
 * Runs both the honest circuit (alpha) and the adversarial circuit
 * (alpha_fake) on the real Aer backend and returns per-bitstring
 * distribution data plus comparison metrics.
 */

import { fetchJson } from "../../../services/apiClient";

const API_BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ||
  "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CircuitRunData {
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  energy: number;
  energy_error: number;
  verdict: "accept" | "reject" | "marginal";
}

export interface AdversarialCircuitMetrics {
  tvd: number;
  kl_honest_to_fake: number;
  delta_energy: number;
}

export interface AdversarialCircuitResult {
  alpha: number;
  alpha_fake: number;
  shots: number;
  honest: CircuitRunData;
  adversarial: CircuitRunData;
  metrics: AdversarialCircuitMetrics;
}

// ── API call ──────────────────────────────────────────────────────────────────

export async function runAdversarialCircuit(
  alpha: number,
  alphaFake: number,
  shots = 1024,
): Promise<AdversarialCircuitResult> {
  return fetchJson<AdversarialCircuitResult>(
    `${API_BASE}/adversarial/circuit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alpha, alpha_fake: alphaFake, shots }),
    },
  );
}
