/**
 * ThresholdStatusBox.tsx
 * Shows whether the current (alpha, lambda) combination can still be verified,
 * together with computed energy metrics (E_ideal, E_noisy, noise floor).
 */

import { PI_HALF } from "../DepolarizingTrap.constants";
import type { Observables } from "../DepolarizingTrap.types";

interface Props {
  lam: number;
  lcrit: number;
  alpha: number;
  aboveCrit: boolean;
  obs: Observables;
  lineColor: string;
}

export function ThresholdStatusBox({
  lam,
  lcrit,
  alpha,
  aboveCrit,
  obs,
  lineColor,
}: Props) {
  const alphaDeg = ((alpha / PI_HALF) * 90).toFixed(0);

  return (
    <div
      className={`rounded-md border px-4 py-3 text-[12px] ${
        aboveCrit
          ? "border-danger/40 bg-danger/10"
          : "border-success/30 bg-success/10"
      }`}
    >
      {/* Energy metrics */}
      <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px]">
        <span className="text-muted">E_ideal</span>
        <span className="text-success">{obs.E_ideal.toFixed(5)}</span>

        <span className="text-muted">E_noisy</span>
        <span style={{ color: lineColor }}>{obs.E_noisy.toFixed(5)}</span>

        <span className="text-muted">noise floor</span>
        <span className="text-warning">
          +{(obs.E_noisy - obs.E_ideal).toFixed(5)}
        </span>
      </div>

      {/* Verdict */}
      <div className={aboveCrit ? "text-danger" : "text-success"}>
        {aboveCrit ? (
          <>
            <span className="mr-1.5 font-semibold">
              ⚠ VERIFICATION IMPOSSIBLE
            </span>
            at this α — λ exceeds λ_crit({alphaDeg}°) = {lcrit.toFixed(3)}
          </>
        ) : (
          <>
            <span className="mr-1.5 font-semibold">
              ✓ Verification possible
            </span>
            — margin: Δλ = {(lcrit - lam).toFixed(3)} before threshold
          </>
        )}
      </div>
    </div>
  );
}
