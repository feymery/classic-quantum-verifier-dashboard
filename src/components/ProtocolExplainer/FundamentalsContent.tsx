/**
 * FundamentalsContent.tsx
 *
 * Two-section educational layout for the Fundamentals page:
 *   E — The paper we based this on (Stricker et al., 2024)
 *   O — Our simplified implementation
 */

import { Card } from "../../ui/Card";

// ─── colour palette (matches existing dashboard tokens) ──────────────────────
const C = {
  alice: "#b7a8cf",
  bob: "#a78bfa",
  green: "#34d399",
  red: "#f87171",
  orange: "#e8a020",
  blue: "#60a5fa",
};

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function SectionBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ background: color + "22", color }}
    >
      {label}
    </span>
  );
}

function ConceptBox({
  icon,
  title,
  color,
  children,
}: {
  icon: string;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-3 space-y-1.5"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {title}
        </span>
      </div>
      <div
        className="text-[11px] leading-relaxed space-y-1"
        style={{ color: "var(--color-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="block rounded px-2 py-1.5 text-[11px] leading-relaxed font-mono"
      style={{
        background: "var(--color-surface)",
        color: "var(--color-foreground)",
      }}
    >
      {children}
    </code>
  );
}

function ImplStep({
  n,
  title,
  accent,
  children,
  last,
}: {
  n: number;
  title: string;
  accent: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* number + connector line */}
      <div className="flex flex-col items-center shrink-0">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0"
          style={{ background: accent, color: "var(--color-canvas)" }}
        >
          {n}
        </span>
        {!last && (
          <span
            className="flex-1 w-px mt-1"
            style={{ background: "var(--color-border)" }}
          />
        )}
      </div>
      {/* content */}
      <div className={`min-w-0 flex-1 space-y-1.5 ${last ? "" : "pb-4"}`}>
        <p className="text-xs font-semibold" style={{ color: accent }}>
          {title}
        </p>
        <div
          className="text-[11px] leading-relaxed space-y-1.5"
          style={{ color: "var(--color-muted)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function HamRow({
  name,
  formula,
  what,
  color,
}: {
  name: string;
  formula: string;
  what: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg p-2 space-y-0.5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-baseline gap-2">
        <span
          className="text-[11px] font-bold font-mono shrink-0 w-12"
          style={{ color }}
        >
          {name}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: "var(--color-foreground)" }}
        >
          {formula}
        </span>
      </div>
      <p className="text-[10px] pl-14" style={{ color: "var(--color-subtle)" }}>
        {what}
      </p>
    </div>
  );
}

function BasisCard({
  basis,
  rotation,
  obs,
  color,
}: {
  basis: string;
  rotation: string;
  obs: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg p-2 space-y-0.5"
      style={{ background: "var(--color-surface)" }}
    >
      <p className="text-[11px] font-bold font-mono" style={{ color }}>
        {basis}
      </p>
      <p className="text-[10px]" style={{ color: "var(--color-subtle)" }}>
        {rotation}
      </p>
      <p
        className="text-[10px] font-mono"
        style={{ color: "var(--color-muted)" }}
      >
        {obs}
      </p>
    </div>
  );
}

// ─── Section E: The Paper ─────────────────────────────────────────────────────

function ThePaperSection() {
  return (
    <Card padded="md">
      {/* header */}
      <div className="mb-4 space-y-1">
        <SectionBadge label="The paper we based this on" color={C.alice} />
        <h2
          className="mt-1 text-sm font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          Classical Verification of Quantum Computations
        </h2>
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Stricker et al. (2024) —{" "}
          <em>
            Towards experimental classical verification of quantum computation
          </em>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* The problem */}
        <ConceptBox icon="❓" title="The problem" color={C.alice}>
          {/* Actor diagram */}
          <div className="flex items-center justify-between gap-1 mx-40 mt-1">
            {/* Alice */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="rounded-lg px-3 py-1.5 text-[11px] font-bold"
                style={{
                  background: C.alice + "22",
                  color: C.alice,
                  border: `1px solid ${C.alice}55`,
                }}
              >
                Alice
              </div>
              <span
                className="text-[9px]"
                style={{ color: "var(--color-muted)" }}
              >
                classical
              </span>
            </div>

            {/* Arrows */}
            <div className="flex flex-col items-center gap-0.5 flex-1 text-center">
              <div className="flex items-center gap-0.5 w-full justify-center">
                <div
                  className="flex-1 h-px"
                  style={{ background: C.alice + "66" }}
                />
                <span className="text-[9px] px-0.5" style={{ color: C.alice }}>
                  run X?
                </span>
                <span className="text-[9px]" style={{ color: C.alice }}>
                  →
                </span>
              </div>
              <div className="flex items-center gap-0.5 w-full justify-center">
                <span className="text-[9px]" style={{ color: C.bob }}>
                  ←
                </span>
                <span className="text-[9px] px-0.5" style={{ color: C.bob }}>
                  result Y
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: C.bob + "66" }}
                />
              </div>
              <span
                className="mt-1 text-[9px] rounded px-1.5 py-0.5 font-bold"
                style={{ background: "var(--color-surface)", color: C.orange }}
              >
                trust Y?
              </span>
            </div>

            {/* Bob */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="rounded-lg px-3 py-1.5 text-[11px] font-bold"
                style={{
                  background: C.bob + "22",
                  color: C.bob,
                  border: `1px solid ${C.bob}55`,
                }}
              >
                Bob
              </div>
              <span
                className="text-[9px]"
                style={{ color: "var(--color-muted)" }}
              >
                quantum
              </span>
            </div>
          </div>
          <p
            className="text-[10px] mt-2"
            style={{ color: "var(--color-subtle)" }}
          >
            Alice can't simulate: quantum states are exponentially hard to
            compute classically.
          </p>
        </ConceptBox>

        {/* The Hamiltonian */}
        <ConceptBox icon="⚛️" title="The Hamiltonian" color={C.bob}>
          <p>
            Alice builds{" "}
            <strong style={{ color: "var(--color-foreground)" }}>
              H = H_out + 6·H_in + 3·H_prop
            </strong>{" "}
            from the circuit. Each term penalises a different violation:
          </p>
          <ul
            className="space-y-0.5 pl-2 list-none"
            style={{ color: "var(--color-subtle)" }}
          >
            <li>
              <span style={{ color: C.alice }}>H_out</span> — wrong final output
            </li>
            <li>
              <span style={{ color: C.alice }}>H_in</span> — wrong initial state
            </li>
            <li>
              <span style={{ color: C.bob }}>H_prop</span> — incorrect gate
              application
            </li>
          </ul>
        </ConceptBox>

        {/* The key insight */}
        <ConceptBox icon="💡" title="The key insight" color={C.orange}>
          <p>
            Turn verification into an{" "}
            <strong style={{ color: "var(--color-foreground)" }}>
              energy measurement
            </strong>
            . Bob encodes the full computation into a static{" "}
            <em>history state</em> whose energy is{" "}
            <strong style={{ color: C.green }}>low</strong> if every gate was
            correct.
          </p>
          <div
            className="rounded p-1.5 mt-1 grid grid-cols-2 gap-1 text-[10px] text-center font-mono"
            style={{ background: "var(--color-surface)" }}
          >
            <span style={{ color: C.green }}>E &lt; 0.4 → ACCEPT ✓</span>
            <span style={{ color: C.red }}>E &gt; 0.5 → REJECT ✗</span>
          </div>
        </ConceptBox>

        {/* Trapdoor functions */}
        <ConceptBox
          icon="🔐"
          title="Trapdoor functions (full protocol)"
          color={C.blue}
        >
          <p>
            The full protocol hides the measurement basis from Bob using
            cryptographic trapdoor functions — requiring 8 qubits and
            interactive rounds.
          </p>
          <p
            className="px-2 py-1 rounded"
            style={{
              background: C.orange + "15",
              color: C.orange,
              border: `1px solid ${C.orange}44`,
            }}
          >
            We simplified to 2 qubits by removing the trapdoor layer, trading
            security for experimental feasibility.
          </p>
        </ConceptBox>
      </div>
    </Card>
  );
}

