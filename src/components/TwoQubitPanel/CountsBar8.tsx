import { Card } from "../../ui/Card";
import { StepTag } from "./StepTag";

interface CountsBar8Props {
  counts: Record<string, number>;
  shots: number;
}

const STATES = ["000", "001", "010", "011", "100", "101", "110", "111"];
const EXPECTED_NONZERO = new Set(["000", "100", "111"]);

export function CountsBar8({ counts, shots }: CountsBar8Props) {
  const maxCount = Math.max(...STATES.map((s) => counts[s] ?? 0), 1);

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <StepTag>step E</StepTag>
          <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
            Shot Counts — 8 basis states
          </span>
          <span
            className="ml-auto font-mono text-[10px]"
            style={{ color: "#6b6780" }}
          >
            {shots} shots
          </span>
        </div>

        <div className="space-y-1">
          {STATES.map((s) => {
            const count = counts[s] ?? 0;
            const pct = (count / maxCount) * 100;
            const freq = count / shots;
            const isExpected = EXPECTED_NONZERO.has(s);
            const color =
              s === "000"
                ? "#9490a8"
                : s === "100" || s === "111"
                  ? "#a78bfa"
                  : "#f8717155";

            return (
              <div key={s} className="flex items-center gap-2">
                <span
                  className="w-8 shrink-0 font-mono text-[11px]"
                  style={{ color }}
                >
                  |{s}⟩
                </span>
                <div
                  className="h-3 flex-1 rounded-sm"
                  style={{ background: "#2d2b3a" }}
                >
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: `${color}44`,
                      borderRight: count > 0 ? `2px solid ${color}` : "none",
                      minWidth: count > 0 ? 2 : 0,
                    }}
                  />
                </div>
                <div className="flex w-32 shrink-0 items-center justify-end gap-1.5">
                  <span
                    className="font-mono text-[11px]"
                    style={{ color, fontVariantNumeric: "tabular-nums" }}
                  >
                    {count}
                  </span>
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: "#6b6780" }}
                  >
                    ({(freq * 100).toFixed(1)}%)
                  </span>
                  {!isExpected && count > 0 && (
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: "#f87171" }}
                    >
                      !
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="font-mono text-[9px]" style={{ color: "#6b6780" }}>
          expected non-zero: |000⟩, |100⟩, |111⟩ · any other state = shot noise
          or error
        </p>
      </div>
    </Card>
  );
}
