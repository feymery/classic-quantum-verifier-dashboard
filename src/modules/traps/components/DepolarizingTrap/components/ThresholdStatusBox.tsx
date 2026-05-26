/**
 * ThresholdStatusBox.tsx
 * Shows whether the current (alpha, lambda) combination can still be verified,
 * together with computed energy metrics (E_ideal, E_noisy, noise floor).
 */

import type { Observables } from "../DepolarizingTrap.types";

interface Props {
  lam: number;
  lcrit: number;
  alpha: number;
  aboveCrit: boolean;
  obs: Observables;
  lineColor: string;
}

export function ThresholdStatusBox({ aboveCrit, obs, lineColor }: Props) {
  return (
    <div
      className={`rounded-md border px-4 py-3 text-[12px] ${
        aboveCrit
          ? "border-danger/40 bg-danger/10"
          : "border-success/30 bg-success/10"
      }`}
    >
      {/* Verdict */}
      <span className={aboveCrit ? "text-danger" : "text-success"}>
        {aboveCrit ? "⚠ VERIFICATION IMPOSSIBLE" : "✓ Verification possible"}
      </span>
      {/* Energy metrics */}
      <div className="my-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px]">
        <span className="text-muted">E_ideal</span>
        <span className="text-success">{obs.E_ideal.toFixed(5)}</span>

        <span className="text-muted">E_noisy</span>
        <span style={{ color: lineColor }}>{obs.E_noisy.toFixed(5)}</span>

        <span className="text-muted">noise floor</span>
        <span className="text-warning">
          +{(obs.E_noisy - obs.E_ideal).toFixed(5)}
        </span>
      </div>
    </div>
  );
}
