import { SectionLabel } from "../../shared/SectionLabel";

const CARDS: {
  term: string;
  description: string;
  formula?: string;
  highlight: boolean;
}[] = [
  {
    term: "H_out",
    description:
      "Penalizes invalid outputs. |00⟩ and |11⟩ score 0 here — they are valid circuit outputs. |01⟩ and |10⟩ fail immediately.",
    highlight: false,
  },
  {
    term: "H_in",
    description:
      "Penalizes incorrect inputs. Only |10⟩ violates the input condition (computation qubit starts in |1⟩ instead of |0⟩). All other states score 0.",
    highlight: false,
  },
  {
    term: "H_prop",
    description:
      "The key detector. Catches the missing quantum transition U(α). Crucially, H_prop does not depend on the trap state at all — it only depends on α:",
    formula: "H_prop = 1.5 · (1 − cos(2α)/2)",
    highlight: true,
  },
];

const H_PROP_FOOTNOTE =
  "For any α > 0 this is strictly positive. No classical state can fake the temporal coherence that U(α) would have created. The dishonest prover cannot escape H_prop regardless of which state they submit.";

export function HamiltonianExplainer() {
  return (
    <div>
      <SectionLabel>why H_prop always wins</SectionLabel>
      <div className="flex flex-col gap-2">
        {CARDS.map(({ term, description, formula, highlight }) => (
          <div
            key={term}
            className={`rounded-lg border px-4 py-3 text-[12px] leading-relaxed ${
              highlight
                ? "border-accent/40 bg-surface text-accent-light"
                : "border-border bg-canvas text-muted"
            }`}
          >
            <span
              className={`mr-2 font-mono font-semibold ${
                highlight ? "text-accent" : "text-foreground"
              }`}
            >
              {term}
            </span>
            {description}
            {formula && (
              <div className="mt-1 font-mono text-[11px] text-accent/70">
                {formula}
              </div>
            )}
            {highlight && (
              <div className="mt-1.5 text-[11px] leading-relaxed text-muted">
                {H_PROP_FOOTNOTE}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
