/**
 * DetectionSignatureBox.tsx
 * Shows energy breakdown and final accept / reject verdict for the bit-flip trap.
 */

import { SectionLabel } from "../../../shared/SectionLabel";
import { THRESHOLD_LOW } from "../../../../../utils/constants";
import type { BitFlipObservables } from "../BitFlipTrap.types";

interface Props {
  obs: BitFlipObservables;
  p: number;
}

export function DetectionSignatureBox({ obs, p }: Props) {
  const verified = obs.E_noisy < THRESHOLD_LOW;
  const delta = obs.E_noisy - obs.E_ideal;

  return (
    <div className="rounded-md border border-border bg-elevated px-4 py-3 text-[11px]">
      <SectionLabel>Detection signature</SectionLabel>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono">
        <span className="text-muted">p</span>
        <span
          style={{
            color:
              p > 0.25
                ? "var(--color-danger)"
                : p > 0.1
                  ? "var(--color-warning)"
                  : "var(--color-accent)",
          }}
        >
          {p.toFixed(2)}
        </span>

        <span className="text-muted">E_ideal</span>
        <span className="text-success">{obs.E_ideal.toFixed(5)}</span>

        <span className="text-muted">E_noisy</span>
        <span
          style={{
            color:
              obs.E_noisy >= THRESHOLD_LOW
                ? "var(--color-danger)"
                : "var(--color-warning)",
          }}
        >
          {obs.E_noisy.toFixed(5)}
        </span>

        <span className="text-muted">error floor</span>
        <span className="text-warning">+{delta.toFixed(5)}</span>
      </div>

      <div
        className={`mt-3 rounded px-3 py-1.5 text-center text-[12px] font-semibold ${
          verified ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
        }`}
      >
        {verified
          ? `✓ VERIFIED — E = ${obs.E_noisy.toFixed(4)} < ${THRESHOLD_LOW}`
          : `✗ TRAP DETECTED — E = ${obs.E_noisy.toFixed(4)} ≥ ${THRESHOLD_LOW}`}
      </div>
    </div>
  );
}
