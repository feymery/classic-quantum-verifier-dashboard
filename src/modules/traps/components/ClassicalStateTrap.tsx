/**
 * ClassicalStateTrap.tsx
 * "Trap 1 — 2Q: Classical State Instead of Superposition"
 *
 * The dishonest prover skips the entire quantum circuit and submits a single
 * classical basis state |ab⟩ instead of the 2-qubit clock history
 * superposition |η(α)⟩.  H_prop always detects the missing evolution.
 *
 * Circuit:
 *   |0⟩_prover ──── a ──────────────── M
 *   |0⟩_clock  ──── H ──── CRY(2α) ── M
 */

import { useMemo, useState } from "react";
import { TrapCard } from "./TrapCard";
import { EnergyGauge } from "./EnergyGauge";
import { ProbBars } from "./ProbBars";

// ── Types ──────────────────────────────────────────────────────────────────────

type TrapState2Q = "00" | "01" | "10" | "11";
type Mode = "honest" | "trap";

// ── Constants ───────────────────────────────────────────────────────────────────

const DEFAULT_SHOTS = 1024;
const DEFAULT_ALPHA = Math.PI / 4;
const HONEST_COLOR = "#34d399";
const TRAP_COLOR = "#f87171";

const STATE_HINT: Record<TrapState2Q, string> = {
  "00": "Trivial: correct input but wrong output",
  "01": "Partial: may appear in the honest distribution",
  "10": "Worst choice: penalized directly by H_in",
  "11": "Dangerous: correct output, but H_prop exposes it",
};

const VERDICT_SUBTITLE: Record<TrapState2Q, string> = {
  "11": "⚠ Looks honest in Z-basis — only H_prop exposes missing history",
  "10": "✗ Trivially detected — H_in directly penalizes |10⟩",
  "00": "✗ Detected — correct input but H_out and H_prop both fail",
  "01": "✗ Detected — H_prop exposes missing U(α) transition",
};

// ── SVG layout ──────────────────────────────────────────────────────────────────────────

const SVG_W = 680;
const SVG_H = 110;
const Y_PROVER = 34;
const Y_CLOCK = 76;
const WIRE_L = 72;
const WIRE_R = SVG_W - 20;
const X_GATE_A = 104;
const X_GATE_H = 230;
const X_GATE_CRY = 400;
const X_MEAS = SVG_W - 30;
const GATE_W = 26;
const GATE_H = 20;

// ── Physics ───────────────────────────────────────────────────────────────────────────

interface EnergyBreakdown {
  H_out: number;
  H_in: number;
  H_prop: number;
  total: number;
}

function trapEnergyBreakdown(
  trapState: TrapState2Q,
  alpha: number,
): EnergyBreakdown {
  const validOutput = trapState === "00" || trapState === "11";
  const H_out = validOutput ? 0 : 0.5;
  const H_in_penalty = trapState === "10" ? 1.5 : 0.25;
  const H_prop = 1.5 * (1 - Math.cos(2 * alpha) / 2);
  return { H_out, H_in: H_in_penalty, H_prop, total: H_out + H_in_penalty + H_prop };
}

function honestCounts2Q(alpha: number, shots: number): Record<string, number> {
  return {
    "00": Math.round(((1 + Math.cos(alpha)) / 4) * shots),
    "01": Math.round(((1 - Math.cos(alpha)) / 4) * shots),
    "10": Math.round(((1 - Math.cos(alpha)) / 4) * shots),
    "11": Math.round(((1 + Math.cos(alpha)) / 4) * shots),
  };
}

// ── SectionLabel ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] uppercase tracking-widest" style={{ color: "#6b6780" }}>
      {children}
    </p>
  );
}

// ── ConceptBox ────────────────────────────────────────────────────────────────────

function ConceptBox({ mode, trapState }: { mode: Mode; trapState: TrapState2Q }) {
  if (mode === "honest") {
    return (
      <div
        className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
        style={{ borderColor: "#1e3a2a", background: "#0f1f16", color: "#86efac" }}
      >
        <span className="mr-2 font-semibold">✓ HONEST PROVER</span>
        The prover applies H and CRY(2α) correctly. The clock qubit enters superposition,
        and the Hamiltonian sees coherent temporal correlations across all three time
        steps simultaneously. Energy = 0 — accepted.
      </div>
    );
  }
  return (
    <div
      className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
      style={{ borderColor: "#3a1e1e", background: "#1f0f0f", color: "#fca5a5" }}
    >
      <span className="mr-2 font-semibold">✗ TRAP DETECTED</span>
      The prover skipped H and CRY(2α) entirely and submitted the classical state{" "}
      <span className="font-mono">|{trapState}⟩</span> with no temporal superposition.{" "}
      {VERDICT_SUBTITLE[trapState]}
    </div>
  );
}

