/**
 * BitFlipTrap — Trap 3: Bit-Flip Error
 *
 * Simplified view: sliders + observable attenuation bars + E vs p chart.
 */

import { useState, useMemo } from "react";
import { computeObservables, computePCrit } from "./BitFlipTrap.physics";
import { DEFAULT_P } from "./BitFlipTrap.constants";
import { DualPSlider } from "./components/DualPSlider";
import { BitFlipEnergyVsP } from "./components/BitFlipEnergyVsP";

interface Props {
  alpha: number;
}

/** Bar / value color for clock-sensitive observables. */
function clockColor(p: number) {
  if (p > 0.25) return "var(--color-danger)";
  if (p > 0.1) return "var(--color-warning)";
  return "#a78bfa";
}
/** Bar / value color for work-sensitive observables. */
function workColor(p: number) {
  if (p > 0.25) return "var(--color-danger)";
  return "#f59e0b";
}

export function BitFlipTrap({ alpha }: Props) {
  const [pClock, setPClock] = useState(DEFAULT_P);
  const [pWork, setPWork] = useState(0);

  const pCritClock = computePCrit(alpha, "clock") ?? 0.5;
  const pCritWork = computePCrit(alpha, "work") ?? 0.5;

  const obs = useMemo(
    () => computeObservables(alpha, pClock, pWork),
    [alpha, pClock, pWork],
  );

  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);

  const attenuationRows = [
    {
      label: "⟨Z₁X₂⟩",
      ideal: cosA,
      noisy: obs.Z1X2,
      tag: "p_c · p_w",
      color: clockColor(Math.max(pClock, pWork)),
    },
    {
      label: "⟨X₁X₂⟩",
      ideal: sinA,
      noisy: obs.X1X2,
      tag: "p_w only",
      color: workColor(pWork),
    },
    {
      label: "⟨Z₁Z₂⟩",
      ideal: sinA ** 2,
      noisy: obs.Z1Z2,
      tag: "p_c only",
      color: clockColor(pClock),
    },
  ];

  return (
    <>
      {/* ── Two-column body ── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "minmax(0,45fr) minmax(0,55fr)" }}
      >
        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div className="flex flex-col gap-4">
          <p className="text-[12px] leading-relaxed text-muted">
            Flipping the <span className="font-mono text-accent">clock</span>{" "}
            qubit is more damaging than the{" "}
            <span className="font-mono text-warning">work</span> qubit — a
            work-only flip{" "}
            <span className="font-semibold text-foreground">never</span>{" "}
            triggers rejection.
          </p>

          <DualPSlider
            pClock={pClock}
            setPClock={setPClock}
            pWork={pWork}
            setPWork={setPWork}
            pCritClock={pCritClock}
            pCritWork={pCritWork}
          />

          {/* ── Observable attenuation bars ── */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Observable attenuation
            </p>
            {attenuationRows.map(({ label, ideal, noisy, tag, color }) => {
              const fraction = ideal > 0 ? Math.abs(noisy / ideal) : 0;
              return (
                <div
                  key={label}
                  className="px-2 py-1.5 border rounded-md border-border bg-elevated"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[11px] font-semibold text-foreground">
                        {label}
                      </span>
                      <span className="font-mono text-[9px] text-subtle">
                        ∝ {tag}
                      </span>
                    </div>
                    <span className="font-mono text-[10px]">
                      <span style={{ color }}>{noisy.toFixed(4)}</span>
                      <span className="text-subtle"> / {ideal.toFixed(4)}</span>
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-border/40">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ width: `${fraction * 100}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════ */}
        <div className="p-4 border rounded-md border-border bg-canvas">
          <BitFlipEnergyVsP alpha={alpha} pClock={pClock} pWork={pWork} />
        </div>
      </div>
    </>
  );
}

export default BitFlipTrap;
