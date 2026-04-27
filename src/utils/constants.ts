import type { KeyAlpha } from "../types/alpha";

// ── Alpha presets ────────────────────────────────────────────────────────────

export const KEY_ALPHAS: KeyAlpha[] = [
  {
    value: 0,
    label: "α = 0",
    desc: "trivial case",
    insight:
      "U(α) = Z. The clock state is already an eigenstate of the Hamiltonian. " +
      "Energy = 0 exactly — the verifier always rejects. Useful as a sanity check baseline.",
    color: "#9490a8",
  },
  {
    value: Math.PI / 4,
    label: "α = π/4",
    desc: "balanced regime",
    insight:
      "Equal weighting of Z and X terms in U(α). Energy = 0.5, sitting exactly on the " +
      "0.5 threshold boundary. The verifier is maximally uncertain — interesting for edge-case analysis.",
    color: "#a78bfa",
  },
  {
    value: 0.1 * (Math.PI / 2),
    label: "α = α★",
    desc: "protocol baseline",
    insight:
      "The protocol baseline from Stricker et al. sin²(α★) ≈ 0.024, well below the 0.4 " +
      "accept threshold. A correctly prepared state here is reliably accepted — the verifier " +
      "confirms an honest quantum prover. A fake prover must produce this energy to avoid detection.",
    color: "#a78bfa",
  },
  {
    value: Math.PI / 2,
    label: "α = π/2",
    desc: "maximum energy",
    insight:
      "U(α) = X. Pure X rotation. Maximum achievable energy = 1.0 — verifier always accepts. " +
      "Used as an upper bound reference and to test the noise model ceiling.",
    color: "#34d399",
  },
];

export const KEY_ALPHA_VALUES = KEY_ALPHAS.map((k) => k.value);

// ── Backend options ──────────────────────────────────────────────────────────

export type BackendId = "mock" | "aer" | "ibm_runtime";

export interface Backend {
  id: BackendId;
  label: string;
  dotColor: string;
  requiresToken: boolean;
}

export const BACKENDS: Backend[] = [
  {
    id: "mock",
    label: "Mock (dev)",
    dotColor: "#445566",
    requiresToken: false,
  },
  {
    id: "aer",
    label: "Aer Simulator",
    dotColor: "#34d399",
    requiresToken: false,
  },
  {
    id: "ibm_runtime",
    label: "IBM Quantum",
    dotColor: "#9a91ad",
    requiresToken: true,
  },
];

// ── Backend name mapping (frontend → API) ────────────────────────────────────
// "mock" is local-only and never reaches the FastAPI backend.
// "aer" maps to the synchronous Aer executor.
// "ibm_runtime" maps to the async IBM Runtime executor.

export type ApiBackendId = "aer" | "ibm";

/**
 * Maps a frontend BackendId to the value expected by POST /run.
 * Returns null for ids that should be handled locally (no HTTP call).
 */
export function mapBackendId(backend: BackendId): ApiBackendId | null {
  switch (backend) {
    case "aer":
      return "aer";
    case "ibm_runtime":
      return "ibm";
    case "mock":
      return null;
  }
}

/** Returns true if the backend should be executed locally without an API call. */
export function isLocalBackend(backend: BackendId): boolean {
  return mapBackendId(backend) === null;
}

// ── Thresholds ───────────────────────────────────────────────────────────────

export const THRESHOLD_LOW = 0.4;
export const THRESHOLD_HIGH = 0.5;

// ── Comparison palette (for multi-alpha plots) ───────────────────────────────

export const COMPARISON_COLORS = [
  "#a78bfa",
  "#d8b4fe",
  "#f59e0b",
  "#34d399",
] as const;
