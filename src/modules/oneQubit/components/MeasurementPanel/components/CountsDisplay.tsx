import type { Counts } from "../../../physics/measurements";

interface CountsDisplayProps {
  counts: Counts | null;
  shots: number;
  loading: boolean;
}

const BASIS_LABELS: { key: string; color: string }[] = [
  { key: "00", color: "#a78bfa" },
  { key: "01", color: "#9490a8" },
  { key: "10", color: "#a78bfa" },
  { key: "11", color: "#34d399" },
];

export function CountsDisplay({ counts, shots, loading }: CountsDisplayProps) {
  const maxCount = counts ? Math.max(1, ...Object.values(counts)) : 1;

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className=" text-[10px]" style={{ color: "#6b6780" }}>
          computational basis counts
        </span>
        <span className=" text-[10px]" style={{ color: "#6b6780" }}>
          little-endian · {shots} shots
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-1">
        {BASIS_LABELS.map(({ key, color }) => {
          const count = counts?.[key] ?? 0;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const freq = shots > 0 ? count / shots : 0;

          return (
            <div
              key={key}
              className="flex items-center gap-2"
              aria-label={`State |${key}⟩: ${count} counts (${shots > 0 ? ((count / shots) * 100).toFixed(1) : "0.0"}%)`}
            >
              {/* State label */}
              <span
                className=" text-[11px] w-5 text-center shrink-0"
                style={{ color }}
              >
                {key}
              </span>

              {/* Bar track */}
              <div
                className="flex-1 h-3 rounded-sm"
                style={{ background: "#2d2b3a" }}
              >
                {!loading && counts && (
                  <div
                    className="h-full transition-all duration-500 rounded-sm"
                    style={{
                      width: `${pct}%`,
                      background: `${color}55`,
                      borderRight: `2px solid ${color}`,
                      minWidth: count > 0 ? 2 : 0,
                    }}
                  />
                )}
              </div>

              {/* Count + frequency */}
              <div className="flex items-center gap-1.5 w-24 justify-end shrink-0">
                {loading ? (
                  <span className=" text-[10px]" style={{ color: "#6b6780" }}>
                    ···
                  </span>
                ) : (
                  <>
                    <span
                      className=" text-[11px] tabular-nums"
                      style={{ color }}
                    >
                      {count}
                    </span>
                    <span
                      className=" text-[10px] tabular-nums"
                      style={{ color: "#6b6780" }}
                    >
                      ({(freq * 100).toFixed(1)}%)
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend note */}
      <p
        className=" text-[9px] leading-relaxed pt-1"
        style={{ color: "#6b6780" }}
      >
        qubit 0 = clock (left digit) · qubit 1 = work (right digit)
      </p>
    </div>
  );
}
