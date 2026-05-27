import { SHOTS_OPTIONS } from "../BitFlipTrap.constants";
import type { ShotsOption } from "../BitFlipTrap.constants";
import { SectionLabel } from "../../../shared/SectionLabel";

interface Props {
  shots: ShotsOption;
  onChange: (s: ShotsOption) => void;
}

export function ShotsSelector({ shots, onChange }: Props) {
  return (
    <div>
      <SectionLabel>Shots</SectionLabel>
      <div className="flex gap-1.5">
        {SHOTS_OPTIONS.map((s) => {
          const isActive = shots === s;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className="flex-1 rounded-md border px-2 py-1.5 text-[11px] font-mono font-semibold transition-colors duration-200"
              style={
                isActive
                  ? {
                      background: "rgba(167,139,250,0.15)",
                      borderColor: "rgba(167,139,250,0.45)",
                      color: "var(--color-accent)",
                    }
                  : {
                      background: "transparent",
                      borderColor: "var(--color-border)",
                      color: "var(--color-muted)",
                    }
              }
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
