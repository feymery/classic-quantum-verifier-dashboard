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

/** Protocol baseline α★ from Stricker et al. — sin²(α★) ≈ 0.024, reliably accepted. */
export const PROTOCOL_ALPHA = 0.1 * (Math.PI / 2);

// ── Backend options ──────────────────────────────────────────────────────────

export type BackendId = "aer" | "aer_qpu" | "ibm_runtime";

export interface Backend {
  id: BackendId;
  label: string;
  dotColor: string;
  requiresToken: boolean;
}

export const BACKENDS: Backend[] = [
  {
    id: "aer",
    label: "Aer Simulator",
    dotColor: "#34d399",
    requiresToken: false,
  },
  {
    id: "aer_qpu",
    label: "Aer + QPU Noise",
    dotColor: "#f59e0b",
    requiresToken: true,
  },
  {
    id: "ibm_runtime",
    label: "IBM Quantum",
    dotColor: "#9a91ad",
    requiresToken: true,
  },
];

// ── Backend name mapping (frontend → API) ────────────────────────────────────
// "aer" maps to the synchronous Aer executor.
// "ibm_runtime" maps to the async IBM Runtime executor.

export type ApiBackendId = "aer" | "aer_qpu" | "ibm";

/** Maps a frontend BackendId to the value expected by POST /run. */
export function mapBackendId(backend: BackendId): ApiBackendId {
  switch (backend) {
    case "aer":
      return "aer";
    case "aer_qpu":
      return "aer_qpu";
    case "ibm_runtime":
      return "ibm";
  }
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
