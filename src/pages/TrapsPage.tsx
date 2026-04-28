/**
 * TrapsPage.tsx — Demos of the quantum verification protocol "traps".
 *
 * Each trap illustrates a strategy a dishonest prover might attempt
 * and how the verifier detects it by measuring the Hamiltonian energy.
 */

import { Fragment } from "react";
import { ClassicalStateTrap } from "../modules/traps/components/ClassicalStateTrap";
import { FinalStateTrap } from "../modules/traps/components/FinalStateTrap";
import { TrapCard } from "../modules/traps/components/TrapCard";

// ── Trap definitions ─────────────────────────────────────────────────────────

type ActiveTrap = { kind: "active"; key: string; node: React.ReactNode };
type PendingTrap = {
  kind: "pending";
  id: string;
  title: string;
  description: string;
};
type TrapEntry = ActiveTrap | PendingTrap;

const TRAPS: TrapEntry[] = [
  {
    kind: "active",
    key: "classicalStateTrap",
    node: <ClassicalStateTrap />,
  },
  {
    kind: "active",
    key: "finalStateTrap",
    node: <FinalStateTrap />,
  },
];

export function TrapsPage() {
  return (
    <div className="space-y-6">
      <p className="text-[13px]" style={{ color: "#9490a8" }}>
        The quantum verification protocol detects dishonest provers by measuring
        the clock Hamiltonian energy. An honest prover produces a quantum clock
        state with temporal coherence — any classical shortcut leaves a distinct
        energy signature.
      </p>

      {TRAPS.map((trap) =>
        trap.kind === "active" ? (
          <Fragment key={trap.key}>{trap.node}</Fragment>
        ) : (
          <TrapCard
            key={trap.id}
            id={trap.id}
            title={trap.title}
            description={trap.description}
          />
        ),
      )}
    </div>
  );
}
