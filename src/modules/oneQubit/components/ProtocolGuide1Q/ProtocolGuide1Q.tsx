import {
  ProtocolSteps1Q,
  ConceptBox,
} from "../../../../components/ProtocolExplainer";
import { Card } from "../../../../ui/Card";
import { Text } from "../../../../ui/Text";

interface ProtocolGuide1QProps {
  alpha: number;
}

export function ProtocolGuide1Q({ alpha }: ProtocolGuide1QProps) {
  return (
    <Card className="rounded-lg" padded="md">
      <div className="flex items-center gap-2 mb-4">
        <Text as="h3" variant="subtitle">
          How the protocol works
        </Text>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] items-start">
        {/* Left: step-by-step + circuit */}
        <div className="space-y-2">
          <p className="mb-3 text-xs" style={{ color: "#9490a8" }}>
            Interactive step-by-step breakdown. Click any step to expand it.
            Values update live as you change α.
          </p>
          <ProtocolSteps1Q alpha={alpha} />
        </div>

        {/* Right: conceptual explanations */}
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
              The <em>clock state</em> is the 2-qubit entangled state built
              after the Hadamard + controlled-U(α):
            </p>
            <code
              className="block rounded px-2 py-1  text-[11px] mt-1"
              style={{ background: "#181620", color: "#b7a8cf" }}
            >
              |η(α)⟩ = (|0⟩|0⟩ + |1⟩U(α)|0⟩) / √2
            </code>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              The verifier (clock, q₀) is in superposition; the prover (work,
              q₁) is in a state controlled by α. This entanglement is what makes
              the protocol non-trivially quantum.
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
            <p>Linear inversion (Eq. C.1 in Stricker et al. 2024):</p>
            <code
              className="block rounded px-2 py-1  text-[11px] mt-1 leading-relaxed"
              style={{ background: "#181620", color: "#34d399" }}
            >
              E = 3.5 − 2⟨Z₂⟩ + ⟨Z₁⟩ − ⟨Z₁Z₂⟩
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;− 1.5·cos(α)·⟨X₁Z₂⟩
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;− 1.5·sin(α)·⟨X₁X₂⟩
            </code>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              The constant 3.5 is Tr(H·I/4), the energy of the fully mixed
              state. Under uniform depolarization the whole formula shifts to
              λ·3.5 + (1−λ)·sin²(α).
            </p>
          </ConceptBox>

          <ConceptBox title="Why E = sin²(α) exactly?" accentColor="#a78bfa">
            <p>
              With the clock state and U(α) = cos(α)·Z + sin(α)·X, the ideal
              expectation values evaluate to:
            </p>
            <code
              className="block rounded px-2 py-1  text-[11px] mt-1"
              style={{ background: "#181620", color: "#a78bfa" }}
            >
              ⟨Z₁Z₂⟩ = cos(α) · ⟨X₁X₂⟩ = sin(α) · ...
            </code>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              Substituting into the 5-term formula and simplifying, all cos/sin
              cross-terms cancel and E = sin²(α) emerges. For α = 0: E = 0
              (prover does nothing). For α = π/2: E = 1 (full rotation).
            </p>
          </ConceptBox>
        </div>
      </div>
    </Card>
  );
}
