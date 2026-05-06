/**
 * AlphaInsightPanel.tsx
 * Rich insight display for the active alpha preset.
 * Shows: header (label + verdict badge), energy value, observable values,
 * noise tolerance, and the full descriptive insight text.
 */

import type { KeyAlpha } from "../../../types/alpha";
import { energy } from "../../../utils/alphaUtils";
import { VerdictBadge } from "./VerdictBadge";

interface Props {
  alpha: number;
  preset: KeyAlpha;
}

export function AlphaInsightPanel({ alpha, preset }: Props) {
  const e = energy(alpha);
  const cosAlpha = Math.cos(alpha);
  const sinAlpha = Math.sin(alpha);
  const lambdaCrit = Math.max(0, ((0.4 - e) * 2) / 3);

  return (
    <div
      className="mt-2 rounded border p-3 text-[11px] leading-relaxed"
      style={{
        background: `${preset.color}0a`,
        borderColor: `${preset.color}30`,
      }}
    >
      {/* Header: label + verdict */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold" style={{ color: preset.color }}>
          {preset.label}
        </span>
        <VerdictBadge alpha={alpha} />
        <span className="font-mono" style={{ color: preset.color + "99" }}>
          E = {e.toFixed(4)}
        </span>
      </div>

      {/* Observable mini-grid */}
      <div
        className="mb-2 grid grid-cols-3 gap-x-3 gap-y-1 rounded border px-2 py-1.5 font-mono text-[10px]"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <span style={{ color: "var(--color-muted)" }}>⟨Z₁X₂⟩</span>
        <span style={{ color: "var(--color-muted)" }}>⟨X₁X₂⟩</span>
        <span style={{ color: "var(--color-muted)" }}>λ_crit</span>
        <span style={{ color: preset.color }}>{cosAlpha.toFixed(3)}</span>
        <span style={{ color: preset.color }}>{sinAlpha.toFixed(3)}</span>
        <span
          style={{
            color: lambdaCrit === 0 ? "var(--color-danger)" : preset.color,
          }}
        >
          {lambdaCrit.toFixed(3)}
        </span>
      </div>

      {/* Full insight text */}
      <p style={{ color: "var(--color-muted)" }}>{preset.insight}</p>
    </div>
  );
}
