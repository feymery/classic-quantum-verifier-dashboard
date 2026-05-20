/**
 * AlphaPresetButton.tsx
 * Single preset button card. Renders label, desc, energy value, and verdict badge.
 */

import type { KeyAlpha } from "../../../types/alpha";
import { energy } from "../../../utils/alphaUtils";
import { Button } from "../../../ui/Button";
import { VerdictBadge } from "./VerdictBadge";

interface Props {
  ka: KeyAlpha;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (v: number) => void;
}

export function AlphaPresetButton({
  ka,
  isActive,
  isSelected,
  onSelect,
}: Props) {
  const e = energy(ka.value);

  return (
    <Button
      onClick={() => onSelect(ka.value)}
      variant="secondary"
      size="sm"
      className="group relative flex h-auto w-full flex-col gap-1 rounded border px-2.5 py-2 text-left font-normal transition-all duration-150"
      style={{
        background: isActive ? `${ka.color}18` : "var(--color-surface)",
        borderColor: isSelected
          ? ka.color
          : isActive
            ? ka.color
            : "var(--color-border)",
        boxShadow: isActive ? `0 0 12px ${ka.color}22` : "none",
      }}
    >
      {/* Label + verdict badge + sweep indicator */}
      <div className="flex items-center justify-between gap-1">
        <span
          className="text-[11px] font-medium leading-none"
          style={{ color: isActive ? ka.color : "var(--color-muted)" }}
        >
          {ka.label}
        </span>
        <div className="flex items-center gap-1">
          {isSelected && (
            <span
              className="rounded px-1 py-0.5 text-[8px] font-semibold uppercase leading-none tracking-wider"
              style={{ background: `${ka.color}28`, color: ka.color }}
            >
              sweep
            </span>
          )}
          <VerdictBadge alpha={ka.value} />
        </div>
      </div>

      {/* Desc + energy */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] leading-none text-subtle">{ka.desc}</span>
        <span
          className="font-mono text-[10px] leading-none"
          style={{ color: isActive ? ka.color + "cc" : "var(--color-subtle)" }}
        >
          E={e.toFixed(3)}
        </span>
      </div>
    </Button>
  );
}
