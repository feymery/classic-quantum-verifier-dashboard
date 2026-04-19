import { CHART_COLORS } from "../../chartTheme";
import type { HistogramDatum } from "../ShotHistogram.types";

interface ShotHistogramMetaProps {
  data: HistogramDatum[];
  shots: number;
  leakage: number;
  totalCounts: number;
}

export function ShotHistogramMeta({
  data,
  shots,
  leakage,
  totalCounts,
}: ShotHistogramMetaProps) {
  return (
    <>
      <div className="flex justify-around px-1" style={{ marginTop: -8 }}>
        {data.map((d) => {
          const diff = d.observed - d.expected;
          const diffColor =
            Math.abs(diff) < 0.02
              ? "#34d399"
              : Math.abs(diff) < 0.05
                ? "#f59e0b"
                : "#f87171";
          return (
            <div key={d.state} className="flex flex-col items-center gap-0.5">
              <div
                className="h-2 w-2 rotate-45 border"
                style={{
                  background: "transparent",
                  borderColor: CHART_COLORS.theoretical,
                }}
              />
              <span className=" text-[9px]" style={{ color: diffColor }}>
                {diff >= 0 ? "+" : ""}
                {(diff * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center gap-4 border-t pt-1  text-[10px]"
        style={{ borderColor: "#1e1c28", color: "#6b6780" }}
      >
        <span>{shots.toLocaleString()} shots</span>
        <span>little-endian: q₀=clock (left) · q₁=work (right)</span>
        <span
          style={{
            color:
              leakage < 0.02
                ? "#34d399"
                : leakage < 0.05
                  ? "#f59e0b"
                  : "#f87171",
          }}
        >
          non-expected leakage={(leakage * 100).toFixed(2)}%
        </span>
        <span className="ml-auto">total={totalCounts.toLocaleString()}</span>
      </div>
    </>
  );
}
