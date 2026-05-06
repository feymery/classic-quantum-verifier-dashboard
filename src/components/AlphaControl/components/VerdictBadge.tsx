/**
 * VerdictBadge.tsx
 * Small pill showing ACCEPT / BOUNDARY / REJECT for a given alpha value.
 * Verdict is derived from physics — not passed as a prop to avoid drift.
 */

import { energy } from "../../../utils/alphaUtils";
import { verifierDecision } from "../../../physics/energy";
import type { Verdict } from "../../../types/dashboard";

interface Props {
  alpha: number;
}

const CONFIG: Record<Verdict, { label: string; className: string }> = {
  accept: {
    label: "ACCEPT",
    className: "bg-success/10 text-success border border-success/30",
  },
  boundary: {
    label: "BOUNDARY",
    className: "bg-warning/10 text-warning border border-warning/30",
  },
  reject: {
    label: "REJECT",
    className: "bg-danger/10 text-danger border border-danger/30",
  },
};

export function VerdictBadge({ alpha }: Props) {
  const verdict = verifierDecision(energy(alpha));
  const { label, className } = CONFIG[verdict];

  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${className}`}
    >
      {label}
    </span>
  );
}
