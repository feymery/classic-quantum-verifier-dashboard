import { Card } from "../../../../ui/Card";

interface ProtocolGuide1QProps {
  alpha: number;
}

const ALICE_C = "#b7a8cf";
const BOB_C = "#a78bfa";
const STEP_ACCENT = [ALICE_C, BOB_C, "#e8a020", "#34d399", "#f87171"];

function Step({
  n,
  actor,
  to,
  title,
  accent,
  children,
}: {
  n: number;
  actor: "ALICE" | "BOB";
  to?: "ALICE" | "BOB";
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  const toColor = to === "ALICE" ? ALICE_C : to === "BOB" ? BOB_C : null;

  return (
    <div
      className="flex gap-3 p-3 border rounded-xl"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-elevated)",
      }}
    >
      {/* number + actor */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: accent, color: "var(--color-canvas)" }}
        >
          {n}
        </span>
        <span
          className="text-[8px] font-bold uppercase tracking-widest"
          style={{
            color: accent,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          {actor}
        </span>
      </div>
      {/* content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-semibold" style={{ color: accent }}>
            {title}
          </p>
          {to && toColor && (
            <span
              className="text-[9px] font-mono rounded px-1 py-0.5"
              style={{
                color: "var(--color-subtle)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span style={{ color: accent }}>{actor}</span>
              {" → "}
              <span style={{ color: toColor }}>{to}</span>
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="block rounded px-2 py-1 text-[11px] leading-relaxed"
      style={{
        background: "var(--color-surface)",
        color: "var(--color-foreground)",
      }}
    >
      {children}
    </code>
  );
}

function Tag({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: color + "22", color }}
    >
      {children}
    </span>
  );
}

function Frac({ num, den }: { num: string; den: string }) {
  return (
    <span className="inline-flex flex-col items-center leading-none mx-0.5 align-middle">
      <span
        className="font-mono text-[9px]"
        style={{ color: "var(--color-muted)" }}
      >
        {num}
      </span>
      <span
        className="block w-full my-px border-t"
        style={{ borderColor: "var(--color-border)" }}
      />
      <span
        className="font-mono text-[9px]"
        style={{ color: "var(--color-muted)" }}
      >
        {den}
      </span>
    </span>
  );
}

export function ProtocolGuide1Q({ alpha }: ProtocolGuide1QProps) {
  const cosA = Math.cos(alpha).toFixed(3);
  const sinA = Math.sin(alpha).toFixed(3);
  const sin2A = Math.pow(Math.sin(alpha), 2).toFixed(3);

  return (
    <Card className="rounded-lg" padded="md">
      {/* ── Header ── */}
      <div className="mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-subtle)" }}
        >
          Simplified protocol · Stricker et al. (2024)
        </p>
        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>
          A classical verifier (Alice) certifies a quantum computation by
          checking the energy of the prover's (Bob) history state — without ever
          accessing his qubit.
        </p>
        {/* Legend */}
        <div className="flex gap-4 mt-2">
          {[
            { label: "ALICE — classical verifier", color: ALICE_C },
            { label: "BOB — quantum prover", color: BOB_C },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ background: color }}
              />
              <span
                className="text-[9px] uppercase tracking-widest font-semibold"
                style={{ color }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Steps ── */}
      <div className="space-y-2">
        {/* Step 1 */}
        <Step
          n={1}
          actor="ALICE"
          to="BOB"
          title="Build the Hamiltonian"
          accent={STEP_ACCENT[0]}
        >
          <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>
            Alice publicly defines{" "}
            <span style={{ color: "var(--color-foreground)" }}>
              U(α) = cos α·Z + sin α·X
            </span>{" "}
            and sends the full Hamiltonian to Bob before he prepares anything —
            commitment is key.
          </p>
          <Formula>H = Hout + 6·Hin + 3·Hprop;</Formula>
          <div className="flex flex-col gap-1 mt-1">
            {[
              {
                name: "H_out",
                num: "1",
                den: "2",
                formula: "(1 − ⟨Z₁⟩ − ⟨Z₂⟩ + ⟨Z₁Z₂⟩)",
                color: "#b7a8cf",
              },
              {
                name: "H_in",
                num: "1",
                den: "4",
                formula: "(1 − ⟨Z₁⟩ + ⟨Z₂⟩ − ⟨Z₁Z₂⟩)",
                color: "#b7a8cf",
              },
              {
                name: "H_prop",
                num: "1",
                den: "2",
                formula: "(1 − cos α·⟨Z₁X₂⟩ − sin α·⟨X₁X₂⟩)",
                color: "#a78bfa",
              },
            ].map(({ name, num, den, formula, color }) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded px-2 py-1.5"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span
                  className="text-[10px] font-semibold font-mono shrink-0 w-14"
                  style={{ color }}
                >
                  {name}
                </span>
                <span
                  className="font-mono text-[10px] inline-flex items-center"
                  style={{ color: "var(--color-foreground)" }}
                >
                  <Frac num={num} den={den} />
                  {formula}
                </span>
              </div>
            ))}
          </div>
        </Step>

        {/* Step 2 */}
        <Step
          n={2}
          actor="BOB"
          title="Prepare the history state |η(α)⟩"
          accent={STEP_ACCENT[1]}
        >
          <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>
            Bob privately prepares the 2-qubit history state that encodes the
            full computation — Alice never accesses the qubit.
            <br />
            Circuit: <Tag color="#a78bfa">H on q₀</Tag> →{" "}
            <Tag color="#a78bfa">CRY(2α) on q₁</Tag>
          </p>
          <Formula>
            |η⟩ = <span style={{ color: "#a78bfa" }}>1/√2</span> ( |00⟩ + cos
            α·|01⟩ + sin α·|11⟩ ){"\n"}
            <span style={{ color: "var(--color-subtle)", fontSize: 10 }}>
              at α = {alpha.toFixed(3)} rad → cos α = {cosA} · sin α = {sinA}
            </span>
          </Formula>
        </Step>

        {/* Step 3 */}
        <Step
          n={3}
          actor="ALICE"
          to="BOB"
          title="Challenge · measure · report"
          accent={STEP_ACCENT[2]}
        >
          <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>
            Alice randomly picks a basis <em>after</em> Bob commits to his state
            — retroactive adaptation is impossible. Bob measures and returns the
            expectation values.
          </p>
          <div className="grid grid-cols-3 gap-1">
            {[
              {
                label: "ZZ",
                basis: "no rotation",
                obs: "⟨Z₁⟩  ⟨Z₂⟩  ⟨Z₁Z₂⟩",
                c: "#d8b4fe",
              },
              { label: "ZX", basis: "H on q₀", obs: "⟨Z₁X₂⟩", c: "#34d399" },
              { label: "XX", basis: "H on both", obs: "⟨X₁X₂⟩", c: "#e8a020" },
            ].map(({ label, basis, obs, c }) => (
              <div
                key={label}
                className="rounded p-1.5 space-y-0.5"
                style={{ background: "var(--color-surface)" }}
              >
                <p className="text-[10px] font-bold" style={{ color: c }}>
                  {label} basis
                </p>
                <p
                  className="text-[9px]"
                  style={{ color: "var(--color-subtle)" }}
                >
                  {basis}
                </p>
                <p
                  className="text-[9px]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {obs}
                </p>
              </div>
            ))}
          </div>
        </Step>

        {/* Step 4 */}
        <Step
          n={4}
          actor="ALICE"
          title="Compute energy E = ⟨H⟩"
          accent={STEP_ACCENT[3]}
        >
          <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>
            Alice linearly combines the five reported expectation values — no
            quantum access required.
          </p>
          <Formula>
            E = 3.5 − 2⟨Z₂⟩ + ⟨Z₁⟩ − ⟨Z₁Z₂⟩{"\n"}
            {"    "}− 1.5·cos α·⟨Z₁X₂⟩ − 1.5·sin α·⟨X₁X₂⟩
          </Formula>
          <p className="text-[10px]" style={{ color: "var(--color-subtle)" }}>
            Ideal (noiseless): E = sin²α ={" "}
            <span style={{ color: "#34d399" }}>{sin2A}</span> at current α.
          </p>
        </Step>

        {/* Step 5 */}
        <Step n={5} actor="ALICE" title="Verdict" accent={STEP_ACCENT[4]}>
          <div className="grid grid-cols-3 gap-1">
            <div
              className="p-2 text-center rounded"
              style={{
                background: "rgba(52,211,153,0.12)",
                border: "1px solid #34d399",
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: "#34d399" }}>
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
              className="p-2 text-center rounded"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: "#f59e0b" }}>
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
              className="p-2 text-center rounded"
              style={{
                background: "rgba(248,113,113,0.12)",
                border: "1px solid #f87171",
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: "#f87171" }}>
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
            <span style={{ color: "#f87171" }}>E = 1.5</span> — always rejected.
            Honest quantum prover at α ≤ α_c ≈ 0.685 rad: always accepted.
          </p>
        </Step>
      </div>
    </Card>
  );
}
