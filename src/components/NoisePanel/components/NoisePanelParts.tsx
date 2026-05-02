interface StatCellProps {
  label: string;
  value: string;
  color: string;
}

interface CritLambdaRowProps {
  label: string;
  value: number | null;
  threshold: string;
  color: string;
  current: number;
}

interface LegendDotProps {
  color: string;
  label: string;
  dashed?: boolean;
}

export function StatCell({ label, value, color }: StatCellProps) {
  return (
    <div className="p-2.5" style={{ background: "#181620" }}>
      <div className=" text-[9px] mb-1" style={{ color: "#6b6780" }}>
        {label}
      </div>
      <div className=" text-[13px] font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export function CritLambdaRow({
  label,
  value,
  threshold,
  color,
  current,
}: CritLambdaRowProps) {
  const reached = value !== null && current >= value;
  return (
    <div
      className="flex items-center justify-between rounded px-2.5 py-1.5"
      style={{
        background: reached ? `${color}10` : "#181620",
        borderLeft: `2px solid ${reached ? color : "#2d2b3a"}`,
      }}
    >
      <span className=" text-[10px]" style={{ color: "#9490a8" }}>
        {label}
      </span>
      <span className=" text-[11px]" style={{ color }}>
        {value !== null
          ? `λ = ${value.toFixed(3)}`
          : `n/a (E = ${threshold} at α = π/4)`}
      </span>
    </div>
  );
}

export function LegendDot({ color, label, dashed = false }: LegendDotProps) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width={20} height={8}>
        <line
          x1={0}
          y1={4}
          x2={20}
          y2={4}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dashed ? "4 3" : undefined}
        />
      </svg>
      <span className=" text-[9px]" style={{ color: "#6b6780" }}>
        {label}
      </span>
    </div>
  );
}
