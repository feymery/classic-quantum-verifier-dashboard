/**
 * ClockDistributionBars.tsx
 * ProbBars wrapper showing honest vs trap clock-step distributions
 * with a reference line at 1/3 (uniform / honest probability).
 */

import { ProbBars } from "../ProbBars";
import { HONEST_COLOR, TRAP_COLOR } from "./BiasedAmplitudesTrap.types";

interface Props {
  /** Trap step probabilities [t=0, t=1, t=2]. */
  trapWeights: [number, number, number];
  shots: number;
  /** When true, overlays noisy (shot-perturbed) bars on the trap side. */
  showNoise?: boolean;
}

function stepToCounts(
  weights: [number, number, number],
  shots: number,
): Record<string, number> {
  return {
    t0: Math.round(weights[0] * shots),
    t1: Math.round(weights[1] * shots),
    t2: Math.round(weights[2] * shots),
  };
}

function StepBars({
  counts,
  shots,
  color,
}: {
  counts: Record<string, number>;
  shots: number;
  color: string;
}) {
  const states = ["t0", "t1", "t2"] as const;
  const labels: Record<string, string> = { t0: "t=0", t1: "t=1", t2: "t=2" };
  const safeShots = Math.max(1, shots);
  return (
    <div className="space-y-2">
      {states.map((s) => {
        const pct = ((counts[s] ?? 0) / safeShots) * 100;
        const refPct = (1 / 3) * 100;
        return (
          <div key={s} className="flex items-center gap-3">
            <span
              className="w-8 shrink-0 text-[11px]"
              style={{ color: "#9490a8" }}
            >
              {labels[s]}
            </span>
            <div
              className="relative h-4 flex-1 overflow-hidden rounded-lg"
              style={{ background: "#2d2b3a" }}
            >
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
              {/* 1/3 reference tick */}
              <div
                className="absolute top-0 h-full w-px opacity-60"
                style={{ left: `${refPct}%`, background: HONEST_COLOR }}
              />
            </div>
            <span
              className="w-12 shrink-0 text-right text-[11px]"
              style={{ color: "#ddd9ee" }}
            >
              {pct.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ClockDistributionBars({ trapWeights, shots }: Props) {
  const honestWeights: [number, number, number] = [1 / 3, 1 / 3, 1 / 3];
  const honestCounts = stepToCounts(honestWeights, shots);
  const trapCounts = stepToCounts(trapWeights, shots);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p
          className="mb-2 text-[11px] font-medium"
          style={{ color: HONEST_COLOR }}
        >
          Honest — uniform (1/3 each)
        </p>
        <StepBars counts={honestCounts} shots={shots} color={HONEST_COLOR} />
      </div>
      <div>
        <p
          className="mb-2 text-[11px] font-medium"
          style={{ color: TRAP_COLOR }}
        >
          Trap — biased amplitudes
        </p>
        <StepBars counts={trapCounts} shots={shots} color={TRAP_COLOR} />
        <p className="mt-1.5 text-[10px]" style={{ color: "#6b6780" }}>
          ╎ green tick = honest reference (1/3)
        </p>
      </div>
    </div>
  );
}
