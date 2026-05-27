/**
 * ClockStepBars.tsx
 * Horizontal probability bars for 3 clock steps (t=0, t=1, t=2).
 * Optionally renders a reference tick at 1/3 (the honest uniform probability).
 */

import { HONEST_COLOR } from "./trapShared.constants";

interface Props {
  /** Probability weights for [t=0, t=1, t=2]. Values in [0, 1]. */
  weights: [number, number, number];
  shots: number;
  color: string;
  /** When true, renders a vertical tick at the 1/3 mark. */
  showRef?: boolean;
}

const STEPS = ["t0", "t1", "t2"] as const;
const LABELS: Record<string, string> = { t0: "t=0", t1: "t=1", t2: "t=2" };

export function ClockStepBars({ weights, shots, color, showRef }: Props) {
  const safeShots = Math.max(1, shots);
  const counts: Record<string, number> = {
    t0: Math.round(weights[0] * shots),
    t1: Math.round(weights[1] * shots),
    t2: Math.round(weights[2] * shots),
  };

  return (
    <div className="space-y-2">
      {STEPS.map((s, i) => {
        const pct = (counts[s] / safeShots) * 100;
        const refPct = (1 / 3) * 100;
        return (
          <div key={s} className="flex items-center gap-3">
            <span className="w-8 shrink-0 text-[11px] text-muted">
              {LABELS[s]}
            </span>
            <div className="relative h-4 flex-1 overflow-hidden rounded-lg bg-border">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
              {showRef && (
                <div
                  className="absolute top-0 h-full w-px opacity-60"
                  style={{ left: `${refPct}%`, background: HONEST_COLOR }}
                />
              )}
            </div>
            <span className="w-12 shrink-0 text-right text-[11px] text-foreground">
              {pct.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
