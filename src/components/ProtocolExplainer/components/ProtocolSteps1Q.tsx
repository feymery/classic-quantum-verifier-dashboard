/**
 * ProtocolSteps1Q.tsx
 * Accordion step-by-step breakdown of the 1-qubit Stricker protocol.
 */

import { useState } from "react";
import { Circuit1Q } from "./Circuit1Q";

interface Step {
  id: string;
  label: string;
  title: string;
  color: string;
  body: (alpha: number) => React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: "s1",
    label: "step 1",
    title: "Initial state",
    color: "#b7a8cf",
    body: () => (
      <div className="space-y-1">
        <p>Both qubits are prepared in the ground state:</p>
        <code
          className="block px-2 py-1 text-xs rounded"
          style={{ background: "#181620", color: "#a78bfa" }}
        >
          |ψ₀⟩ = |0⟩<sub style={{ fontSize: 10 }}>clock</sub> ⊗ |0⟩
          <sub style={{ fontSize: 10 }}>work</sub>
        </code>
        <p className="text-xs" style={{ color: "#9490a8" }}>
          q₀ is the <em>clock</em> qubit; q₁ is the <em>work</em> qubit.
        </p>
      </div>
    ),
  },
  {
    id: "s2",
    label: "step 2",
    title: "Hadamard on clock",
    color: "#b7a8cf",
    body: () => (
      <div className="space-y-1">
        <p>The Hadamard gate puts the clock qubit into superposition:</p>
        <code
          className="block px-2 py-1 text-xs rounded"
          style={{ background: "#181620", color: "#b7a8cf" }}
        >
          H|0⟩ = (|0⟩ + |1⟩) / √2
        </code>
        <p className="text-xs" style={{ color: "#9490a8" }}>
          This superposition is what enables the protocol to verify the
          prover&apos;s quantum capability.
        </p>
      </div>
    ),
  },
  {
    id: "s3",
    label: "step 3",
    title: "Build clock state |η(α)⟩",
    color: "#a78bfa",
    body: (alpha) => (
      <div className="space-y-1">
        <p>
          A <em>controlled-U(α)</em> entangles the work qubit conditionally:
        </p>
        <code
          className="block px-2 py-1 text-xs rounded"
          style={{ background: "#181620", color: "#a78bfa" }}
        >
          |η(α)⟩ = (|0⟩|0⟩ + |1⟩U(α)|0⟩) / √2
        </code>
        <code
          className="block px-2 py-1 mt-1 text-xs rounded"
          style={{ background: "#181620", color: "#a78bfa" }}
        >
          = (|0⟩|0⟩ + cos(α)|1⟩|0⟩ + sin(α)|1⟩|1⟩) / √2
        </code>
        <p className="text-xs" style={{ color: "#9490a8" }}>
          At α = {alpha.toFixed(3)} rad → cos(α) ≈ {Math.cos(alpha).toFixed(4)},
          sin(α) ≈ {Math.sin(alpha).toFixed(4)}
        </p>
      </div>
    ),
  },
  {
    id: "s4",
    label: "step 4",
    title: "Measure Pauli observables",
    color: "#e8a020",
    body: () => (
      <div className="space-y-2">
        <p>Five observables are measured in repeated shots:</p>
        <div className="grid grid-cols-2 gap-1">
          {[
            ["Z₁", "Z_clock ⊗ I"],
            ["Z₂", "I ⊗ Z_work"],
            ["Z₁Z₂", "Z_clock ⊗ Z_work"],
            ["X₁X₂", "X_clock ⊗ X_work"],
            ["X₁Z₂", "X_clock ⊗ Z_work  ★"],
          ].map(([name, desc]) => (
            <div
              key={name}
              className="px-2 py-1 rounded"
              style={{ background: "#181620" }}
            >
              <span className="text-xs " style={{ color: "#e8a020" }}>
                {name}
              </span>
              <span className="ml-2  text-[10px]" style={{ color: "#6b6780" }}>
                {desc}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px]" style={{ color: "#6b6780" }}>
          ★ X₁Z₂ = X_clock ⊗ Z_work corresponds to basis choice (k₁,k₂)=(1,0) in
          Stricker et al. Eq. C.1 — the cross-term that was missing in earlier
          versions.
        </p>
      </div>
    ),
  },
  {
    id: "s5",
    label: "step 5",
    title: "Compute energy E",
    color: "#34d399",
    body: (alpha) => (
      <div className="space-y-2">
        <p>Linear inversion of the Hamiltonian (Stricker et al. Eq. C.1):</p>
        <code
          className="block rounded px-2 py-1  text-[11px] leading-relaxed"
          style={{ background: "#181620", color: "#34d399" }}
        >
          E = 3.5 − 2⟨Z₂⟩ + ⟨Z₁⟩ − ⟨Z₁Z₂⟩
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;− 1.5·cos(α)·⟨X₁Z₂⟩
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;− 1.5·sin(α)·⟨X₁X₂⟩
        </code>
        <p className="text-xs" style={{ color: "#9490a8" }}>
          Theoretical ground truth: E(α) = sin²(α) ≈{" "}
          <span style={{ color: "#34d399" }}>
            {Math.pow(Math.sin(alpha), 2).toFixed(4)}
          </span>{" "}
          at the current α.
        </p>
        <p className="text-[10px]" style={{ color: "#6b6780" }}>
          The constant 3.5 = Tr(H·I/4) is the energy of the maximally-mixed
          state. Each ⟨Oᵢ⟩ is attenuated by depolarizing noise: ⟨O⟩_noisy =
          (1−λ)⟨O⟩.
        </p>
      </div>
    ),
  },
];

interface ProtocolSteps1QProps {
  alpha: number;
}

export function ProtocolSteps1Q({ alpha }: ProtocolSteps1QProps) {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-2">
      {/* ── Circuit ── */}
      <div
        className="p-3 border rounded-lg"
        style={{ borderColor: "#2d2b3a", background: "#181620" }}
      >
        <p
          className="mb-2  text-[10px] uppercase tracking-widest"
          style={{ color: "#6b6780" }}
        >
          circuit
        </p>
        <Circuit1Q alpha={alpha} />
        <p className="mt-1  text-[9px]" style={{ color: "#4a4760" }}>
          q₀ = clock (MSB) · q₁ = work (LSB) · little-endian convention
        </p>
      </div>

      {/* ── Steps ── */}
      {STEPS.map((step) => {
        const isOpen = open === step.id;
        return (
          <div
            key={step.id}
            className="overflow-hidden border rounded-lg"
            style={{
              borderColor: isOpen ? step.color : "#2d2b3a",
              background: "#1e1c26",
              transition: "border-color 0.15s",
            }}
          >
            <button
              onClick={() => toggle(step.id)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              aria-expanded={isOpen}
            >
              <span
                className="shrink-0 rounded  text-[9px] px-1.5 py-0.5 uppercase tracking-wider"
                style={{
                  background: isOpen ? step.color : "#2d2b3a",
                  color: isOpen ? "#0f0e14" : "#6b6780",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {step.label}
              </span>
              <span
                className="flex-1 text-sm font-medium"
                style={{ color: isOpen ? step.color : "#ddd9ee" }}
              >
                {step.title}
              </span>
              <span
                className="text-lg leading-none "
                style={{ color: "#4a4760" }}
                aria-hidden
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div
                className="px-3 pt-2 pb-3 text-xs leading-relaxed border-t"
                style={{ borderColor: "#2d2b3a", color: "#ddd9ee" }}
              >
                {step.body(alpha)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
