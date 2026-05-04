import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { SectionLabel } from "../../shared/SectionLabel";
import { HONEST_COLOR, TRAP_COLOR } from "../../shared/trapShared.constants";
import type { ClaimStep } from "./FinalStateTrap.types";

interface Props {
  claimStep: ClaimStep;
  isTrap: boolean;
}

export function ClockDistChart({ claimStep, isTrap }: Props) {
  const claimIdx = claimStep === "t0" ? 0 : claimStep === "t1" ? 1 : 2;
  const data = [0, 1, 2].map((t) => ({
    label: `t=${t}`,
    P: isTrap ? (t === claimIdx ? 1 : 0) : 1 / 3,
  }));

  return (
    <div>
      <SectionLabel>clock step distribution</SectionLabel>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 4, left: -16 }}
          barSize={28}
        >
          <XAxis
            dataKey="label"
            tick={{ fill: "#9490a8", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: "#6b6780", fontSize: 8 }}
            tickFormatter={(v: number) => v.toFixed(1)}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].value as number;
              return (
                <div
                  className="rounded-lg border px-2 py-1 text-[10px]"
                  style={{
                    background: "#1e1c2a",
                    borderColor: "#3d3b4a",
                    color: "#ddd9ee",
                  }}
                >
                  P = {p.toFixed(3)}
                </div>
              );
            }}
          />
          <Bar
            dataKey="P"
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationDuration={500}
          >
            {data.map((d, i) => (
              <Cell
                key={d.label}
                fill={
                  isTrap
                    ? i === claimIdx
                      ? TRAP_COLOR
                      : "#3d3b4a"
                    : HONEST_COLOR
                }
                opacity={!isTrap || i === claimIdx ? 1 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
