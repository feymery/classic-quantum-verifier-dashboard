import { SectionLabel } from "../../shared/SectionLabel";
import type { TrapState2Q } from "./ClassicalStateTrap.types";

interface Props {
  trapState: TrapState2Q;
}

const ROWS: {
  state: TrapState2Q;
  term: string;
  reason: string;
}[] = [
  {
    state: "00",
    term: "H_prop",
    reason:
      "Correct input, correct output, but U(α) transition was never performed.",
  },
  {
    state: "01",
    term: "H_out + H_prop",
    reason: "Invalid output and no quantum transition.",
  },
  {
    state: "10",
    term: "H_in",
    reason:
      "Computation qubit starts in |1⟩, violates the input condition directly.",
  },
  {
    state: "11",
    term: "H_prop",
    reason:
      "Satisfies H_out and appears in the honest Z-basis distribution — only the missing temporal coherence exposes it. Hardest case.",
  },
];

export function DetectionBreakdownTable({ trapState }: Props) {
  return (
    <div>
      <SectionLabel>detection mechanism</SectionLabel>
      <div className="overflow-hidden rounded-lg bg-canvas">
        {/* Header */}
        <div className="grid grid-cols-[56px_1fr_2fr] gap-x-3 border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-subtle">
          <span>State</span>
          <span>Term</span>
          <span>Reason</span>
        </div>

        {/* Rows */}
        {ROWS.map(({ state, term, reason }) => {
          const isSelected = trapState === state;
          const isHard = state === "11";

          const rowBg = isSelected
            ? isHard
              ? "color-mix(in srgb, var(--color-warning) 15%, transparent)"
              : "color-mix(in srgb, var(--color-danger) 10%, transparent)"
            : isHard
              ? "color-mix(in srgb, var(--color-warning) 7%, transparent)"
              : "transparent";

          const borderLeftColor = isHard
            ? "var(--color-warning)"
            : isSelected
              ? "var(--color-danger)"
              : "transparent";

          return (
            <div
              key={state}
              className="grid grid-cols-[56px_1fr_2fr] items-start gap-x-3 border-b border-elevated px-3 py-2"
              style={{
                background: rowBg,
                borderLeft: `2px solid ${borderLeftColor}`,
              }}
            >
              <span
                className={`font-mono text-[12px] ${
                  isSelected ? "text-accent-light" : "text-foreground"
                }`}
              >
                |{state}⟩
              </span>
              <span
                className={`inline-block self-start rounded-full bg-elevated px-2 py-0.5 text-[10px] ${
                  isSelected ? "text-danger" : "text-muted"
                }`}
              >
                {term}
              </span>
              <span className="text-[11px] italic text-subtle">{reason}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
