import type { KeyAlpha } from "../types/alpha";

// ── Alpha special values ─────────────────────────────────────────────────────

/** Protocol baseline α★ from Stricker et al. — sin²(α★) ≈ 0.024, reliably accepted. */
export const PROTOCOL_ALPHA = 0.1 * (Math.PI / 2);

/**
 * Verifiable limit α_c — the largest α where an honest prover can still be
 * accepted. sin²(α_c) = 0.4 exactly, so α_c = arcsin(√0.4) ≈ 39.2°.
 * Above this point no amount of repetitions can certify a "yes" answer.
 */
export const ALPHA_THRESHOLD = Math.asin(Math.sqrt(0.4));

// ── Alpha presets ────────────────────────────────────────────────────────────
// Ordered ascending by value so slider ticks appear left → right correctly.

export const KEY_ALPHAS: KeyAlpha[] = [
  {
    value: 0,
    label: "α = 0",
    desc: "trivial baseline",
    insight:
      "U(0) = Z. The clock state |η⟩ is an exact eigenstate of the Hamiltonian — " +
      "perfect propagation coherence. E = sin²(0) = 0, the global minimum. " +
      'p₀ = cos²(0) = 1 > 3/5, so the protocol certifies "yes" with probability 1. ' +
      "All three Hamiltonian terms vanish exactly: H_out = H_in = H_prop = 0. " +
      "Ideal observables: ⟨Z₁X₂⟩ = 1, ⟨X₁X₂⟩ = 0, ⟨Z₁Z₂⟩ = 0. " +
      "Maximum noise tolerance: λ_crit = (0.4 − 0) × 2/3 ≈ 0.267. " +
      "Any depolarizing noise λ > 0 can only raise the energy from this baseline.",
    color: "#34d399",
  },
  {
    value: PROTOCOL_ALPHA,
    label: "α = α★",
    desc: "Stricker baseline",
    insight:
      "The experimental baseline of Stricker et al. 2024 (Quantum Sci. Technol. 9 02LT01). " +
      "E = sin²(α★) ≈ 0.024 — well inside the accept zone with a margin of Δ = 0.376 to threshold. " +
      'The paper certifies "yes" for α ≤ 0.12π/2 (dark grey region in Fig. 2b) with significance ' +
      "levels {0.012, 0.042, 0.015, 0.102, 0.039} over 2000 experimental shots. " +
      "With the best-fit depolarizing noise λ = 0.05, measured energy rises to ≈ 0.099 — " +
      "still well below 0.4. " +
      "Ideal observables: ⟨Z₁X₂⟩ = cos(α★) ≈ 0.988, ⟨X₁X₂⟩ = sin(α★) ≈ 0.156. " +
      "Noise tolerance: λ_crit ≈ 0.251 — the highest of any non-trivial α.",
    color: "#34d399",
  },
  {
    value: ALPHA_THRESHOLD,
    label: "α = α_c",
    desc: "verifiable limit",
    insight:
      "The exact upper boundary of the verifiable zone: sin²(α_c) = 0.4 exactly. " +
      "p₀ = cos²(α_c) = 0.6 = 3/5 — the protocol promise threshold (Appendix D.2). " +
      "A perfect honest prover sits right on the edge: any noise, however small (λ > 0), " +
      "pushes E above 0.4 and makes verification impossible. λ_crit = 0 — zero margin. " +
      "H_prop ≈ 0.267 is the dominant energy contribution at this point. " +
      "Ideal observables: ⟨Z₁X₂⟩ = cos(α_c) ≈ 0.775, ⟨X₁X₂⟩ = sin(α_c) ≈ 0.632. " +
      "This α is not suitable for experimental verification — it exists to mark the hard boundary.",
    color: "#f59e0b",
  },
  {
    value: Math.PI / 4,
    label: "α = π/4",
    desc: "reject boundary",
    insight:
      "E = sin²(π/4) = 0.5 — the lower bound of the unconditional reject zone (Eq. D.7). " +
      "p₀ = cos²(π/4) = 0.5: neither > 3/5 nor < 1/10, so α = π/4 lies outside the " +
      "protocol promise and is formally indeterminate. λ(H) > 1/2, meaning an honest perfect " +
      "prover is rejected. U(π/4) applies equal weight to Z and X, maximising the propagation " +
      "Hamiltonian contribution. " +
      "Ideal observables: ⟨Z₁X₂⟩ = cos(π/4) ≈ 0.707, ⟨X₁X₂⟩ = sin(π/4) ≈ 0.707. " +
      "Useful as a noise-ceiling reference: any additional noise only raises E further.",
    color: "#f87171",
  },
  {
    value: Math.PI / 2,
    label: "α = π/2",
    desc: "maximum energy",
    insight:
      "U(π/2) = X — pure X rotation. E = sin²(π/2) = 1.0, the global maximum. " +
      'p₀ = |⟨0|X|0⟩|² = 0 < 1/10: the protocol certifies "no" (Appendix D.3). ' +
      "The cosα · Z₁X₂ term in H_prop vanishes exactly at α = π/2 (Appendix G), " +
      "simplifying the Hamiltonian and reducing gate sensitivity to that observable. " +
      "The η-state at α = π/2 is a Bell state — Stricker et al. use it as the " +
      "fidelity reference: F = (⟨Z₁Z₂⟩ + ⟨X₁X₂⟩)/2 = 0.852(8) via 6 auxiliary qubits " +
      "(Fig. 2a), and F = 0.945(12) via direct η-state measurement (Fig. H.1). " +
      "Upper bound for noise model calibration.",
    color: "#f87171",
  },
];

export const KEY_ALPHA_VALUES = KEY_ALPHAS.map((k) => k.value);

// ── Backend options ──────────────────────────────────────────────────────────

export type BackendId = "aer" | "aer_qpu" | "ibm_runtime";

export interface Backend {
  id: BackendId;
  label: string;
  requiresToken: boolean;
}

export const BACKENDS: Backend[] = [
  {
    id: "aer",
    label: "Aer Simulator",
    requiresToken: false,
  },
  {
    id: "aer_qpu",
    label: "Aer + QPU Noise",
    requiresToken: true,
  },
  {
    id: "ibm_runtime",
    label: "IBM Quantum",
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