// ─── Section O: Our Implementation ───────────────────────────────────────────

interface OurImplementationSectionProps {
  alpha: number;
}

function OurImplementationSection({ alpha }: OurImplementationSectionProps) {
  const cosA = Math.cos(alpha).toFixed(3);
  const sinA = Math.sin(alpha).toFixed(3);
  const sin2A = Math.pow(Math.sin(alpha), 2).toFixed(3);

  return (
    <Card padded="md">
      {/* header */}
      <div className="mb-4 space-y-1">
        <SectionBadge label="Our implementation" color={C.bob} />
        <h2
          className="mt-1 text-sm font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          How the Protocol Works — Step by Step
        </h2>
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Circuit:{" "}
          <span
            className="font-mono"
            style={{ color: "var(--color-foreground)" }}
          >
            U(α) = cos α · Z + sin α · X
          </span>
          , currently α ={" "}
          <span className="font-mono" style={{ color: C.bob }}>
            {alpha.toFixed(3)} rad
          </span>
        </p>
      </div>

      <div className="space-y-0">
        {/* Step 1 */}
        <ImplStep n={1} title="Build the Hamiltonian" accent={C.alice}>
          <div className="space-y-1">
            <HamRow
              name="H_in"
              formula="¼(I − Z₁ + Z₂ − Z₁Z₂)"
              what="Penalises |10⟩ — wrong initial state (system ≠ |0⟩ at t=0)"
              color={C.alice}
            />
            <HamRow
              name="H_out"
              formula="½(I − Z₁ − Z₂ + Z₁Z₂)"
              what="Penalises |11⟩ — wrong output (system ≠ |0⟩ at t=1)"
              color={C.alice}
            />
            <HamRow
              name="H_prop"
              formula="½(I − cosα·Z₁X₂ − sinα·X₁X₂)"
              what="Penalises incorrect gate — transition t=0→t=1 must match U(α)"
              color={C.bob}
            />
          </div>
          <Formula>H = H_out + 6·H_in + 3·H_prop</Formula>
        </ImplStep>

        {/* Step 2 */}
        <ImplStep n={2} title="Prepare the history state |η(α)⟩" accent={C.bob}>
          <Formula>
            |η⟩ = 1/√2 · ( |00⟩ + cos α·|01⟩ + sin α·|11⟩ ){"\n"}
            <span style={{ color: "var(--color-subtle)", fontSize: 10 }}>
              cos α = {cosA}, sin α = {sinA}
            </span>
          </Formula>
          <div
            className="rounded-lg px-2 py-1.5 text-[10px]"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <span className="font-mono" style={{ color: C.alice }}>
              q₀ (clock): ──H──●──
            </span>
            {"  "}
            <span className="font-mono" style={{ color: C.bob }}>
              q₁ (work): ──CRY(2α)──
            </span>
          </div>
        </ImplStep>

        {/* Step 3 */}
        <ImplStep n={3} title="Measure in three Pauli bases" accent={C.orange}>
          <div className="grid grid-cols-3 gap-1">
            <BasisCard
              basis="ZZ"
              rotation="no rotation"
              obs="⟨Z₁⟩  ⟨Z₂⟩  ⟨Z₁Z₂⟩"
              color={C.alice}
            />
            <BasisCard
              basis="ZX"
              rotation="H on q₀"
              obs="⟨Z₁X₂⟩"
              color={C.green}
            />
            <BasisCard
              basis="XX"
              rotation="H on both"
              obs="⟨X₁X₂⟩"
              color={C.orange}
            />
          </div>
        </ImplStep>

        {/* Step 4 */}
        <ImplStep n={4} title="Compute E = ⟨H⟩" accent={C.green}>
          <Formula>
            E = 3.5 − 2·⟨Z₂⟩ + ⟨Z₁⟩ − ⟨Z₁Z₂⟩{"\n"}
            {"    "}− 1.5·cosα·⟨Z₁X₂⟩ − 1.5·sinα·⟨X₁X₂⟩
          </Formula>
          <p style={{ color: "var(--color-subtle)" }}>
            Ideal: E = sin²α ={" "}
            <span className="font-mono" style={{ color: C.green }}>
              {sin2A}
            </span>{" "}
            at current α.
          </p>
        </ImplStep>

        {/* Step 5 — Verdict (last, no connector line) */}
        <ImplStep n={5} title="Verdict" accent={C.red} last>
          <div className="grid grid-cols-3 gap-1">
            <div
              className="p-2 text-center rounded-lg"
              style={{
                background: "rgba(52,211,153,0.12)",
                border: `1px solid ${C.green}`,
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: C.green }}>
                ACCEPT
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "var(--color-muted)" }}
              >
                E &lt; 0.4
              </p>
            </div>
            <div
              className="p-2 text-center rounded-lg"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: C.orange }}>
                MARGINAL
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "var(--color-muted)" }}
              >
                0.4 ≤ E ≤ 0.5
              </p>
            </div>
            <div
              className="p-2 text-center rounded-lg"
              style={{
                background: "rgba(248,113,113,0.12)",
                border: `1px solid ${C.red}`,
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: C.red }}>
                REJECT
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "var(--color-muted)" }}
              >
                E &gt; 0.5
              </p>
            </div>
          </div>
          <p
            className="text-[10px] mt-1"
            style={{ color: "var(--color-subtle)" }}
          >
            Classical prover minimum energy:{" "}
            <span className="font-mono" style={{ color: C.red }}>
              E = 1.5
            </span>{" "}
            — always rejected. Honest quantum prover at α ≤ α_c ≈ 0.685 rad:
            always accepted (noiseless).
          </p>
        </ImplStep>
      </div>
    </Card>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export interface FundamentalsContentProps {
  alpha: number;
}

export function FundamentalsContent({ alpha }: FundamentalsContentProps) {
  return (
    <div className="space-y-6">
      <ThePaperSection />
      <OurImplementationSection alpha={alpha} />
    </div>
  );
}
