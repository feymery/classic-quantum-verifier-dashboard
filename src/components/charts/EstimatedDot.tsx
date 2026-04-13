import { type DotProps } from "recharts";
import { CHART_COLORS } from "./chartTheme";

export function EstimatedDot(props: DotProps) {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="rgba(232,160,32,0.12)" />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={CHART_COLORS.estimated}
        stroke="#0f0e14"
        strokeWidth={1.5}
      />
    </g>
  );
}
