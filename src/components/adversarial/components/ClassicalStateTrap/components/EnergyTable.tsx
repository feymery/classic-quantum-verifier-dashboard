import { CLASSICAL_STATE_ROWS } from "../ClassicalStateTrap.constants";
import { SectionLabel } from "../../../shared/SectionLabel";

export function EnergyTable() {
  return (
    <div>
      <SectionLabel>Classical state energies (independent of α)</SectionLabel>
      <table
        className="w-full text-[12px]"
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            {["State", "H_out", "6·H_in", "3·H_prop", "E_total", "Verdict"].map(
              (h) => (
                <th
                  key={h}
                  className="pb-1.5 pr-3 text-left text-[10px] uppercase tracking-widest"
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
          {CLASSICAL_STATE_ROWS.map((row) => (
            <tr key={row.state} style={{ borderBottom: "1px solid #1e1c2a" }}>
              <td
                className="py-1.5 pr-3 font-mono"
                style={{ color: "var(--color-foreground)" }}
              >
                |{row.state}⟩
              </td>
              <td
                className="py-1.5 pr-3 font-mono"
                style={{ color: "var(--color-muted)" }}
              >
                {row.H_out}
              </td>
              <td
                className="py-1.5 pr-3 font-mono"
                style={{ color: "var(--color-muted)" }}
              >
                {row.H_in6}
              </td>
              <td
                className="py-1.5 pr-3 font-mono"
                style={{ color: "var(--color-muted)" }}
              >
                {row.H_prop3}
              </td>
              <td
                className="py-1.5 pr-3 font-mono font-semibold"
                style={{ color: "var(--color-warning)" }}
              >
                {row.total.toFixed(1)}
              </td>
              <td
                className="py-1.5 pr-3 text-[11px]"
                style={{ color: "var(--color-danger)" }}
              >
                ✗ Fails
                {row.state === "00" && (
                  <span
                    className="ml-1 text-[10px]"
                    style={{ color: "var(--color-subtle)" }}
                  >
                    (1.5 &gt;&gt; 0.4)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
