/**
 * FinalStateTrap.tsx
 * "Trap 2 — Final State Only"
 *
 * The dishonest prover knows U(α) and submits only a single time step
 * |ψ_k⟩⊗|k⟩ instead of the full clock history superposition |η(α)⟩.
 * H_prop always detects the missing transitions; H_out is satisfied
 * only when the prover claims the final step (claimStep = "t2").
 *
 * Circuit (same as Trap 1):
 *   |0⟩_prover ──── a ──────────────── M
 *   |0⟩_clock  ──── H ──── CRY(2α) ── M
 */

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { TrapCard } from "./TrapCard";
import { EnergyGauge } from "./EnergyGauge";
import { ProbBars } from "./ProbBars";
import { TrapCircuitDiagram1Q } from "./TrapCircuitDiagram";
import { honestCounts } from "../physics/traps";

// ── Types ──────────────────────────────────────────────────────────────────────

type ClaimStep = "t0" | "t1" | "t2";
type Mode = "honest" | "trap";

// ── Constants ───────────────────────────────────────────────────────────────────

const DEFAULT_SHOTS = 1024;
const DEFAULT_ALPHA = Math.PI / 4;
const HONEST_COLOR = "#34d399";
const TRAP_COLOR = "#f87171";

const STEP_HINT: Record<ClaimStep, string> = {
  t0: "Implausible: claims only the initial state — trivially detected",
  t1: "Partial: claims intermediate step — H_prop detects both transitions",
  t2: "Dangerous: claims final state — H_out passes, but H_prop fails",
};

const STEP_VERDICT: Record<ClaimStep, string> = {
  t2: "⚠ H_out is satisfied — only H_prop detects the missing history",
  t1: "✗ Both transitions t=0→1 and t=1→2 are missing — H_prop is high",
  t0: "✗ Trivially detected — no evolution performed at all",
};

const TICK_ANNOTATION: Record<ClaimStep, string> = {
  t2: "prover prepares |ψ₂⟩⊗|2⟩ directly — skips t=0,1",
  t1: "prover prepares |ψ₁⟩⊗|1⟩ directly — skips t=0,2",
  t0: "prover prepares |ψ₀⟩⊗|0⟩ directly — skips t=1,2",
};

// ── Physics ────────────────────────────────────────────────────────────────────

interface EnergyBreakdown {
  H_out: number;
  H_in: number;
  H_prop: number;
  total: number;
}

function trapEnergyBreakdown(
  claimStep: ClaimStep,
  alpha: number,
): EnergyBreakdown {
  const H_out = claimStep === "t2" ? 0 : 0.5;
  const H_in = claimStep === "t0" ? 0 : 0.25;
  const H_prop = 2 * 0.75 * (1 - Math.cos(2 * alpha) / 2);
  return { H_out, H_in, H_prop, total: H_out + H_in + H_prop };
}

function trapCounts2Q(
  claimStep: ClaimStep,
  alpha: number,
  shots: number,
): Record<string, number> {
  switch (claimStep) {
    case "t0":
      return { "00": shots, "01": 0, "10": 0, "11": 0 };
    case "t1": {
      const c2 = Math.pow(Math.cos(alpha / 2), 2);
      const s2 = Math.pow(Math.sin(alpha / 2), 2);
      return {
        "00": Math.round((c2 / 2) * shots),
        "10": Math.round((s2 / 2) * shots),
        "01": Math.round((s2 / 2) * shots),
        "11": Math.round((c2 / 2) * shots),
      };
    }
    case "t2":
      return {
        "00": Math.round(((1 + Math.cos(alpha)) / 4) * shots),
        "01": Math.round(((1 - Math.cos(alpha)) / 4) * shots),
        "10": Math.round(((1 - Math.cos(alpha)) / 4) * shots),
        "11": Math.round(((1 + Math.cos(alpha)) / 4) * shots),
      };
  }
}

// ── SectionLabel ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2 text-[10px] uppercase tracking-widest"
      style={{ color: "#6b6780" }}
    >
      {children}
    </p>
  );
}

