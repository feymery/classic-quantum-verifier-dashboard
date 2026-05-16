/**
 * DetectionSignatureBox.tsx
 * Displays computed energy values, the noise floor contribution,
 * and a final accept / trap-detected verdict badge.
 */

import { SectionLabel } from "../../../shared/SectionLabel";
import { THRESHOLD, PI_HALF } from "../DepolarizingTrap.constants";
import type { Observables } from "../DepolarizingTrap.types";

interface Props {
  alpha: number;
  lam: number;
  lineColor: string;
  obs: Observables;
}

export function DetectionSignatureBox({ alpha, lam, lineColor, obs }: Props) {
  const verified = obs.E_noisy < THRESHOLD;

  return (
    <div className="rounded-md border border-border bg-elevated px-4 py-3 text-[11px]">
      <SectionLabel>Detection signature</SectionLabel>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono">
        <span className="text-muted">α</span>
        <span className="text-foreground">
          {((alpha / PI_HALF) * 90).toFixed(2)}°
        </span>

        <span className="text-muted">λ</span>
        <span style={{ color: lineColor }}>{lam.toFixed(3)}</span>

        <span className="text-muted">E_ideal</span>
        <span className="text-success">{obs.E_ideal.toFixed(5)}</span>

        <span className="text-muted">E_noisy</span>
        <span style={{ color: lineColor }}>{obs.E_noisy.toFixed(5)}</span>

        <span className="text-muted">noise floor</span>
        <span className="text-warning">
          +{(obs.E_noisy - obs.E_ideal).toFixed(5)}
        </span>
      </div>

      <div
        className={`mt-3 rounded px-3 py-1.5 text-center text-[12px] font-semibold ${
          verified ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
        }`}
      >
        {verified
          ? `✓ VERIFIED — E = ${obs.E_noisy.toFixed(4)} < 0.4`
          : `✗ TRAP DETECTED — E = ${obs.E_noisy.toFixed(4)} ≥ 0.4`}
      </div>
    </div>
  );
}
