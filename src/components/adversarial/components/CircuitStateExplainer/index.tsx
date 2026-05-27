/**
 * CircuitStateExplainer — "How the circuit works" educational block.
 *
 * Sits at the top of the Traps page to establish the ideal final state
 * before the trap scenarios are introduced. Shows the state equation,
 * role of each qubit, ideal measurement distribution, and how
 * bit-flip errors disrupt that distribution.
 */

import { useMemo } from "react";
import { SectionLabel } from "../../shared/SectionLabel";
import { ProbBars } from "../ProbBars";

interface Props {
  alpha: number;
}

export function CircuitStateExplainer({ alpha }: Props) {
  const cos2 = Math.cos(alpha) ** 2;
  const sin2 = Math.sin(alpha) ** 2;

  // Theoretical probabilities for the ideal state
  const idealDist = useMemo(
    () => ({
      "00": 0.5,
      "10": cos2 / 2,
      "11": sin2 / 2,
      "01": 0,
    }),
    [cos2, sin2],
  );

  // Render as counts (out of 1000 for display purposes)
  const DISPLAY_SHOTS = 1000;
  const idealCounts = Object.fromEntries(
    Object.entries(idealDist).map(([k, v]) => [
      k,
      Math.round(v * DISPLAY_SHOTS),
    ]),
  );

  return (
    <div className="rounded-lg border-2 border-border bg-canvas p-5">
      {/* ── Header ── */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
          Circuit
        </span>
        <h2 className="text-[14px] font-semibold text-foreground">
          Ideal Final State
        </h2>
      </div>

      {/* ── Two-column body ── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "minmax(0,55fr) minmax(0,45fr)" }}
      >
        {/* ══ LEFT: explanation ══ */}
        <div className="flex flex-col gap-5">
          {/* Circuit summary */}
          <p className="text-[12px] leading-relaxed text-muted">
            Our circuit uses two qubits:{" "}
            <span className="font-medium text-foreground">clock</span> and{" "}
            <span className="font-medium text-foreground">work</span>. A
            Hadamard gate is applied to the clock qubit, placing it in a
            superposition of{" "}
            <span className="font-mono text-foreground">|0⟩</span> ("no
            evolution") and{" "}
            <span className="font-mono text-foreground">|1⟩</span> ("evolve").
            Then a controlled{" "}
            <span className="font-mono text-foreground">U(α)</span> gate acts on
            the work qubit only when the clock is{" "}
            <span className="font-mono text-foreground">|1⟩</span>, encoding the
            preparation angle α into the work qubit's state.
          </p>

          {/* State equation box */}
          <div>
            <SectionLabel>Final state</SectionLabel>
            <div
              className="rounded-lg border px-4 py-3 font-mono text-[11px] leading-loose"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-elevated)",
                color: "var(--color-muted)",
              }}
            >
              <div>
                <span style={{ color: "var(--color-foreground)" }}>|ψ⟩</span>
                {" = "}
                <span style={{ color: "var(--color-subtle)" }}>1/√2</span>
                {" ( "}
                <span style={{ color: "var(--color-foreground)" }}>|00⟩</span>
                {" + "}
                <span style={{ color: "var(--color-accent)" }}>
                  cos(α)
                </span>{" "}
                <span style={{ color: "var(--color-foreground)" }}>|10⟩</span>
                {" + "}
                <span style={{ color: "var(--color-success)" }}>
                  sin(α)
                </span>{" "}
                <span style={{ color: "var(--color-foreground)" }}>|11⟩</span>
                {" )"}
              </div>
              <div
                className="mt-2 border-t pt-2 text-[10px]"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex gap-4">
                  <span>
                    P(00) ={" "}
                    <span style={{ color: "var(--color-foreground)" }}>
                      1/2
                    </span>
                  </span>
                  <span>
                    P(10) ={" "}
                    <span style={{ color: "var(--color-accent)" }}>
                      cos²(α)/2 = {(cos2 / 2).toFixed(3)}
                    </span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span>
                    P(11) ={" "}
                    <span style={{ color: "var(--color-success)" }}>
                      sin²(α)/2 = {(sin2 / 2).toFixed(3)}
                    </span>
                  </span>
                  <span>
                    P(01) ={" "}
                    <span style={{ color: "var(--color-foreground)" }}>0</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Qubit roles */}
          <div>
            <SectionLabel>Qubit roles</SectionLabel>
            <div className="flex flex-col gap-2">
              <div
                className="flex gap-3 rounded-md border px-3 py-2.5 text-[12px]"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-elevated)",
                }}
              >
                <span className="mt-0.5 shrink-0 font-mono text-[10px] font-bold text-accent">
                  CLOCK
                </span>
                <span className="leading-relaxed text-muted">
                  The Hadamard creates a superposition between "no evolution" (
                  <span className="font-mono text-foreground">|0⟩</span>) and
                  "evolve" (
                  <span className="font-mono text-foreground">|1⟩</span>). It
                  controls whether the work qubit is transformed.
                </span>
              </div>
              <div
                className="flex gap-3 rounded-md border px-3 py-2.5 text-[12px]"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-elevated)",
                }}
              >
                <span className="mt-0.5 shrink-0 font-mono text-[10px] font-bold text-success">
                  WORK
                </span>
                <span className="leading-relaxed text-muted">
                  Starts in{" "}
                  <span className="font-mono text-foreground">|0⟩</span>. Only
                  rotated by{" "}
                  <span className="font-mono text-foreground">U(α)</span> when
                  the clock is{" "}
                  <span className="font-mono text-foreground">|1⟩</span>,
                  encoding the angle α as{" "}
                  <span className="font-mono text-foreground">
                    cos(α)|0⟩ + sin(α)|1⟩
                  </span>
                  .
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT: ideal distribution ══ */}
        <div className="flex flex-col gap-5">
          <div>
            <SectionLabel>ideal measurement distribution (exact)</SectionLabel>
            <p className="mb-3 text-[11px] leading-relaxed text-muted">
              At the current α ={" "}
              <span className="font-mono text-foreground">
                {alpha.toFixed(3)} rad
              </span>
              , measuring in the Z-basis produces the following probabilities.
              The state <span className="font-mono text-foreground">|01⟩</span>{" "}
              never appears — detecting it experimentally is a direct sign of
              error.
            </p>
            <ProbBars
              counts={idealCounts}
              shots={DISPLAY_SHOTS}
              accentColor="var(--color-success)"
            />
          </div>

          <div>
            <SectionLabel>what to look for</SectionLabel>
            <div className="flex flex-col gap-1.5 text-[11px]">
              {[
                {
                  state: "|00⟩",
                  prob: "50%",
                  note: "clock stayed in |0⟩ — work untouched",
                  color: "var(--color-foreground)",
                },
                {
                  state: "|10⟩",
                  prob: `${((cos2 / 2) * 100).toFixed(1)}%`,
                  note: "clock evolved, work → |0⟩ via cos(α)",
                  color: "var(--color-accent)",
                },
                {
                  state: "|11⟩",
                  prob: `${((sin2 / 2) * 100).toFixed(1)}%`,
                  note: "clock evolved, work → |1⟩ via sin(α)",
                  color: "var(--color-success)",
                },
                {
                  state: "|01⟩",
                  prob: "0%",
                  note: "impossible without error",
                  color: "var(--color-danger)",
                },
              ].map(({ state, prob, note, color }) => (
                <div
                  key={state}
                  className="flex items-start gap-2 rounded-md px-3 py-2"
                  style={{ background: "var(--color-elevated)" }}
                >
                  <span
                    className="shrink-0 font-mono text-[11px] font-semibold"
                    style={{ color }}
                  >
                    {state}
                  </span>
                  <span className="text-muted">
                    <span className="font-mono font-semibold text-foreground">
                      {prob}
                    </span>{" "}
                    — {note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