// ── ConceptBox ─────────────────────────────────────────────────────────────────

function ConceptBox({ mode, claimStep }: { mode: Mode; claimStep: ClaimStep }) {
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
        The prover applies H and CRY(2α) sequentially. The clock state |η⟩
        encodes all three time steps simultaneously with uniform amplitude 1/√3.
        Every transition is present. Energy = 0.
      </div>
    );
  }

  const labels: Record<ClaimStep, string> = {
    t2: "✗ FINAL STATE ONLY",
    t1: "✗ INTERMEDIATE STATE ONLY",
    t0: "✗ INITIAL STATE ONLY",
  };

  const texts: Record<ClaimStep, string> = {
    t2: "The prover knows U(α) and prepares the correct final state |ψ_2⟩, but presents it without the computational history. H_out is satisfied, but H_prop penalizes the two missing transitions.",
    t1: "The prover claims the intermediate step |ψ_1⟩. Neither H_out nor H_prop is satisfied — both transitions are absent.",
    t0: "The prover claims |ψ_0⟩ = |00⟩. H_in passes, but H_out and H_prop both fail immediately.",
  };

  return (
    <div
      className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
      style={{
        borderColor: "#3a1e1e",
        background: "#1f0f0f",
        color: "#fca5a5",
      }}
    >
      <span className="mr-2 font-semibold">{labels[claimStep]}</span>
      {texts[claimStep]}
    </div>
  );
}

// ── Clock Distribution Chart ───────────────────────────────────────────────────

