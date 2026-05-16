import { SectionLabel } from "../../../shared/SectionLabel";
import type { BitFlipObservables } from "../BitFlipTrap.types";

interface Props {
  alpha: number;
  obs: BitFlipObservables;
  p: number;
}

function noisyColor(p: number): string {
  if (p > 0.25) return "var(--color-danger)";
  if (p > 0.1) return "var(--color-warning)";
  return "var(--color-accent)";
}

export function ObservableComparison({ alpha, obs, p }: Props) {
  const color = noisyColor(p);

  const rows = [
    {
      label: "⟨Z₁X₂⟩",
      ideal: Math.cos(alpha),
      noisy: obs.Z1X2,
      max: 0,
    },
    {
      label: "⟨X₁X₂⟩",
      ideal: Math.sin(alpha),
      noisy: obs.X1X2,
      max: 0,
    },
    {
      label: "⟨Z₁Z₂⟩",
      ideal: Math.sin(alpha) ** 2,
      noisy: obs.Z1Z2,
      max: 0,
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
                Ideal (p=0)
              </th>
              <th
                className="px-3 py-2 text-right text-[10px] font-normal"
                style={{ color }}
              >
                Current p
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-normal text-danger">
                Max (p=0.5)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map(({ label, ideal, noisy, max }) => (
              <tr key={label}>
                <td className="px-3 py-1.5 text-foreground">{label}</td>
                <td className="px-3 py-1.5 text-right text-success">
                  {ideal.toFixed(4)}
                </td>
                <td className="px-3 py-1.5 text-right" style={{ color }}>
                  {noisy.toFixed(4)}
                </td>
                <td className="px-3 py-1.5 text-right text-danger">
                  {max.toFixed(4)}
                </td>
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-foreground">⟨E⟩</td>
              <td className="px-3 py-1.5 text-right font-semibold text-success">
                {obs.E_ideal.toFixed(4)}
              </td>
              <td
                className="px-3 py-1.5 text-right font-semibold"
                style={{ color }}
              >
                {obs.E_noisy.toFixed(4)}
              </td>
              <td className="px-3 py-1.5 text-right font-semibold text-danger">
                3.5000
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
