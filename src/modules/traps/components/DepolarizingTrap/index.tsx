/**
 * DepolarizingTrap — Trap 2: Depolarizing Noise
 *
 * Visualises how single-qubit depolarizing noise (parameter λ) contracts
 * Pauli observables and raises the Hamiltonian energy, eventually preventing
 * verification in the Stricker et al. 2024 protocol.
 *
 * State is managed here; layout and presentation are delegated to sub-components.
 */

import { useState, useMemo } from "react";
import {
  computeENoisy,
  lambdaCritApprox,
  buildEnergyData,
  noisyColor,
} from "./DepolarizingTrap.physics";
import type { DepolarizingTrapProps } from "./DepolarizingTrap.types";
import { LambdaSlider } from "./components/LambdaSlider";
import { ObservableTable } from "./components/ObservableTable";
import { ThresholdStatusBox } from "./components/ThresholdStatusBox";
import { EnergyVsAlphaChart } from "./components/EnergyVsAlphaChart";
import { ContractionChart } from "./components/ContractionChart";
import { DetectionSignatureBox } from "./components/DetectionSignatureBox";

export function DepolarizingTrap({
  alpha = 0.2,
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

  const lcrit = lambdaCritApprox(alpha);
  const aboveCrit = lam > lcrit;
  const lineColor = noisyColor(lam);
  const energyData = useMemo(() => buildEnergyData(lam), [lam]);

  return (
    <div className="rounded-lg border border-border bg-canvas p-5">
      {/* ── Header ── */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
          Trap 2
        </span>
        <h2 className="text-[14px] font-semibold text-foreground">
          Depolarizing Noise
        </h2>
      </div>

      {/* ── Two-column body ── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "minmax(0,50fr) minmax(0,50fr)" }}
      >
        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div className="flex flex-col gap-5">
          {/* Description */}
          <p className="text-[12px] leading-relaxed text-muted">
            The prover is honest but noisy. Each qubit passes through a
            depolarizing channel with rate λ, contracting every single-qubit
            Pauli observable by{" "}
            <span className="font-mono text-foreground">(1−λ)</span> and every
            two-qubit correlator by{" "}
            <span className="font-mono text-foreground">(1−λ)²</span>. The
            propagation term H_prop acquires a noise floor{" "}
            <span className="font-mono text-foreground">½(1−(1−λ)²)</span>{" "}
            independent of α — raising energy even for an honest prover.
          </p>

          <LambdaSlider
            lam={lam}
            setLam={setLam}
            lineColor={lineColor}
            lcrit={lcrit}
            alpha={alpha}
            aboveCrit={aboveCrit}
          />

          <ObservableTable alpha={alpha} obs={obs} lineColor={lineColor} />

          <ThresholdStatusBox
            lam={lam}
            lcrit={lcrit}
            alpha={alpha}
            aboveCrit={aboveCrit}
          />
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════ */}
        <div className="flex flex-col gap-4">
          <EnergyVsAlphaChart
            alpha={alpha}
            lam={lam}
            lineColor={lineColor}
            energyData={energyData}
          />

          <ContractionChart lam={lam} lcrit={lcrit} lineColor={lineColor} />

          <DetectionSignatureBox
            alpha={alpha}
            lam={lam}
            lineColor={lineColor}
            obs={obs}
          />
        </div>
      </div>
    </div>
  );
}

export default DepolarizingTrap;
