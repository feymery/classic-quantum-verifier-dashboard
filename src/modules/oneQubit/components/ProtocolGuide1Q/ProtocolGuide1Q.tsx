import {
  ProtocolSteps1Q,
  ConceptBox,
} from "../../../../components/ProtocolExplainer";
import { QMAVerifierDiagram } from "../../../../components/CircuitDiagram/QMAVerifierDiagram";
import { Circuit1Q } from "../../../../components/quantum/Circuit1Q";
import { Card } from "../../../../ui/Card";
import { Text } from "../../../../ui/Text";

interface ProtocolGuide1QProps {
  alpha: number;
}

export function ProtocolGuide1Q({ alpha }: ProtocolGuide1QProps) {
  return (
    <Card className="rounded-lg" padded="md">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: "var(--color-elevated)",
            color: "var(--color-muted)",
          }}
        >
          Protocol
        </span>
        <Text as="h3" variant="subtitle">
          How the protocol works
        </Text>
      </div>
      <p className="mb-5 text-xs" style={{ color: "#9490a8" }}>
        The classical verifier interacts with a quantum prover through an
        entangled clock state, measures Pauli observables across three
        incompatible bases, and accepts only if the reconstructed energy
        E&nbsp;=&nbsp;⟨H⟩ falls below the classical threshold — certifying
        genuine quantum behaviour without ever touching the prover's qubit.
      </p>

      {/* ── Diagrams side by side ── */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6 items-start">
        {/* Left: 1Q Stricker circuit */}
        <div
          className="p-3 border rounded-xl"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <p
            className="mb-2 text-[10px] uppercase tracking-widest"
            style={{ color: "#6b6780" }}
          >
            1-qubit Stricker circuit
          </p>
          <Circuit1Q alpha={alpha} />
          <p className="mt-1 text-[9px]" style={{ color: "#4a4760" }}>
            q₀&nbsp;=&nbsp;clock (MSB) · q₁&nbsp;=&nbsp;work (LSB) ·
            little-endian convention
          </p>
        </div>

        {/* Right: two-prover QMA diagram */}
        <div
          className="p-3 border rounded-xl"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <p
            className="mb-2 text-[10px] uppercase tracking-widest"
            style={{ color: "#6b6780" }}
          >
            two-prover QMA verification
          </p>
          <QMAVerifierDiagram />
          <p className="mt-1 text-[9px]" style={{ color: "#4a4760" }}>
            Alice &amp; Bob share EPR pairs · classical questions from Verifier
            · no qubit access
          </p>
        </div>
      </div>

      {/* ── Explanation grid ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] items-start">
        {/* Left: step-by-step accordion */}
        <div className="space-y-2">
          <p className="mb-3 text-xs" style={{ color: "#9490a8" }}>
            Interactive step-by-step breakdown. Click any step to expand it.
            Values update live as you change α.
          </p>
          <ProtocolSteps1Q alpha={alpha} showCircuit={false} />
        </div>

        {/* Right: conceptual explanations (merged from both sections) */}
        <div className="space-y-2">
          <p className="mb-3 text-xs" style={{ color: "#9490a8" }}>
            Conceptual background. Expand any section for a concise explanation.
          </p>

          <ConceptBox
            title="What is the clock state |η(α)⟩?"
            accentColor="#b7a8cf"
            defaultOpen
          >
            <p>
              The <em>clock state</em> encodes the progression of the prover's
              computation into the joint state of two qubits: q₀ (clock /
              verifier) and q₁ (work / prover).
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              The verifier holds q₀ and keeps it in superposition throughout.
              The prover holds q₁ and applies U(α) only when q₀ = |1⟩. This
              conditional action is the controlled-U(α) gate that creates
              entanglement — the verifier can later measure the joint state and
              statistically certify that U(α) was applied correctly, without
              ever seeing the prover's qubit directly.
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              A classical prover cannot mimic this entangled structure:
              separating the two qubits into independent states always produces
              a higher energy, which the verifier detects through the E &gt; 0.5
              rejection test.
            </p>
          </ConceptBox>

          <ConceptBox
            title="Why measure Pauli observables?"
            accentColor="#e8a020"
          >
            <p>
              The Hamiltonian H is a weighted sum of Pauli operators. Measuring
              expectation values ⟨Oᵢ⟩ lets us reconstruct ⟨H⟩ = E without ever
              accessing the full statevector.
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              Each Pauli has eigenvalues ±1, making it easy to estimate from
              binary shot outcomes: ⟨O⟩ ≈ (n₊ − n₋) / shots.
            </p>
          </ConceptBox>

          <ConceptBox
            title="How do expectation values → energy?"
            accentColor="#34d399"
          >
            <p>
              The Hamiltonian H is a sum of Pauli operators with known
              coefficients. Because each Pauli is linear, its expectation value
              in the clock state can be estimated independently from measurement
              shots, and the individual estimates are then combined to recover
              ⟨H⟩ = E — a process called <em>Hamiltonian inversion</em>.
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              The five terms and their shot-noise variances propagate
              independently into the final energy error σ_E. The dominant
              contributions come from the α-dependent cross-terms X₁Z₂ and X₁X₂,
              whose coefficients scale as 1.5·cos(α) and 1.5·sin(α)
              respectively.
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              Under uniform depolarizing noise (strength λ), every observable
              shrinks: ⟨O⟩_noisy = (1−λ)⟨O⟩. The energy shifts to λ·3.5 +
              (1−λ)·sin²(α) — the accept zone shrinks proportionally.
            </p>
          </ConceptBox>

          <ConceptBox title="Why E = sin²(α) exactly?" accentColor="#a78bfa">
            <p>
              With the clock state and U(α) = cos(α)·Z + sin(α)·X, the ideal
              expectation values evaluate analytically to:
            </p>
            <code
              className="block rounded px-2 py-1  text-[11px] mt-1 leading-relaxed"
              style={{ background: "#181620", color: "#a78bfa" }}
            >
              ⟨Z₁⟩ = 0 &nbsp;&nbsp;&nbsp;&nbsp;⟨Z₂⟩ = cos²(α)
              <br />
              ⟨Z₁Z₂⟩ = sin²(α)
              <br />
              ⟨X₁Z₂⟩ = cos(α) &nbsp;⟨X₁X₂⟩ = sin(α)
            </code>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              Substituting into the 5-term formula: the 3.5 constant is
              cancelled by 2·cos²(α) + sin²(α) + 1.5·cos²(α) + 1.5·sin²(α) = 2 +
              1 + 1.5 = 4.5 − 1 = 3.5. The remainder is cos²(α) + sin²(α) −
              cos²(α) − ... which simplifies to sin²(α). For α = 0: E = 0. For α
              = π/2: E = 1.
            </p>
          </ConceptBox>

          <ConceptBox
            title="Verifier decision: accept / reject"
            accentColor="#f87171"
          >
            <p>
              The verifier does not compare E to a single threshold — it uses
              the estimated energy <em>with</em> its propagated shot-noise error
              σ_E (Stricker et al. Eq. D.7):
            </p>
            <div
              className="rounded px-2 py-1 mt-1 space-y-0.5 text-[11px]"
              style={{ background: "#181620" }}
            >
              <div>
                <span style={{ color: "#34d399" }}>accept</span>
                <span style={{ color: "#9490a8" }}> — E + σ_E &lt; 0.4</span>
              </div>
              <div>
                <span style={{ color: "#f87171" }}>reject</span>
                <span style={{ color: "#9490a8" }}> — E − σ_E ≥ 0.5</span>
              </div>
              <div>
                <span style={{ color: "#f59e0b" }}>marginal</span>
                <span style={{ color: "#9490a8" }}> — otherwise</span>
              </div>
            </div>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              The gap [0.4, 0.5) is the <em>boundary zone</em>: more shots
              reduce σ_E and shrink this zone. An honest quantum prover at α ≤
              α_c (≈ 39.2°) always lands in the accept zone in the noiseless
              limit; a classical prover cannot reach E &lt; 0.5 for any α in the
              verifiable range.
            </p>
          </ConceptBox>

          <ConceptBox
            title="Why 3 circuits? — incompatible bases force quantum commitment"
            accentColor="#e8a020"
          >
            <p>
              The five terms in E(α) require three incompatible measurement
              bases. The Verifier sends the basis choice <em>after</em> the
              Prover prepares the state, so the Prover must hold a genuine
              quantum state in memory — no classical strategy can satisfy all
              three bases simultaneously.
            </p>
            <ul
              className="mt-2 space-y-1 text-[10px]"
              style={{ color: "#6b6780" }}
            >
              <li>
                <strong style={{ color: "#d8b4fe" }}>"z"</strong> — Z on both →
                extracts ⟨Z₁⟩, ⟨Z₂⟩, ⟨Z₁Z₂⟩ (three terms from one circuit).
              </li>
              <li>
                <strong style={{ color: "#34d399" }}>"zx"</strong> — H on
                q_clock → needed for the cos(α) cross-term ⟨Z₁X₂⟩.
              </li>
              <li>
                <strong style={{ color: "#e8a020" }}>"x12"</strong> — H on both
                → needed for the sin(α) cross-term ⟨X₁X₂⟩.
              </li>
            </ul>
          </ConceptBox>
        </div>
      </div>

      {/* ── Footnote ── */}
      <p
        className="mt-6 text-[10px] leading-relaxed rounded-lg px-3 py-2 border"
        style={{
          color: "#9490a8",
          borderColor: "#2d2b3a",
          background: "#181620",
        }}
      >
        <strong style={{ color: "#ddd9ee" }}>
          Classical Quantum Verifier for QMA:
        </strong>{" "}
        A classical polynomial-time Verifier uses two entangled,
        non-communicating quantum provers to verify quantum proofs (Quantum
        Merlin–Arthur). The construction relates to <strong>MIP* = RE</strong>{" "}
        (Ji, Natarajan, Vidick, Wright &amp; Yuen, 2020) and enables
        verification of QMA-complete Local Hamiltonian problems — where the gap
        β − α ≥ 1/poly(n) separates YES from NO instances — with only classical
        interaction.
      </p>
    </Card>
  );
}
