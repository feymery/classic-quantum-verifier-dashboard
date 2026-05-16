import type { FlipTarget } from "../BitFlipTrap.types";
import { SectionLabel } from "../../../shared/SectionLabel";

const TARGETS: { value: FlipTarget; label: string; hint: string }[] = [
  { value: "clock", label: "Clock", hint: "X flip on the clock qubit readout" },
  { value: "work", label: "Work", hint: "X flip on the work qubit readout" },
  { value: "both", label: "Both", hint: "Independent X flips on both qubits" },
];

interface Props {
  target: FlipTarget;
  onChange: (t: FlipTarget) => void;
}

export function FlipTargetSelector({ target, onChange }: Props) {
  return (
    <div>
      <SectionLabel>Affected qubit</SectionLabel>
      <div className="flex gap-1.5">
        {TARGETS.map(({ value, label, hint }) => {
          const isActive = target === value;
          return (
            <button
              key={value}
              title={hint}
              onClick={() => onChange(value)}
              className="flex-1 rounded-md border px-3 py-2 text-[11px] font-semibold transition-colors duration-200"
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
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
