import type { ClaimStep } from "./FinalStateTrap.types";

const ALL_STATES = ["00", "10", "11", "01"] as const;

interface Props {
  claimStep: ClaimStep;
  alpha: number;
}

const T2_TOOLTIP =
  "The final state |ψ_2⟩ has the same Z-basis distribution as the honest prover. Z measurements are blind to this trap — only H_prop detects it.";

export function ZBasisTable({ claimStep, alpha }: Props) {
  const hProbs: Record<string, number> = {
    "00": (1 + Math.cos(alpha)) / 4,
    "01": (1 - Math.cos(alpha)) / 4,
    "10": (1 - Math.cos(alpha)) / 4,
    "11": (1 + Math.cos(alpha)) / 4,
  };

  let trapProbs: Record<string, number>;
  if (claimStep === "t0") {
    trapProbs = { "00": 1, "01": 0, "10": 0, "11": 0 };
  } else if (claimStep === "t1") {
    const c2 = Math.pow(Math.cos(alpha / 2), 2);
    const s2 = Math.pow(Math.sin(alpha / 2), 2);
    trapProbs = { "00": c2 / 2, "10": s2 / 2, "01": s2 / 2, "11": c2 / 2 };
  } else {
    trapProbs = {
      "00": (1 + Math.cos(alpha)) / 4,
      "01": (1 - Math.cos(alpha)) / 4,
      "10": (1 - Math.cos(alpha)) / 4,
      "11": (1 + Math.cos(alpha)) / 4,
    };
  }

  const isT2 = claimStep === "t2";

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
          const tP = trapProbs[state] ?? 0;
          const isAmber = isT2;
          return (
            <tr
              key={state}
              title={isAmber ? T2_TOOLTIP : undefined}
              style={{
                background: isAmber ? "rgba(245,158,11,0.07)" : "transparent",
                borderBottom: "1px solid #1e1c2a",
              }}
            >
              <td
                className="py-1 pl-2 font-mono text-left"
                style={{ color: isAmber ? "#fbbf24" : "#ddd9ee" }}
              >
                |{state}⟩{" "}
                {isAmber && (
                  <span className="text-[9px]" title={T2_TOOLTIP}>
                    ⚠
                  </span>
                )}
              </td>
              <td className="py-1 pl-2 font-mono" style={{ color: "#9490a8" }}>
                {hP.toFixed(3)}
              </td>
              <td
                className="py-1 pl-2 font-mono"
                style={{
                  color: isAmber
                    ? "#fbbf24"
                    : tP > 0.01
                      ? "#ddd9ee"
                      : "#4b4860",
                }}
              >
                {tP.toFixed(3)}
              </td>
              <td
                className="py-1 pl-2 text-left"
                style={{ color: "#6b6780", fontStyle: "italic" }}
              >
                {isAmber
                  ? "Identical to honest dist."
                  : tP > 0.01
                    ? "Present in trap"
                    : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
