/**
 * DistributionCompare.tsx
 * Generic two-column honest vs trap distribution layout.
 *
 * Handles the section label, colored column headers, and the
 * honest/trap grid. Bar content is injected via render slots.
 */

import type { ReactNode } from "react";
import { SectionLabel } from "./SectionLabel";
import { HONEST_COLOR, TRAP_COLOR } from "./trapShared.constants";

interface Props {
  /** Section label shown above the two columns. */
  label: string;
  honestLabel: string;
  trapLabel: string;
  /** When false, the trap column header is dimmed. */
  isTrap: boolean;
  honestBars: ReactNode;
  trapBars: ReactNode;
  /** Optional footnote shown below the trap column (e.g. reference-line hint). */
  refNote?: string;
}

export function DistributionCompare({
  label,
  honestLabel,
  trapLabel,
  isTrap,
  honestBars,
  trapBars,
  refNote,
}: Props) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p
            className="mb-2 text-[11px] font-medium"
            style={{ color: HONEST_COLOR }}
          >
            {honestLabel}
          </p>
          {honestBars}
        </div>
        <div>
          <p
            className="mb-2 text-[11px] font-medium"
            style={{ color: isTrap ? TRAP_COLOR : "#4b4860" }}
          >
            {trapLabel}
          </p>
          {trapBars}
          {refNote && (
            <p className="mt-1.5 text-[10px] text-subtle">{refNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
