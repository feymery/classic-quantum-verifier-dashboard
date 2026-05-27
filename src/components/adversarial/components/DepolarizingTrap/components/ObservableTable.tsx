/**
 * ObservableTable.tsx
 * Comparison table: ideal vs noisy vs fully-mixed Pauli expectation values.
 */

import { SectionLabel } from "../../../shared/SectionLabel";
import type { Observables } from "../DepolarizingTrap.types";

interface Props {
  alpha: number;
  obs: Observables;
  lineColor: string;
}

export function ObservableTable({ alpha, obs, lineColor }: Props) {
  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);

  const rows: { label: string; ideal: string; noisy: number; mixed: string }[] =
    [
      {
        label: "⟨Z₁X₂⟩",
        ideal: cosA.toFixed(4),
        noisy: obs.Z1X2_noisy,
        mixed: "0",
      },
      {
        label: "⟨X₁X₂⟩",
        ideal: sinA.toFixed(4),
        noisy: obs.X1X2_noisy,
        mixed: "0",
      },
      {
        label: "⟨Z₁Z₂⟩",
        ideal: (sinA ** 2).toFixed(4),
        noisy: obs.Z1Z2_noisy,
        mixed: "0",
      },
    ];

  return (
    <div>
      <SectionLabel>Observable comparison</SectionLabel>
      <div className="overflow-x-auto rounded-md border border-border bg-elevated text-[11px]">
        <table className="w-full border-collapse font-mono">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-[10px] font-normal text-subtle">
                Observable
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-normal text-success">
                Ideal (λ=0)
              </th>
              <th
                className="px-3 py-2 text-right text-[10px] font-normal"
                style={{ color: lineColor }}
              >
                Current λ
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-normal text-danger">
                Mixed (λ=1)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map(({ label, ideal, noisy, mixed }) => (
              <tr key={label}>
                <td className="px-3 py-1.5 text-foreground">{label}</td>
                <td className="px-3 py-1.5 text-right text-success">{ideal}</td>
                <td
                  className="px-3 py-1.5 text-right"
                  style={{ color: lineColor }}
                >
                  {noisy.toFixed(4)}
                </td>
                <td className="px-3 py-1.5 text-right text-danger">{mixed}</td>
              </tr>
            ))}

            {/* E_total row */}
            <tr className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-foreground">
                E_total
              </td>
              <td className="px-3 py-1.5 text-right font-semibold text-success">
                {obs.E_ideal.toFixed(4)}
              </td>
              <td
                className="px-3 py-1.5 text-right font-semibold"
                style={{ color: lineColor }}
              >
                {obs.E_noisy.toFixed(4)}
              </td>
              <td className="px-3 py-1.5 text-right font-semibold text-danger">
                ≈ 3.50
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