// ── SVG helpers ─────────────────────────────────────────────────────────────────────

function SvgGateBox({
  x,
  y,
  label,
  sub,
  color = "#a78bfa",
  faded = false,
}: {
  x: number;
  y: number;
  label: string;
  sub?: string;
  color?: string;
  faded?: boolean;
}) {
  const w = sub ? 62 : GATE_W;
  return (
    <g opacity={faded ? 0.22 : 1}>
      <rect
        x={x - w / 2}
        y={y - GATE_H / 2}
        width={w}
        height={GATE_H}
        rx={3}
        fill="#1e1c2a"
        stroke={color}
        strokeWidth={1.2}
      />
      <text
        x={x}
        y={y + (sub ? -1 : 4)}
        textAnchor="middle"
        fill={color}
        fontSize={sub ? 7.5 : 9}
        fontFamily="monospace"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={y + 8}
          textAnchor="middle"
          fill={color}
          fontSize={6}
          fontFamily="monospace"
          opacity={0.75}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function SvgCross({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x - 9} y1={y - 9} x2={x + 9} y2={y + 9} stroke={TRAP_COLOR} strokeWidth={1.5} opacity={0.75} />
      <line x1={x + 9} y1={y - 9} x2={x - 9} y2={y + 9} stroke={TRAP_COLOR} strokeWidth={1.5} opacity={0.75} />
    </g>
  );
}

function SvgMeasBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 12} y={y - 10} width={24} height={20} rx={3} fill="#1e1c2a" stroke="#3d3b4a" strokeWidth={1} />
      <text x={x} y={y + 4} textAnchor="middle" fill="#6b6780" fontSize={8} fontFamily="monospace">
        M
      </text>
    </g>
  );
}

// ── Circuit SVG ────────────────────────────────────────────────────────────────────────

function CircuitSVG({
  alpha,
  trapState,
  isTrap,
  highlightDiff,
}: {
  alpha: number;
  trapState: TrapState2Q;
  isTrap: boolean;
  highlightDiff: boolean;
}) {
  const gateColor = isTrap ? "#6b6780" : "#a78bfa";
  const cryColor = isTrap ? "#6b6780" : "#6366f1";
  const fadeTrap = isTrap && highlightDiff;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ background: "#1e1c2a", borderRadius: 8 }}
      role="img"
      aria-label="2-qubit clock-state circuit"
    >
      {/* qubit labels */}
      <text x={8} y={Y_PROVER + 4} textAnchor="start" fill="#6b6780" fontSize={9} fontFamily="monospace">
        |0⟩_prover
      </text>
      <text x={8} y={Y_CLOCK + 4} textAnchor="start" fill="#6b6780" fontSize={9} fontFamily="monospace">
        |0⟩_clock
      </text>

      {/* wires */}
      <line x1={WIRE_L} y1={Y_PROVER} x2={WIRE_R} y2={Y_PROVER} stroke="#3d3b4a" strokeWidth={1.5} />
      <line x1={WIRE_L} y1={Y_CLOCK} x2={WIRE_R} y2={Y_CLOCK} stroke="#3d3b4a" strokeWidth={1.5} />

      {/* a gate — identity, always present */}
      <SvgGateBox x={X_GATE_A} y={Y_PROVER} label="a" color="#6b6780" />

      {/* H gate */}
      <SvgGateBox x={X_GATE_H} y={Y_CLOCK} label="H" color={gateColor} faded={fadeTrap} />
      {fadeTrap && <SvgCross x={X_GATE_H} y={Y_CLOCK} />}

      {/* CRY gate */}
      <g opacity={fadeTrap ? 0.22 : 1}>
        <line
          x1={X_GATE_CRY}
          y1={Y_PROVER + GATE_H / 2 + 1}
          x2={X_GATE_CRY}
          y2={Y_CLOCK - 5}
          stroke={cryColor}
          strokeWidth={1.2}
        />
        <circle cx={X_GATE_CRY} cy={Y_CLOCK} r={4} fill={cryColor} />
      </g>
      <SvgGateBox
        x={X_GATE_CRY}
        y={Y_PROVER}
        label="CRY"
        sub={`2α=${(2 * alpha).toFixed(2)}`}
        color={cryColor}
        faded={fadeTrap}
      />
      {fadeTrap && <SvgCross x={X_GATE_CRY} y={Y_PROVER} />}

      {/* Measurement */}
      <SvgMeasBox x={X_MEAS} y={Y_PROVER} />
      <SvgMeasBox x={X_MEAS} y={Y_CLOCK} />

      {/* Trap annotation */}
      {isTrap && (
        <text
          x={SVG_W / 2}
          y={SVG_H - 5}
          textAnchor="middle"
          fill={TRAP_COLOR}
          fontSize={8}
          fontFamily="monospace"
          opacity={0.65}
        >
          submits |{trapState}⟩ directly — no quantum evolution
        </text>
      )}
    </svg>
  );
}

