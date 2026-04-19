/**
 * ProbBars.tsx — Probability bars for 4 basis states.
 * Shows |00⟩, |01⟩, |10⟩, |11⟩ as labelled horizontal bars.
 */

interface Props {
  counts: Record<string, number>;
  shots: number;
  accentColor?: string;
}

const STATE_ORDER = ["00", "10", "11", "01"] as const;

export function ProbBars({ counts, shots, accentColor = "#a78bfa" }: Props) {
  const safeShots = Math.max(1, shots);
  return (
    <div className="space-y-2">
      {STATE_ORDER.map((state) => {
        const count = counts[state] ?? 0;
        const pct = (count / safeShots) * 100;
        return (
          <div key={state} className="flex items-center gap-3">
            <span
              className="w-8 shrink-0 font-mono text-[11px]"
              style={{ color: "#9490a8" }}
            >
              |{state}⟩
            </span>
            <div
              className="relative h-4 flex-1 overflow-hidden rounded-full"
              style={{ background: "#2d2b3a" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: accentColor }}
              />
            </div>
            <span
              className="w-12 shrink-0 text-right font-mono text-[11px]"
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
