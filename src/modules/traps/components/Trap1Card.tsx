/**
 * Trap1Card.tsx — Interactive demo for Trap 1: Classical State |00⟩
 *
 * A dishonest prover skips the quantum circuit entirely and sends |00⟩.
 * The verifier measures E_H = 1.00 — far above the 0.5 threshold → REJECTED.
 *
 * Toggle between "honest" and "trap1" modes to compare outcomes.
 */

import { useMemo, useState } from "react";
import { buildTrapState } from "../physics/traps";
import { TrapCard } from "./TrapCard";
import { ProbBars } from "./ProbBars";
import { EnergyGauge } from "./EnergyGauge";
import { TrapCircuitDiagram2Q } from "./TrapCircuitDiagram";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_SHOTS = 1024;
const DEFAULT_ALPHA = Math.PI / 4;

const HONEST_COLOR = "#34d399";
const TRAP_COLOR = "#f87171";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2  text-[10px] uppercase tracking-widest"
      style={{ color: "#6b6780" }}
    >
      {children}
    </p>
  );
}

function ConceptBox({ mode }: { mode: "honest" | "trap1" }) {
  if (mode === "honest") {
    return (
      <div
        className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
        style={{
          borderColor: "#1e3a2a",
          background: "#0f1f16",
          color: "#86efac",
        }}
      >
        <span className="mr-2 font-semibold">✓ HONEST PROVER</span>
        El probador aplica U(α) correctamente. El estado del reloj cuántico
        lleva coherencia temporal, lo que se manifiesta como correlaciones XY en
        el Hamiltoniano. La energía medida cae por debajo del umbral de
        aceptación.
      </div>
    );
  }
  return (
    <div
      className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
      style={{
        borderColor: "#3a1e1e",
        background: "#1f0f0f",
        color: "#fca5a5",
      }}
    >
      <span className="mr-2 font-semibold">✗ TRAMPA DETECTADA</span>
      El probador omitió <span className="">H(q_clock)</span>,{" "}
      <span className="">RY(α/2)</span> y <span className="">CZ</span>. El
      estado clásico <span className="">|00⟩</span> no tiene superposición
      temporal. Las correlaciones X₁X₂ y Z₁X₂ son exactamente 0, empujando la
      energía a E = 1.00 — muy por encima del umbral de rechazo de 0.50.
    </div>
  );
}

function ExpectationsTable({ exp }: { exp: Record<string, number> }) {
  const rows: [string, string][] = [
    ["⟨Z₁⟩", "Z1"],
    ["⟨Z₂⟩", "Z2"],
    ["⟨Z₁Z₂⟩", "Z1Z2"],
    ["⟨X₁X₂⟩", "X1X2"],
    ["⟨Z₁X₂⟩", "Z1X2"],
  ];
  return (
    <table
      className="w-full text-right  text-[11px]"
      style={{ borderCollapse: "collapse" }}
    >
      <tbody>
        {rows.map(([label, key]) => {
          const val = exp[key] ?? 0;
          const isNonZero = Math.abs(val) > 0.001;
          return (
            <tr key={key}>
              <td
                className="py-0.5 pr-3 text-left"
                style={{ color: "#9490a8" }}
              >
                {label}
              </td>
              <td
                className="py-0.5"
                style={{ color: isNonZero ? "#ddd9ee" : "#4b4860" }}
              >
                {val.toFixed(4)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Trap1Card() {
  const [mode, setMode] = useState<"honest" | "trap1">("honest");
  const [alpha, setAlpha] = useState(DEFAULT_ALPHA);
  const [showDiff, setShowDiff] = useState(true);

  const state = useMemo(
    () => buildTrapState(mode, alpha, DEFAULT_SHOTS),
    [mode, alpha],
  );

  const isTrap = mode === "trap1";
  const accentColor = isTrap ? TRAP_COLOR : HONEST_COLOR;
  const degs = ((alpha / Math.PI) * 180).toFixed(1);

  const toggleButton = (
    <button
      onClick={() => setMode(isTrap ? "honest" : "trap1")}
      className="shrink-0 rounded-lg px-4 py-2  text-[11px] font-bold uppercase tracking-wide transition-all duration-300"
      style={
        isTrap
          ? {
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.4)",
              color: TRAP_COLOR,
            }
          : {
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              color: HONEST_COLOR,
            }
      }
    >
      {isTrap ? "← estado honesto" : "activar trampa →"}
    </button>
  );

  return (
    <TrapCard
      id="Trampa 1"
      title="Estado Clásico |00⟩"
      description="El probador deshonesto evita toda la computación cuántica y envía el estado clásico |00⟩."
      borderColor={isTrap ? "#3a1e1e" : "#1a2a3a"}
      actions={toggleButton}
    >
      {/* ── Alpha slider (only relevant for honest) ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <SectionLabel>parámetro α</SectionLabel>
          <span className=" text-[11px]" style={{ color: accentColor }}>
            {degs}° ({alpha.toFixed(3)} rad)
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={(Math.PI / 2).toString()}
          step={0.01}
          value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value))}
          className="w-full accent-violet-400"
          style={{ opacity: isTrap ? 0.4 : 1 }}
          disabled={isTrap}
        />
        {isTrap && (
          <p className=" text-[10px]" style={{ color: "#6b6780" }}>
            α no afecta la trampa — el circuito está completamente omitido
          </p>
        )}
      </div>

      {/* ── Circuit diagrams ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>diagrama de circuito</SectionLabel>
          {isTrap && (
            <button
              onClick={() => setShowDiff((v) => !v)}
              className=" text-[10px] underline-offset-2"
              style={{ color: "#6b6780" }}
            >
              {showDiff ? "ocultar diferencias" : "mostrar diferencias"}
            </button>
          )}
        </div>
        <TrapCircuitDiagram2Q
          alpha={alpha}
          showTrap={isTrap}
          highlightDiff={showDiff}
        />
      </div>

      {/* ── Probability bars ── */}
      <div>
        <SectionLabel>
          distribución de mediciones ({DEFAULT_SHOTS} shots)
        </SectionLabel>
        <ProbBars
          counts={state.counts}
          shots={state.shots}
          accentColor={accentColor}
        />
      </div>

      {/* ── Energy gauge ── */}
      <div>
        <SectionLabel>energía del hamiltoniano</SectionLabel>
        <EnergyGauge energy={state.energy} energyTheory={state.energyTheory} />
      </div>

      {/* ── Expectation values ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>valores de expectación</SectionLabel>
          <ExpectationsTable exp={{ ...state.expectations }} />
        </div>
        <div>
          <SectionLabel>resumen</SectionLabel>
          <div className="space-y-1.5  text-[11px]">
            <div className="flex justify-between">
              <span style={{ color: "#6b6780" }}>modo</span>
              <span style={{ color: accentColor }}>{mode}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#6b6780" }}>E medida</span>
              <span style={{ color: "#ddd9ee" }}>
                {state.energy.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#6b6780" }}>E teórica</span>
              <span style={{ color: "#9490a8" }}>
                {state.energyTheory.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#6b6780" }}>veredicto</span>
              <span
                style={{
                  color:
                    state.verdict === "accept"
                      ? "#34d399"
                      : state.verdict === "reject"
                        ? "#f87171"
                        : "#f59e0b",
                  fontWeight: 700,
                }}
              >
                {state.verdict.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Concept box ── */}
      <ConceptBox mode={mode} />
    </TrapCard>
  );
}
