/**
 * TrapsPage.tsx — Adversarial scenario explorer.
 *
 * One compact ideal-state reference strip, then a tab selector
 * that shows a single adversarial scenario at a time.
 */

import { useState } from "react";
import { Card } from "../ui";
import { useAppState } from "../state/useAppState";
import BitFlipTrap from "../components/adversarial/components/BitFlipTrap";
import ClassicalStateTrap from "../components/adversarial/components/ClassicalStateTrap";
import DepolarizingTrap from "../components/adversarial/components/DepolarizingTrap";

const SCENARIOS = [
  { id: 0, n: "1", label: "Classical State" },
  { id: 1, n: "2", label: "Depolarizing Noise" },
  { id: 2, n: "3", label: "Bit-Flip Error" },
] as const;

export function TrapsPage() {
  const {
    dashboard: { alpha },
  } = useAppState();

  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      {/* ── Scenario selector ── */}
      <div className="grid grid-cols-3 gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
              active === s.id
                ? "border-accent bg-accent/8 shadow-sm"
                : "border-border bg-surface hover:border-accent/40 hover:bg-elevated"
            }`}
          >
            <span
              className={`block text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
                active === s.id ? "text-accent" : "text-subtle"
              }`}
            >
              Scenario {s.n}
            </span>
            <span
              className={`text-[12px] font-medium ${
                active === s.id ? "text-foreground" : "text-muted"
              }`}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Active scenario ── */}
      <Card padded="lg">
        {active === 0 && <ClassicalStateTrap alpha={alpha} />}
        {active === 1 && <DepolarizingTrap />}
        {active === 2 && <BitFlipTrap alpha={alpha} />}
      </Card>
    </div>
  );
}
