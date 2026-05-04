import { TRAP_COLOR } from "../../shared/trapShared.constants";
import { ALL_STATES } from "./ClassicalStateTrap.constants";
import type { TrapState2Q } from "./ClassicalStateTrap.types";

interface Props {
  trapState: TrapState2Q;
  alpha: number;
}

const AMBER_TOOLTIP =
  "This outcome appears in the honest distribution — Z-basis alone cannot tell honest from trap. Only H_prop reveals the deception.";

export function ZBasisTable({ trapState, alpha }: Props) {
  const hProbs: Record<TrapState2Q, number> = {
    "00": 0.5,
    "01": 0,
    "10": 0.5 * Math.pow(Math.cos(alpha), 2),
    "11": 0.5 * Math.pow(Math.sin(alpha), 2),
  };

  return (
    <table
      className="w-full text-right text-[11px]"
      style={{ borderCollapse: "collapse" }}
    >
      <thead>
        <tr>
          {["Outcome", "Honest prob.", "Trap prob.", "Note"].map((h) => (
            <th
              key={h}
              className="pb-1.5 pl-2 text-left text-[10px] uppercase tracking-widest"
              style={{ color: "#6b6780", borderBottom: "1px solid #2d2b3a" }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ALL_STATES.map((state) => {
          const hP = hProbs[state];
          const tP = state === trapState ? 1 : 0;
          const isAmber = state === trapState && hP > 0.12;
          return (
            <tr
              key={state}
              title={isAmber ? AMBER_TOOLTIP : undefined}
              style={{
                background: isAmber ? "rgba(245,158,11,0.07)" : "transparent",
                borderBottom: "1px solid #1e1c2a",
              }}
            >
              <td
                className="py-1 pl-2 text-left font-mono"
                style={{ color: isAmber ? "#fbbf24" : "#ddd9ee" }}
              >
                |{state}⟩{" "}
                {isAmber && (
                  <span className="text-[9px]" title={AMBER_TOOLTIP}>
                    ⚠
                  </span>
                )}
              </td>
              <td className="py-1 pl-2 font-mono" style={{ color: "#9490a8" }}>
                {hP.toFixed(3)}
              </td>
              <td
                className="py-1 pl-2 font-mono"
                style={{ color: tP === 1 ? TRAP_COLOR : "#4b4860" }}
              >
                {tP.toFixed(1)}
              </td>
              <td
                className="py-1 pl-2 text-left"
                style={{ color: "#6b6780", fontStyle: "italic" }}
              >
                {state === "10"
                  ? "H_in penalty"
                  : isAmber
                    ? "Appears in honest dist."
                    : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

ZBasisTable.displayName = "ZBasisTable";
