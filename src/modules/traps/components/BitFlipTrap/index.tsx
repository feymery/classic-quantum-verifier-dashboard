/**
 * BitFlipTrap — Trap 3: Bit-Flip Error
 *
 * Simplified view: sliders + 3 representative charts.
 */

import { useState, useMemo } from "react";
import {
  computeIdealDistribution,
  computeNoisyDistribution,
  computeObservables,
  computePCrit,
  derivedTarget,
} from "./BitFlipTrap.physics";
import { DEFAULT_P, DEFAULT_SHOTS_OPTION } from "./BitFlipTrap.constants";
import type { ShotsOption } from "./BitFlipTrap.constants";
import { DualPSlider } from "./components/DualPSlider";
import { ShotsSelector } from "./components/ShotsSelector";
import { ObservableComparison } from "./components/ObservableComparison";
import { BitFlipEnergyVsP } from "./components/BitFlipEnergyVsP";
import { ProbBars } from "../ProbBars";
import { DistributionCompare } from "../../shared/DistributionCompare";
import { HONEST_COLOR, TRAP_COLOR } from "../../shared/trapShared.constants";

interface Props {
  alpha: number;
}

export function BitFlipTrap({ alpha }: Props) {
  const [pClock, setPClock] = useState(DEFAULT_P);
  const [pWork, setPWork] = useState(0);
  const [shots, setShots] = useState<ShotsOption>(DEFAULT_SHOTS_OPTION);

  const target = useMemo(() => derivedTarget(pClock, pWork), [pClock, pWork]);
  const pActive = target === "work" ? pWork : pClock;
  const pCritClock = computePCrit(alpha, "clock") ?? 0.5;
  const pCritWork = computePCrit(alpha, "work") ?? 0.5;

  const idealDist = useMemo(() => computeIdealDistribution(alpha), [alpha]);
  const noisyDist = useMemo(
    () => computeNoisyDistribution(alpha, pActive, target),
    [alpha, pActive, target],
  );
  const obs = useMemo(
    () => computeObservables(alpha, pClock, pWork),
    [alpha, pClock, pWork],
  );

  const idealCounts = Object.fromEntries(
    Object.entries(idealDist).map(([k, v]) => [k, Math.round(v * shots)]),
  );
  const noisyCounts = Object.fromEntries(
    Object.entries(noisyDist).map(([k, v]) => [k, Math.round(v * shots)]),
  );

  const targetLabel: Record<typeof target, string> = {
    clock: "Bit-flip on clock",
    work: "Bit-flip on work",
    both: "Bit-flip on both",
  };

  return (
    <div className="p-5 border rounded-lg border-border bg-canvas">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
          Trap 3
        </span>
        <h2 className="text-[14px] font-semibold text-foreground">
          Bit-Flip Error
        </h2>
      </div>

      {/* ── Controls ── */}
      <div className="mb-5 flex flex-col gap-4">
        <p className="text-[12px] leading-relaxed text-muted">
          A bit-flip channel applies an accidental{" "}
          <span className="font-mono text-foreground">X</span> gate with
          probability <span className="font-mono text-foreground">p</span>,
          disrupting Z-basis coherence. Set independent flip probabilities on
          the{" "}
          <span className="font-mono" style={{ color: "#a78bfa" }}>
            clock
          </span>{" "}
          and{" "}
          <span className="font-mono" style={{ color: "#f59e0b" }}>
            work
          </span>{" "}
          qubits.
        </p>
        <DualPSlider
          pClock={pClock}
          setPClock={setPClock}
          pWork={pWork}
          setPWork={setPWork}
          pCritClock={pCritClock}
          pCritWork={pCritWork}
        />
        <ShotsSelector shots={shots} onChange={setShots} />
      </div>

      {/* ── Charts (3 representative) ── */}
      <div className="flex flex-col gap-5">
        {/* Chart 1: ideal vs noisy distribution */}
        <DistributionCompare
          label="theoretical distribution"
          honestLabel="Honest |η(α)⟩"
          trapLabel={targetLabel[target]}
          isTrap={pActive > 0}
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
              accentColor={pActive > 0 ? TRAP_COLOR : HONEST_COLOR}
            />
          }
        />

        {/* Chart 2: observable contraction */}
        <ObservableComparison alpha={alpha} obs={obs} p={pActive} />

        {/* Chart 3: ⟨E⟩ vs p with p_crit markers */}
        <div className="rounded-md border border-border bg-canvas p-4">
          <BitFlipEnergyVsP alpha={alpha} pClock={pClock} pWork={pWork} />
        </div>
      </div>
    </div>
  );
}

export default BitFlipTrap;
