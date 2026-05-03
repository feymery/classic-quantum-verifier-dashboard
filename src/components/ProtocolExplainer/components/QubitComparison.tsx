/**
 * QubitComparison.tsx
 * Side-by-side panel comparing 1-qubit vs 2-qubit protocols.
 * Shows circuits, observables, and key complexity differences together.
 */

import { Circuit1Q } from "./Circuit1Q";

interface QubitComparisonProps {
  alpha: number;
}

const OBS_1Q = [
  { name: "Z₁", desc: "Z_clock ⊗ I" },
  { name: "Z₂", desc: "I ⊗ Z_work" },
  { name: "Z₁Z₂", desc: "Z_clock ⊗ Z_work" },
  { name: "X₁X₂", desc: "X_clock ⊗ X_work" },
  { name: "X₁Z₂", desc: "X_clock ⊗ Z_work ★" },
];

const OBS_2Q = [
  { name: "Z₁", desc: "Z_clock ⊗ I ⊗ I" },
  { name: "Z₂", desc: "I ⊗ Z_w1 ⊗ I" },
  { name: "Z₃", desc: "I ⊗ I ⊗ Z_w2" },
  { name: "Z₁Z₂", desc: "Z_clock ⊗ Z_w1" },
  { name: "Z₁Z₃", desc: "Z_clock ⊗ Z_w2" },
  { name: "Z₂Z₃", desc: "Z_w1 ⊗ Z_w2" },
  { name: "X₁X₂", desc: "X_clock ⊗ X_w1" },
  { name: "X₁X₃", desc: "X_clock ⊗ X_w2" },
  { name: "X₂X₃", desc: "X_w1 ⊗ X_w2" },
];

const DIFF_ROWS = [
  { aspect: "Hilbert space", oneQ: "2² = 4", twoQ: "2³ = 8" },
  { aspect: "Work qubits", oneQ: "1", twoQ: "2" },
  { aspect: "Entanglement", oneQ: "none", twoQ: "CNOT (work register)" },
  { aspect: "Observable count", oneQ: "5", twoQ: "9+" },
  { aspect: "Hamiltonian terms", oneQ: "5", twoQ: "11" },
  { aspect: "Sampling effort", oneQ: "1×", twoQ: "≈ 1.8×" },
];

function ObsChip({
  name,
  desc,
  color,
}: {
  name: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      className="rounded px-2 py-1 flex items-baseline gap-1.5"
      style={{ background: "#181620" }}
    >
      <span className=" text-xs shrink-0" style={{ color }}>
        {name}
      </span>
      <span className=" text-[9px]" style={{ color: "#6b6780" }}>
        {desc}
      </span>
    </div>
  );
}

function SideHeader({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="rounded px-2 py-1  text-[10px] font-semibold uppercase tracking-wider mb-2"
      style={{ background: color + "22", color }}
    >
      {label}
    </div>
  );
}

export function QubitComparison({ alpha }: QubitComparisonProps) {
  return (
    <div className="space-y-4">
      {/* ── Circuit (1Q) ── */}
      <div>
        {/* 1Q panel */}
        <div
          className="rounded-lg border p-3 space-y-2"
          style={{ borderColor: "#a78bfa44", background: "#181620" }}
        >
          <SideHeader label="1-Qubit Protocol" color="#a78bfa" />
          <Circuit1Q alpha={alpha} />
          <p className=" text-[9px]" style={{ color: "#4a4760" }}>
            2 qubits · ctrl-U(α) · no work entanglement
          </p>
        </div>
      </div>

      {/* ── Observable comparison ── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div
          className="rounded-lg border p-3 space-y-1.5"
          style={{ borderColor: "#2d2b3a", background: "#1e1c26" }}
        >
          <p
            className=" text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "#a78bfa" }}
          >
            1Q observables (5)
          </p>
          {OBS_1Q.map((o) => (
            <ObsChip key={o.name} name={o.name} desc={o.desc} color="#a78bfa" />
          ))}
          <p className=" text-[9px] mt-1" style={{ color: "#4a4760" }}>
            ★ X₁Z₂ = cross-term for Hamiltonian inversion (Eq. C.1)
          </p>
        </div>

        <div
          className="rounded-lg border p-3 space-y-1.5"
          style={{ borderColor: "#2d2b3a", background: "#1e1c26" }}
        >
          <p
            className=" text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "#34d399" }}
          >
            2Q observables (9)
          </p>
          {OBS_2Q.map((o) => (
            <ObsChip key={o.name} name={o.name} desc={o.desc} color="#34d399" />
          ))}
        </div>
      </div>

      {/* ── Complexity diff table ── */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: "#2d2b3a" }}
      >
        <div
          className="grid px-3 py-2 text-[10px]  uppercase tracking-wider"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            background: "#181620",
            color: "#6b6780",
          }}
        >
          <span>Aspect</span>
          <span style={{ color: "#a78bfa" }}>1-Qubit</span>
          <span style={{ color: "#34d399" }}>2-Qubit</span>
        </div>
        {DIFF_ROWS.map((row, i) => (
          <div
            key={row.aspect}
            className="grid px-3 py-2 text-xs border-t"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              borderColor: "#2d2b3a",
              background: i % 2 === 0 ? "#1e1c26" : "#181620",
            }}
          >
            <span style={{ color: "#9490a8" }}>{row.aspect}</span>
            <span className="" style={{ color: "#a78bfa" }}>
              {row.oneQ}
            </span>
            <span className="" style={{ color: "#34d399" }}>
              {row.twoQ}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
