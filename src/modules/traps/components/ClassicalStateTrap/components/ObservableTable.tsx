import { SectionLabel } from "../../../shared/SectionLabel";

interface Props {
  cosA: number;
  sinA: number;
  E_quantum: number;
  showQuantum: boolean;
}

export function ObservableTable({ cosA, sinA, E_quantum, showQuantum }: Props) {
  return (
    <div>
      <SectionLabel>Observable comparison</SectionLabel>
      <table
        className="w-full text-[12px]"
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            {["Observable", "Quantum (honest)", "Classical (any |b₁b₂⟩)"].map(
              (h) => (
                <th
                  key={h}
                  className="pb-1.5 pr-4 text-left text-[10px] uppercase tracking-widest"
                  style={{
                    color: "var(--color-subtle)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #1e1c2a" }}>
            <td
              className="py-1.5 pr-4 font-mono"
              style={{ color: "var(--color-foreground)" }}
            >
              ⟨Z₁X₂⟩
            </td>
            <td
              className="py-1.5 pr-4 font-mono"
              style={{ color: "var(--color-success)" }}
            >
              {showQuantum
                ? `cos\u2009α\u2009=\u2009${cosA.toFixed(3)}`
                : "cos α"}
            </td>
            <td
              className="py-1.5 pr-4 font-mono"
              style={{ color: "var(--color-danger)" }}
            >
              0 (always)
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #1e1c2a" }}>
            <td
              className="py-1.5 pr-4 font-mono"
              style={{ color: "var(--color-foreground)" }}
            >
              ⟨X₁X₂⟩
            </td>
            <td
              className="py-1.5 pr-4 font-mono"
              style={{ color: "var(--color-success)" }}
            >
              {showQuantum
                ? `sin\u2009α\u2009=\u2009${sinA.toFixed(3)}`
                : "sin α"}
            </td>
            <td
              className="py-1.5 pr-4 font-mono"
              style={{ color: "var(--color-danger)" }}
            >
              0 (always)
            </td>
          </tr>
          <tr>
            <td
              className="py-1.5 pr-4 font-mono font-semibold"
              style={{ color: "var(--color-foreground)" }}
            >
              E_total
            </td>
            <td
              className="py-1.5 pr-4 font-mono font-semibold"
              style={{ color: "var(--color-success)" }}
            >
              {showQuantum
                ? `sin²α\u2009=\u2009${E_quantum.toFixed(3)}`
                : "sin²α"}
            </td>
            <td
              className="py-1.5 pr-4 font-mono font-semibold"
              style={{ color: "var(--color-warning)" }}
            >
              ≥ 1.5 (always)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
