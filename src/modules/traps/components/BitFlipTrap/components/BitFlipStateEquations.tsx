/**
 * BitFlipStateEquations.tsx
 *
 * Shows the resulting post-error state distribution for the selected
 * bit-flip target (clock / work / both) side-by-side with the ideal.
 */

import { SectionLabel } from "../../../shared/SectionLabel";
import type { FlipTarget } from "../BitFlipTrap.types";

interface Props {
  alpha: number;
  p: number;
  target: FlipTarget;
}

interface StateRow {
  state: string;
  idealProb: string;
  noisyProb: string;
  note: string;
}

function buildRows(alpha: number, p: number, target: FlipTarget): StateRow[] {
  const cos2 = Math.cos(alpha) ** 2;
  const sin2 = Math.sin(alpha) ** 2;
  const q = 1 - p;

  if (target === "clock") {
    return [
      {
        state: "|00⟩",
        idealProb: "1/2",
        noisyProb: `${(q * 0.5).toFixed(3)}`,
        note: "clock |0⟩ survives with probability (1−p)",
      },
      {
        state: "|10⟩",
        idealProb: `cos²(α)/2 = ${(cos2 / 2).toFixed(3)}`,
        noisyProb: `${((q * cos2) / 2).toFixed(3)}`,
        note: "clock |1⟩ survives with (1−p)",
      },
      {
        state: "|11⟩",
        idealProb: `sin²(α)/2 = ${(sin2 / 2).toFixed(3)}`,
        noisyProb: `${((q * sin2) / 2).toFixed(3)}`,
        note: "clock |1⟩ survives with (1−p)",
      },
      {
        state: "|01⟩",
        idealProb: "0",
        noisyProb: `${((p * sin2) / 2).toFixed(3)}`,
        note: "clock flip: |11⟩ → |01⟩ with probability p",
      },
    ];
  }

  if (target === "work") {
    return [
      {
        state: "|00⟩",
        idealProb: "1/2",
        noisyProb: `${(q * 0.5).toFixed(3)}`,
        note: "work |0⟩ survives with (1−p)",
      },
      {
        state: "|10⟩",
        idealProb: `cos²(α)/2 = ${(cos2 / 2).toFixed(3)}`,
        noisyProb: `${((q * cos2) / 2).toFixed(3)}`,
        note: "work |0⟩ survives with (1−p)",
      },
      {
        state: "|11⟩",
        idealProb: `sin²(α)/2 = ${(sin2 / 2).toFixed(3)}`,
        noisyProb: `${((q * sin2) / 2).toFixed(3)}`,
        note: "work |1⟩ survives with (1−p)",
      },
      {
        state: "|01⟩",
        idealProb: "0",
        noisyProb: `${((p * cos2) / 2).toFixed(3)}`,
        note: "work flip: |10⟩ → |01⟩ with probability p",
      },
    ];
  }

  // both — independent flips
  return [
    {
      state: "|00⟩",
      idealProb: "1/2",
      noisyProb: `${(q * q * 0.5 + (p * p * sin2) / 2).toFixed(3)}`,
      note: "no flips (prob q²) + both flips on |11⟩ (prob p²)",
    },
    {
      state: "|10⟩",
      idealProb: `cos²(α)/2 = ${(cos2 / 2).toFixed(3)}`,
      noisyProb: `${((q * q * cos2) / 2 + p * (1 - p)).toFixed(3)}`,
      note: "no flips (q²) + cross-flip contributions",
    },
    {
      state: "|11⟩",
      idealProb: `sin²(α)/2 = ${(sin2 / 2).toFixed(3)}`,
      noisyProb: `${((q * q * sin2) / 2 + p * p * 0.5).toFixed(3)}`,
      note: "no flips (q²) + both flips on |00⟩ (prob p²)",
    },
    {
      state: "|01⟩",
      idealProb: "0",
      noisyProb: `${(p * (1 - p)).toFixed(3)}`,
      note: "single-qubit flip cross-term: p·(1−p)",
    },
  ];
}

const TARGET_LABEL: Record<FlipTarget, string> = {
  clock: "clock qubit flipped",
  work: "work qubit flipped",
  both: "both qubits flipped independently",
};

const TARGET_EQUATION: Record<FlipTarget, string> = {
  clock: "X ⊗ I applied with prob p → clock |0⟩↔|1⟩, work unchanged",
  work: "I ⊗ X applied with prob p → work |0⟩↔|1⟩, clock unchanged",
  both: "X ⊗ X independently with prob p each → all four basis states mixed",
};

export function BitFlipStateEquations({ alpha, p, target }: Props) {
  const rows = buildRows(alpha, p, target);

  return (
    <div>
      <SectionLabel>State after bit-flip — {TARGET_LABEL[target]}</SectionLabel>

      {/* Error model description */}
      <p
        className="mb-3 rounded-md border px-3 py-2 text-[11px] leading-relaxed"
        style={{
          borderColor: "rgba(248,113,113,0.25)",
          background: "rgba(248,113,113,0.06)",
          color: "var(--color-muted)",
        }}
      >
        <span className="font-mono text-foreground">
          {TARGET_EQUATION[target]}
        </span>
      </p>

      <div className="overflow-x-auto rounded-md border border-border bg-elevated text-[11px]">
        <table className="w-full font-mono border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-[10px] font-normal text-subtle">
                State
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-normal text-success">
                P ideal
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-normal text-danger">
                P noisy (p={p.toFixed(2)})
              </th>
              <th className="hidden px-3 py-2 text-left text-[10px] font-normal text-subtle sm:table-cell">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map(({ state, idealProb, noisyProb, note }) => {
              const isNew = idealProb === "0" && noisyProb !== "0.000";
              return (
                <tr key={state}>
                  <td
                    className="px-3 py-1.5 font-semibold"
                    style={{
                      color: isNew
                        ? "var(--color-danger)"
                        : "var(--color-foreground)",
                    }}
                  >
                    {state}
                    {isNew && (
                      <span className="ml-1.5 text-[9px] font-bold uppercase text-danger/80">
                        new
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right text-success">
                    {idealProb}
                  </td>
                  <td
                    className="px-3 py-1.5 text-right"
                    style={{
                      color: isNew
                        ? "var(--color-danger)"
                        : "var(--color-warning)",
                    }}
                  >
                    {noisyProb}
                  </td>
                  <td className="hidden px-3 py-1.5 text-subtle sm:table-cell">
                    {note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