// ── Z-basis outcomes table ───────────────────────────────────────────────────────────────────

const ALL_STATES: TrapState2Q[] = ["00", "10", "11", "01"];

function ZBasisTable({ trapState, alpha }: { trapState: TrapState2Q; alpha: number }) {
  const hProbs: Record<TrapState2Q, number> = {
    "00": (1 + Math.cos(alpha)) / 4,
    "01": (1 - Math.cos(alpha)) / 4,
    "10": (1 - Math.cos(alpha)) / 4,
    "11": (1 + Math.cos(alpha)) / 4,
  };
  const amberTooltip =
    "This outcome appears in the honest distribution — Z-basis alone cannot tell honest from trap. Only H_prop reveals the deception.";

  return (
    <table className="w-full text-right text-[11px]" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Outcome", "Honest prob.", "Trap prob.", "Note"].map((h) => (
            <th
              key={h}
              className="pb-1.5 pl-2 text-left text-[10px] uppercase tracking-widest"
              style={{ color: "#6b6780", borderBottom: "1px solid #2d2b3a" }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ALL_STATES.map((state) => {
          const hP = hProbs[state];
          const tP = state === trapState ? 1 : 0;
          const isAmber = state === trapState && hP > 0.12;
          return (
            <tr
              key={state}
              title={isAmber ? amberTooltip : undefined}
              style={{
                background: isAmber ? "rgba(245,158,11,0.07)" : "transparent",
                borderBottom: "1px solid #1e1c2a",
              }}
            >
              <td className="py-1 pl-2 text-left font-mono" style={{ color: isAmber ? "#fbbf24" : "#ddd9ee" }}>
                |{state}⟩{" "}
                {isAmber && (
                  <span className="text-[9px]" title={amberTooltip}>
                    ⚠
                  </span>
                )}
              </td>
              <td className="py-1 pl-2 font-mono" style={{ color: "#9490a8" }}>
                {hP.toFixed(3)}
              </td>
              <td className="py-1 pl-2 font-mono" style={{ color: tP === 1 ? TRAP_COLOR : "#4b4860" }}>
                {tP.toFixed(1)}
              </td>
              <td className="py-1 pl-2 text-left" style={{ color: "#6b6780", fontStyle: "italic" }}>
                {state === "10" ? "H_in penalty" : isAmber ? "Appears in honest dist." : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Main component ────────────────────────────────────────────────────────────────────────

export default function ClassicalStateTrap() {
  const [mode, setMode] = useState<Mode>("honest");
  const [alpha, setAlpha] = useState(DEFAULT_ALPHA);
  const [trapState, setTrapState] = useState<TrapState2Q>("11");
  const [showDiff, setShowDiff] = useState(true);

  const isTrap = mode === "trap";
  const accentColor = isTrap ? TRAP_COLOR : HONEST_COLOR;
  const degs = ((alpha / Math.PI) * 180).toFixed(1);

  const trapEnergy = useMemo(
    () => trapEnergyBreakdown(trapState, alpha),
    [trapState, alpha],
  );

  const honestCts = useMemo(
    () => honestCounts2Q(alpha, DEFAULT_SHOTS),
    [alpha],
  );

  const trapCts: Record<string, number> = useMemo(
    () => ({ [trapState]: DEFAULT_SHOTS }),
    [trapState],
  );

  const toggleButton = (
    <button
      onClick={() => setMode(isTrap ? "honest" : "trap")}
      className="shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-all duration-300"
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
      {isTrap ? "← honest prover" : "activate trap →"}
    </button>
  );

  return (
    <TrapCard
      id="Trap 1 — 2Q"
      title="Classical State Instead of Superposition"
      description="The dishonest prover skips the entire quantum circuit and submits a single classical basis state |ab⟩ instead of the 2-qubit clock history superposition |η(α)⟩. The Hamiltonian H_prop always detects the missing temporal coherence."
      borderColor={isTrap ? "#3a1e1e" : "#1a2a3a"}
      actions={toggleButton}
    >
      {/* ── α slider ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <SectionLabel>parameter α</SectionLabel>
          <span className="text-[11px]" style={{ color: accentColor }}>
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
        />
        <div className="flex justify-between text-[10px]" style={{ color: "#4b4860" }}>
          <span>0 (near-classical)</span>
          <span>π/4 (max entanglement)</span>
          <span>π/2 (full rotation)</span>
        </div>
      </div>

      {/* ── trap state selector ── */}
      {isTrap && (
        <div className="space-y-1.5">
          <SectionLabel>state claimed by prover</SectionLabel>
          <select
            value={trapState}
            onChange={(e) => setTrapState(e.target.value as TrapState2Q)}
            className="w-full rounded-lg px-3 py-2 font-mono text-[12px] outline-none"
            style={{ background: "#1e1c2a", border: "1px solid #3d3b4a", color: "#ddd9ee" }}
          >
            <option value="00">|00⟩ — correct input, wrong output</option>
            <option value="01">|01⟩ — may appear in honest distribution</option>
            <option value="10">|10⟩ — penalized directly by H_in</option>
            <option value="11">|11⟩ — correct output, wrong history (hardest to detect)</option>
          </select>
          <p className="text-[11px]" style={{ color: "#9490a8", fontStyle: "italic" }}>
            {STATE_HINT[trapState]}
          </p>
          <div
            className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
            style={{
              borderColor: "rgba(245,158,11,0.45)",
              background: "rgba(120,53,15,0.18)",
              color: "#fcd34d",
            }}
          >
            <span className="mr-2 font-semibold">⚠ Hardest to detect</span>
            A smart prover always chooses{" "}
            <span className="font-mono">|11⟩</span> — it satisfies H_out and appears in the
            honest measurement distribution. Only{" "}
            <span className="font-mono">H_prop</span> reveals the deception, because the
            quantum transition U(α) was never actually performed.
          </div>
        </div>
      )}

      {/* ── circuit diagram ── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>circuit — 2-qubit clock state</SectionLabel>
          {isTrap && (
            <button
              onClick={() => setShowDiff((v) => !v)}
              className="text-[10px] underline-offset-2"
              style={{ color: "#6b6780" }}
            >
              {showDiff ? "hide diff" : "show diff"}
            </button>
          )}
        </div>
        <CircuitSVG alpha={alpha} trapState={trapState} isTrap={isTrap} highlightDiff={showDiff} />
      </div>

      {/* ── measurement distribution ── */}
      <div>
        <SectionLabel>measurement distribution ({DEFAULT_SHOTS} shots)</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium" style={{ color: HONEST_COLOR }}>
              Honest |η(α)⟩
            </p>
            <ProbBars counts={honestCts} shots={DEFAULT_SHOTS} accentColor={HONEST_COLOR} />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium" style={{ color: isTrap ? TRAP_COLOR : "#4b4860" }}>
              Trap |{trapState}⟩
            </p>
            <ProbBars counts={trapCts} shots={DEFAULT_SHOTS} accentColor={isTrap ? TRAP_COLOR : "#4b4860"} />
          </div>
        </div>
      </div>

      {/* ── energy gauge ── */}
      <div>
        <SectionLabel>hamiltonian energy</SectionLabel>
        <EnergyGauge energy={isTrap ? trapEnergy.total : 0} energyTheory={0} />
        {isTrap && (
          <>
            <div className="mt-2 flex gap-4 text-[10px]" style={{ color: "#6b6780" }}>
              <span>H_out = {trapEnergy.H_out.toFixed(2)}</span>
              <span>H_in = {trapEnergy.H_in.toFixed(2)}</span>
              <span style={{ color: TRAP_COLOR, fontWeight: 600 }}>
                H_prop = {trapEnergy.H_prop.toFixed(2)} ←
              </span>
            </div>
            <p
              className="mt-1.5 text-[11px]"
              style={{ color: trapState === "11" ? "#f59e0b" : TRAP_COLOR, fontStyle: "italic" }}
            >
              {VERDICT_SUBTITLE[trapState]}
            </p>
          </>
        )}
      </div>

      {/* ── z-basis outcomes (trap mode only) ── */}
      {isTrap && (
        <div>
          <SectionLabel>z-basis outcomes</SectionLabel>
          <ZBasisTable trapState={trapState} alpha={alpha} />
        </div>
      )}

      {/* ── concept box ── */}
      <ConceptBox mode={mode} trapState={trapState} />
    </TrapCard>
  );
}

// Named re-export for backwards compatibility with TrapsPage.tsx
export { ClassicalStateTrap };
