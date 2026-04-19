/**
 * TrapsPage.tsx — Demos de las tres "trampas" del protocolo de verificación cuántica.
 *
 * Cada trampa ilustra una estrategia que un probador deshonesto podría intentar
 * y cómo el verificador la detecta midiendo la energía del Hamiltoniano.
 */

import { Fragment } from "react";
import { Trap1Card } from "../components/Trap1Card";
import { TrapCard } from "../components/TrapCard";

// ── Definición de trampas ─────────────────────────────────────────────────────

type ActiveTrap = { kind: "active"; key: string; node: React.ReactNode };
type PendingTrap = {
  kind: "pending";
  id: string;
  title: string;
  description: string;
};
type TrapEntry = ActiveTrap | PendingTrap;

const TRAPS: TrapEntry[] = [
  { kind: "active", key: "trap1", node: <Trap1Card /> },
  {
    kind: "pending",
    id: "Trampa 2",
    title: "Estado Separable Falso",
    description:
      "El probador intenta imitar el estado de reloj con un estado producto separable ρ = ρ_A ⊗ ρ_B. Las correlaciones cruzadas Z₁X₂ revelan la falta de entrelazamiento genuino.",
  },
  {
    kind: "pending",
    id: "Trampa 3",
    title: "Ángulo Equivocado",
    description:
      "El probador aplica U(α′) con un ángulo α′ ≠ α. El verificador, que conoce α, detecta la discrepancia a través de la energía fuera de la curva E(α) esperada.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function TrapsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
            style={{ background: "#1e1c2a", color: "#6b6780" }}
          >
            capa física
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "#4b4860" }}
          >
            módulo de trampas
          </span>
        </div>
        <h1
          className="font-mono text-xl font-bold"
          style={{ color: "#ddd9ee" }}
        >
          Trampas del Protocolo
        </h1>
        <p className="mt-1 max-w-2xl text-[13px]" style={{ color: "#9490a8" }}>
          El protocolo de verificación cuántica detecta probadores deshonestos
          midiendo la energía del Hamiltoniano de tiempo. Un probador honesto
          produce un estado de reloj cuántico con coherencia temporal —
          cualquier atajo clásico deja una firma energética distinta.
        </p>
      </div>

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