function ClockDistChart({
  claimStep,
  isTrap,
}: {
  claimStep: ClaimStep;
  isTrap: boolean;
}) {
  const claimIdx = claimStep === "t0" ? 0 : claimStep === "t1" ? 1 : 2;
  const data = [0, 1, 2].map((t) => ({
    label: `t=${t}`,
    P: isTrap ? (t === claimIdx ? 1 : 0) : 1 / 3,
  }));

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, bottom: 4, left: -16 }}
        barSize={28}
      >
        <XAxis
          dataKey="label"
          tick={{ fill: "#9490a8", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: "#6b6780", fontSize: 8 }}
          tickFormatter={(v: number) => v.toFixed(1)}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].value as number;
            return (
              <div
                className="rounded-lg border px-2 py-1 text-[10px]"
                style={{
                  background: "#1e1c2a",
                  borderColor: "#3d3b4a",
                  color: "#ddd9ee",
                }}
              >
                P = {p.toFixed(3)}
              </div>
            );
          }}
        />
        <Bar
          dataKey="P"
          radius={[3, 3, 0, 0]}
          isAnimationActive
          animationDuration={500}
        >
          {data.map((d, i) => (
            <Cell
              key={d.label}
              fill={
                isTrap
                  ? i === claimIdx
                    ? TRAP_COLOR
                    : "#3d3b4a"
                  : HONEST_COLOR
              }
              opacity={!isTrap || i === claimIdx ? 1 : 0.3}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Z-basis outcomes table ─────────────────────────────────────────────────────

const ALL_STATES = ["00", "10", "11", "01"] as const;

function ZBasisTable({
  claimStep,
  alpha,
}: {
  claimStep: ClaimStep;
  alpha: number;
}) {
  const hProbs: Record<string, number> = {
    "00": (1 + Math.cos(alpha)) / 4,
    "01": (1 - Math.cos(alpha)) / 4,
    "10": (1 - Math.cos(alpha)) / 4,
    "11": (1 + Math.cos(alpha)) / 4,
  };

  let trapProbs: Record<string, number>;
  switch (claimStep) {
    case "t0":
      trapProbs = { "00": 1, "01": 0, "10": 0, "11": 0 };
      break;
    case "t1": {
      const c2 = Math.pow(Math.cos(alpha / 2), 2);
      const s2 = Math.pow(Math.sin(alpha / 2), 2);
      trapProbs = { "00": c2 / 2, "10": s2 / 2, "01": s2 / 2, "11": c2 / 2 };
      break;
    }
    case "t2":
    default:
      trapProbs = {
        "00": (1 + Math.cos(alpha)) / 4,
        "01": (1 - Math.cos(alpha)) / 4,
        "10": (1 - Math.cos(alpha)) / 4,
        "11": (1 + Math.cos(alpha)) / 4,
      };
  }

  const isT2 = claimStep === "t2";
  const t2Tooltip =
    "The final state |ψ_2⟩ has the same Z-basis distribution as the honest prover. Z measurements are blind to this trap — only H_prop detects it.";

  return (
    <table
      className="w-full text-right text-[11px]"
      style={{ borderCollapse: "collapse" }}
    >
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
          const tP = trapProbs[state] ?? 0;
          const isAmber = isT2;
          return (
            <tr
              key={state}
              title={isAmber ? t2Tooltip : undefined}
              style={{
                background: isAmber ? "rgba(245,158,11,0.07)" : "transparent",
                borderBottom: "1px solid #1e1c2a",
              }}
            >
              <td
                className="py-1 pl-2 font-mono text-left"
                style={{ color: isAmber ? "#fbbf24" : "#ddd9ee" }}
              >
                |{state}⟩{" "}
                {isAmber && (
                  <span className="text-[9px]" title={t2Tooltip}>
                    ⚠
                  </span>
                )}
              </td>
              <td className="py-1 pl-2 font-mono" style={{ color: "#9490a8" }}>
                {hP.toFixed(3)}
              </td>
              <td
                className="py-1 pl-2 font-mono"
                style={{
                  color: isAmber
                    ? "#fbbf24"
                    : tP > 0.01
                      ? "#ddd9ee"
                      : "#4b4860",
                }}
              >
                {tP.toFixed(3)}
              </td>
              <td
                className="py-1 pl-2 text-left"
                style={{ color: "#6b6780", fontStyle: "italic" }}
              >
                {isAmber
                  ? "Identical to honest dist."
                  : tP > 0.01
                    ? "Present in trap"
                    : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function FinalStateTrap() {
  const [mode, setMode] = useState<Mode>("honest");
  const [alpha, setAlpha] = useState(DEFAULT_ALPHA);
  const [claimStep, setClaimStep] = useState<ClaimStep>("t2");
  const isTrap = mode === "trap";
  const accentColor = isTrap ? TRAP_COLOR : HONEST_COLOR;
  const degs = ((alpha / Math.PI) * 180).toFixed(1);

  const trapEnergy = useMemo(
    () => trapEnergyBreakdown(claimStep, alpha),
    [claimStep, alpha],
  );

  const honestCts = useMemo(
    () => honestCounts(alpha, DEFAULT_SHOTS),
    [alpha],
  );

  const trapCts = useMemo(
    () => trapCounts2Q(claimStep, alpha, DEFAULT_SHOTS),
    [claimStep, alpha],
  );

  const claimLabel = claimStep === "t0" ? "0" : claimStep === "t1" ? "1" : "2";

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
      id="Trap 2 — Final State Only"
      title="Final State Only"
      description="The dishonest prover knows U(α) and submits only the final time step |ψ_2⟩⊗|2⟩ instead of the full clock history superposition |η(α)⟩. H_out is satisfied when claimStep = t2, but H_prop always detects the missing transitions."
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
        <div
          className="flex justify-between text-[10px]"
          style={{ color: "#4b4860" }}
        >
          <span>0 (near-classical)</span>
          <span>π/4 (max entanglement)</span>
          <span>π/2 (full rotation)</span>
        </div>
      </div>

      {/* ── claim step selector ── */}
      {isTrap && (
        <div className="space-y-1.5">
          <SectionLabel>time step claimed by prover</SectionLabel>
          <select
            value={claimStep}
            onChange={(e) => setClaimStep(e.target.value as ClaimStep)}
            className="w-full rounded-lg px-3 py-2 font-mono text-[12px] outline-none"
            style={{
              background: "#1e1c2a",
              border: "1px solid #3d3b4a",
              color: "#ddd9ee",
            }}
          >
            <option value="t0">t=0 — initial state |ψ₀⟩ = |00⟩</option>
            <option value="t1">t=1 — intermediate state |ψ₁⟩</option>
            <option value="t2">
              t=2 — final state |ψ₂⟩ (hardest to detect)
            </option>
          </select>
          <p
            className="text-[11px]"
            style={{ color: "#9490a8", fontStyle: "italic" }}
          >
            {STEP_HINT[claimStep]}
          </p>
          <div
            className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
            style={{
              borderColor: "rgba(245,158,11,0.45)",
              background: "rgba(120,53,15,0.18)",
              color: "#fcd34d",
            }}
          >
            <span className="mr-2 font-semibold">
              ⚠ Why is this harder to detect than Trap 1?
            </span>
            Unlike Trap 1, this prover actually knows U(α) and prepares a real
            quantum state — just the wrong one. The final state |ψ_2⟩ looks
            correct in Z-basis measurements and satisfies H_out. Only H_prop
            reveals that the temporal history is incomplete: the prover jumped
            straight to the end without showing their work.
          </div>
        </div>
      )}

      {/* ── circuit diagram ── */}
      <div>
        <SectionLabel>circuit — 2-qubit clock state</SectionLabel>
        <TrapCircuitDiagram1Q
          alpha={alpha}
          isTrap={isTrap}
          highlightDiff
          annotation={isTrap ? TICK_ANNOTATION[claimStep] : undefined}
        />
      </div>

      {/* ── clock step distribution ── */}
      <div>
        <SectionLabel>clock step distribution</SectionLabel>
        <ClockDistChart claimStep={claimStep} isTrap={isTrap} />
      </div>

      {/* ── measurement distribution ── */}
      <div>
        <SectionLabel>
          measurement distribution ({DEFAULT_SHOTS} shots)
        </SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p
              className="mb-2 text-[11px] font-medium"
              style={{ color: HONEST_COLOR }}
            >
              Honest |η(α)⟩
            </p>
            <ProbBars
              counts={honestCts}
              shots={DEFAULT_SHOTS}
              accentColor={HONEST_COLOR}
            />
          </div>
          <div>
            <p
              className="mb-2 text-[11px] font-medium"
              style={{ color: isTrap ? TRAP_COLOR : "#4b4860" }}
            >
              Trap |ψ{claimLabel}⟩
            </p>
            <ProbBars
              counts={trapCts}
              shots={DEFAULT_SHOTS}
              accentColor={isTrap ? TRAP_COLOR : "#4b4860"}
            />
          </div>
        </div>
      </div>

      {/* ── energy gauge ── */}
      <div>
        <SectionLabel>hamiltonian energy</SectionLabel>
        <EnergyGauge energy={isTrap ? trapEnergy.total : 0} energyTheory={0} />
        {isTrap && (
          <>
            <div
              className="mt-2 flex gap-4 text-[10px]"
              style={{ color: "#6b6780" }}
            >
              <span>H_out = {trapEnergy.H_out.toFixed(2)}</span>
              <span>H_in = {trapEnergy.H_in.toFixed(2)}</span>
              <span style={{ color: TRAP_COLOR, fontWeight: 600 }}>
                H_prop = {trapEnergy.H_prop.toFixed(2)} ←
              </span>
            </div>
            <p
              className="mt-1.5 text-[11px]"
              style={{
                color: claimStep === "t2" ? "#f59e0b" : TRAP_COLOR,
                fontStyle: "italic",
              }}
            >
              {STEP_VERDICT[claimStep]}
            </p>
          </>
        )}
      </div>

      {/* ── z-basis outcomes (trap mode only) ── */}
      {isTrap && (
        <div>
          <SectionLabel>z-basis outcomes</SectionLabel>
          <ZBasisTable claimStep={claimStep} alpha={alpha} />
        </div>
      )}

      {/* ── concept box ── */}
      <ConceptBox mode={mode} claimStep={claimStep} />
    </TrapCard>
  );
}

// Named re-export for TrapsPage.tsx
export { FinalStateTrap };
