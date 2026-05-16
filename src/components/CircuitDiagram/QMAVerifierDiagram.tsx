/**
 * QMAVerifierDiagram.tsx
 */

import { ConceptBox } from "../ProtocolExplainer/ConceptBox";

const C = {
  canvas: "#131217",
  surface: "#181620",
  elevated: "#1e1c26",
  border: "#2d2b3a",
  fg: "#ddd9ee",
  muted: "#9490a8",
  subtle: "#6b6780",
  accent: "#a78bfa",
  accentDim: "#d8b4fe",
  success: "#34d399",
  gold: "#e8a020",
  danger: "#f87171",
};

/* ------------------------------------------------------------------ */
/* Main export                                                          */
/* ------------------------------------------------------------------ */
export function QMAVerifierDiagram() {
  return (
    <img
      src="/protocol_diagram.png"
      alt="Classical verification protocol: Alice sends α to Bob, Bob runs 3 measurement circuits, returns bitstring outcomes, Alice computes E(α) and accepts if E < 0.4"
      className="w-full rounded-xl"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Conceptual explanations                                              */
/* ------------------------------------------------------------------ */
export function QMAProtocolConcepts() {
  return (
    <div className="space-y-2">
      <ConceptBox
        title="Clock state |η(α)⟩ — what Prover B prepares"
        accentColor={C.accent}
        defaultOpen
      >
        <p>
          All three circuits start from{" "}
          <code style={{ color: C.accent }}>|0⟩|0⟩</code> and apply H + CRY(2α)
          to produce the two-qubit entangled clock state:
        </p>
        <code
          className="block px-2 py-1 mt-1 text-[11px] rounded leading-relaxed"
          style={{ background: C.canvas, color: C.accent }}
        >
          |η(α)⟩ = (|00⟩ + cosα·|10⟩ + sinα·|11⟩) / √2
        </code>
        <p className="mt-1 text-[10px]" style={{ color: C.subtle }}>
          q_prover = subscript 1 (target of CRY). q_clock = subscript 2 (control
          of CRY, H first). This entanglement cannot be replicated by a
          classical prover.
        </p>
      </ConceptBox>

      <ConceptBox
        title="Energy formula E(α) — energy.py, Stricker et al. Eq. C.1"
        accentColor={C.success}
      >
        <p>Linear reconstruction of ⟨H⟩ from the five measured observables:</p>
        <code
          className="block px-2 py-1 mt-1 text-[11px] rounded leading-relaxed whitespace-pre"
          style={{ background: C.canvas, color: C.success }}
        >{`E = 3.5 − 2·⟨Z₁⟩ + ⟨Z₂⟩ − ⟨Z₁Z₂⟩
    − 1.5·cos(α)·⟨Z₁X₂⟩
    − 1.5·sin(α)·⟨X₁X₂⟩`}</code>
        <p className="mt-1 text-[10px]" style={{ color: C.subtle }}>
          Ground truth: E(α) = sin²(α). Accept if E &lt; 0.4. Reject if E ≥ 0.5.
          With depolarizing noise λ: ⟨O⟩_noisy = (1−λ)·⟨O⟩.
        </p>
      </ConceptBox>

      <ConceptBox
        title="Why 3 circuits? — incompatible bases force quantum commitment"
        accentColor={C.gold}
      >
        <p>
          The five terms in E(α) require three incompatible measurement bases.
          The Verifier sends the basis choice <em>after</em> the Prover prepares
          the state, so the Prover must hold a genuine quantum state in memory —
          no classical strategy can satisfy all three bases simultaneously.
        </p>
        <ul className="mt-2 space-y-1 text-[10px]" style={{ color: C.subtle }}>
          <li>
            <strong style={{ color: C.accentDim }}>"z"</strong> — Z on both →
            extracts ⟨Z₁⟩, ⟨Z₂⟩, ⟨Z₁Z₂⟩ (three terms from one circuit).
          </li>
          <li>
            <strong style={{ color: C.success }}>"zx"</strong> — H on q_clock →
            needed for the cosα cross-term ⟨Z₁X₂⟩.
          </li>
          <li>
            <strong style={{ color: C.gold }}>"x12"</strong> — H on both →
            needed for the sinα cross-term ⟨X₁X₂⟩.
          </li>
        </ul>
      </ConceptBox>
    </div>
  );
}
