/**
 * BitFlipTrap — Trap 3: Bit-Flip Error
 *
 * Demonstrates how an accidental X-gate error (bit-flip) on the clock qubit,
 * the work qubit, or both disrupts the Z-basis measurement distribution and
 * raises the Hamiltonian energy, eventually triggering rejection by the verifier.
 *
 * The user can tune the error probability p and the measurement shot count to
 * observe both the systematic bias and the statistical variance of the estimate.
 */

import { useState, useMemo } from "react";
import {
  computeIdealDistribution,
  computeNoisyDistribution,
  computeObservables,
} from "./BitFlipTrap.physics";
import { DEFAULT_P, DEFAULT_SHOTS_OPTION } from "./BitFlipTrap.constants";
import type { FlipTarget } from "./BitFlipTrap.types";
import type { ShotsOption } from "./BitFlipTrap.constants";
import { FlipTargetSelector } from "./components/FlipTargetSelector";
import { ProbabilitySlider } from "./components/ProbabilitySlider";
import { ShotsSelector } from "./components/ShotsSelector";
import { ObservableComparison } from "./components/ObservableComparison";
import { DetectionSignatureBox } from "./components/DetectionSignatureBox";
import { ShotsVarianceSection } from "./components/ShotsVarianceSection";
import { BitFlipStateEquations } from "./components/BitFlipStateEquations";
import { BitFlipMetricsPanel } from "./components/BitFlipMetricsPanel";
import { ProbBars } from "../ProbBars";
import { DistributionCompare } from "../../shared/DistributionCompare";
import { HONEST_COLOR, TRAP_COLOR } from "../../shared/trapShared.constants";

interface Props {
  alpha: number;
}

export function BitFlipTrap({ alpha }: Props) {
  const [target, setTarget] = useState<FlipTarget>("clock");
  const [p, setP] = useState(DEFAULT_P);
  const [shots, setShots] = useState<ShotsOption>(DEFAULT_SHOTS_OPTION);

  const idealDist = useMemo(() => computeIdealDistribution(alpha), [alpha]);
  const noisyDist = useMemo(
    () => computeNoisyDistribution(alpha, p, target),
    [alpha, p, target],
  );
  const obs = useMemo(
    () => computeObservables(alpha, p, target),
    [alpha, p, target],
  );

  const idealCounts = Object.fromEntries(
    Object.entries(idealDist).map(([k, v]) => [k, Math.round(v * shots)]),
  );
  const noisyCounts = Object.fromEntries(
    Object.entries(noisyDist).map(([k, v]) => [k, Math.round(v * shots)]),
  );

  const targetLabel: Record<FlipTarget, string> = {
    clock: "Bit-flip on clock",
    work: "Bit-flip on work",
    both: "Bit-flip on both",
  };

  return (
    <div className="rounded-lg border border-border bg-canvas p-5">
      {/* ── Header ── */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
          Trap 3
        </span>
        <h2 className="text-[14px] font-semibold text-foreground">
          Bit-Flip Error
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
            A bit-flip error applies an accidental{" "}
            <span className="font-mono text-foreground">X</span> gate to a qubit
            with probability{" "}
            <span className="font-mono text-foreground">p</span>. On the{" "}
            <span className="font-mono text-foreground">clock</span> qubit it
            swaps the roles of{" "}
            <span className="font-mono text-foreground">|0⟩</span> and{" "}
            <span className="font-mono text-foreground">|1⟩</span>, redirecting
            part of the population into{" "}
            <span className="font-mono text-foreground">|10⟩</span> and{" "}
            <span className="font-mono text-foreground">|01⟩</span>. On the{" "}
            <span className="font-mono text-foreground">work</span> qubit the
            same disruption appears but in the opposite columns. When{" "}
            <span className="font-mono text-foreground">both</span> qubits are
            affected independently, cross-terms mix all four basis states. In
            every case the Pauli correlators are attenuated by{" "}
            <span className="font-mono text-foreground">(1−2p)</span> per
            affected qubit, raising the Hamiltonian energy above the acceptance
            threshold.
          </p>

          <FlipTargetSelector target={target} onChange={setTarget} />
          <BitFlipStateEquations alpha={alpha} p={p} target={target} />
          <ProbabilitySlider p={p} setP={setP} />
          <ShotsSelector shots={shots} onChange={setShots} />
          <ObservableComparison alpha={alpha} obs={obs} p={p} />
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════ */}
        <div className="flex flex-col gap-5">
          {/* Theoretical distribution: ideal vs noisy */}
          <DistributionCompare
            label="theoretical distribution"
            honestLabel="Honest |η(α)⟩"
            trapLabel={targetLabel[target]}
            isTrap={p > 0}
            honestBars={
              <ProbBars
                counts={idealCounts}
                shots={shots}
                accentColor={HONEST_COLOR}
              />
            }
            trapBars={
              <ProbBars
                counts={noisyCounts}
                shots={shots}
                accentColor={p > 0 ? TRAP_COLOR : HONEST_COLOR}
              />
            }
          />

          <DetectionSignatureBox obs={obs} p={p} />

          <ShotsVarianceSection noisyDist={noisyDist} shots={shots} />
        </div>
      </div>

      {/* ── Metrics panel ── */}
      <BitFlipMetricsPanel alpha={alpha} p={p} shots={shots} target={target} />
    </div>
  );
}

export default BitFlipTrap;
