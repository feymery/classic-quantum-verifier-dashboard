/**
 * DepolarizingTrap — Trap 2: Depolarizing Noise
 *
 * Key insight: depolarizing noise at rate λ contracts EVERY two-qubit
 * correlator by the same factor (1−λ)², shrinking ⟨Z₁X₂⟩, ⟨X₁X₂⟩, ⟨Z₁Z₂⟩
 * uniformly until the raised energy crosses the acceptance threshold at λ_crit.
 */

import { useState, useMemo } from "react";
import {
  computeENoisy,
  lambdaCritExact,
  noisyColor,
} from "./DepolarizingTrap.physics";
import type { DepolarizingTrapProps } from "./DepolarizingTrap.types";
import { LambdaSlider } from "./components/LambdaSlider";
import { ThresholdStatusBox } from "./components/ThresholdStatusBox";
import { EnergyVsLambdaChart } from "./components/EnergyVsLambdaChart";

export function DepolarizingTrap({
  alpha = 9 * (Math.PI / 180), // 9° — Stricker et al. reference operating point
  lambda: lambdaProp = 0.05,
}: DepolarizingTrapProps) {
  const [lam, setLam] = useState(lambdaProp);

  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);
  const lam2 = (1 - lam) ** 2;

  const obs = useMemo(
    () => ({
      Z1X2_noisy: lam2 * cosA,
      X1X2_noisy: lam2 * sinA,
      Z1Z2_noisy: lam2 * sinA ** 2,
      E_noisy: computeENoisy(alpha, lam),
      E_ideal: sinA ** 2,
    }),
    [alpha, lam, lam2, cosA, sinA],
  );

  const lcrit = lambdaCritExact(alpha);
  const aboveCrit = lam > lcrit;
  const lineColor = noisyColor(lam);

  const contractionRows = [
    { label: "⟨Z₁X₂⟩", ideal: cosA, noisy: obs.Z1X2_noisy },
    { label: "⟨X₁X₂⟩", ideal: sinA, noisy: obs.X1X2_noisy },
    { label: "⟨Z₁Z₂⟩", ideal: sinA ** 2, noisy: obs.Z1Z2_noisy },
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
            Noise at rate λ multiplies every two-qubit correlator by the{" "}
            <span className="font-semibold text-foreground">same</span> factor{" "}
            <span className="font-mono text-foreground">(1−λ)²</span> — the bars
            below show each observable fading uniformly as λ increases, until
            the raised energy crosses{" "}
            <span className="font-mono text-foreground">λ_crit</span>.
          </p>

          <LambdaSlider
            lam={lam}
            setLam={setLam}
            lineColor={lineColor}
            lcrit={lcrit}
            alpha={alpha}
            aboveCrit={aboveCrit}
          />

          {/* ── Observable contraction bars ── */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Contraction factor&nbsp;
              <span className="font-mono normal-case text-foreground">
                (1−λ)² = {lam2.toFixed(4)}
              </span>
            </p>
            {contractionRows.map(({ label, ideal, noisy }) => {
              const fraction = ideal > 0 ? Math.abs(noisy / ideal) : 0;
              return (
                <div
                  key={label}
                  className="px-2 py-1.5 border rounded-md border-border bg-elevated"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-mono text-[11px] font-semibold text-foreground">
                      {label}
                    </span>
                    <span className="font-mono text-[10px]">
                      <span style={{ color: lineColor }}>
                        {noisy.toFixed(4)}
                      </span>
                      <span className="text-subtle"> / {ideal.toFixed(4)}</span>
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-border/40">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${fraction * 100}%`,
                        background: lineColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════ */}
        <div className="flex flex-col gap-4">
          <EnergyVsLambdaChart
            alpha={alpha}
            lam={lam}
            lcrit={lcrit}
            lineColor={lineColor}
          />
          <ThresholdStatusBox
            lam={lam}
            lcrit={lcrit}
            alpha={alpha}
            aboveCrit={aboveCrit}
            obs={obs}
            lineColor={lineColor}
          />
        </div>
      </div>
    </>
  );
}

export default DepolarizingTrap;
