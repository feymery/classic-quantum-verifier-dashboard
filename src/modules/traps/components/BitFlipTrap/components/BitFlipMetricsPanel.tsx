/**
 * BitFlipMetricsPanel.tsx
 *
 * Subsección de métricas para la trap de Bit-Flip Error.
 *
 * Agrupa cuatro gráficos pedagógicos que muestran cómo el canal de bit-flip
 * afecta al circuito y cómo varía el resultado al cambiar p y los shots:
 *
 *  1. Distribución final de resultados (barras agrupadas por escenario)
 *  2. P(resultado correcto) vs p
 *  3. Energía esperada ⟨E⟩ vs p
 *  4. Estimador ⟨Z₁Z₂⟩ vs shots (convergencia estadística ± 1σ)
 */

import { useMemo } from "react";
import {
  computeNoisyDistribution,
  computeObservables,
} from "../BitFlipTrap.physics";
import type { FlipTarget } from "../BitFlipTrap.types";
import { BitFlipDistributionChart } from "./BitFlipDistributionChart";
import { BitFlipProbabilityVsP } from "./BitFlipProbabilityVsP";
import { BitFlipEnergyVsP } from "./BitFlipEnergyVsP";
import { BitFlipEnergyVsShots } from "./BitFlipEnergyVsShots";

interface Props {
  alpha: number;
  p: number;
  shots: number;
  target: FlipTarget;
}

export function BitFlipMetricsPanel({ alpha, p, shots, target }: Props) {
  const noisyDist = useMemo(
    () => computeNoisyDistribution(alpha, p, target),
    [alpha, p, target],
  );
  const theoreticalZ1Z2 = useMemo(
    () => computeObservables(alpha, p, target).Z1Z2,
    [alpha, p, target],
  );

  return (
    <div className="mt-6 rounded-lg border border-border bg-elevated p-5">
      {/* ── Header ── */}
      <div className="mb-5 flex items-center gap-2">
        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
          Métricas
        </span>
        <h3 className="text-[13px] font-semibold text-foreground">
          Análisis del bit-flip
        </h3>
        <span className="text-[10px] text-subtle">
          — p = {p.toFixed(2)} · {shots.toLocaleString()} shots · {target}
        </span>
      </div>

      {/* ── Chart grid ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* 1 · Distribución final */}
        <div className="rounded-md border border-border bg-canvas p-4">
          <BitFlipDistributionChart alpha={alpha} p={p} />
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Compara las probabilidades de cada estado base para los cuatro
            escenarios. Con{" "}
            <span className="font-mono text-foreground">p = 0</span> todo el
            peso reside en{" "}
            <span className="font-mono text-foreground">|00⟩</span> y{" "}
            <span className="font-mono text-foreground">|11⟩</span>. Al subir{" "}
            <span className="font-mono text-foreground">p</span>, parte de la
            población se escapa hacia los estados de error{" "}
            <span className="font-mono text-foreground">|01⟩</span> y{" "}
            <span className="font-mono text-foreground">|10⟩</span>, señal
            directa de que el canal X ha actuado.
          </p>
        </div>

        {/* 2 · P_correct vs p */}
        <div className="rounded-md border border-border bg-canvas p-4">
          <BitFlipProbabilityVsP alpha={alpha} p={p} />
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Para un flip en un único qubit la probabilidad de obtener un
            resultado correcto cae linealmente:{" "}
            <span className="font-mono text-foreground">(1 − p)</span>. Cuando
            ambos qubits se ven afectados la caída es cuadrática:{" "}
            <span className="font-mono text-foreground">(1−p)² + p²</span>, con
            un mínimo en{" "}
            <span className="font-mono text-foreground">p = 0.5</span> donde los
            cuatro estados son equiprobables.
          </p>
        </div>

        {/* 3 · E vs p */}
        <div className="rounded-md border border-border bg-canvas p-4">
          <BitFlipEnergyVsP alpha={alpha} p={p} />
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Los correladores de Pauli{" "}
            <span className="font-mono text-foreground">⟨Z₁X₂⟩</span>,{" "}
            <span className="font-mono text-foreground">⟨X₁X₂⟩</span> y{" "}
            <span className="font-mono text-foreground">⟨Z₁Z₂⟩</span> se atenúan
            por un factor{" "}
            <span className="font-mono text-foreground">(1 − 2p)</span> por cada
            qubit afectado. Esto sube la energía del Hamiltoniano. La línea
            punteada roja marca el umbral de rechazo: cualquier curva que lo
            cruce implica que el verificador rechaza al demostrador.
          </p>
        </div>

        {/* 4 · E vs shots */}
        <div className="rounded-md border border-border bg-canvas p-4">
          <BitFlipEnergyVsShots
            noisyDist={noisyDist}
            theoreticalZ1Z2={theoreticalZ1Z2}
          />
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            La banda ±1σ se estrecha con la raíz cuadrada de los shots:{" "}
            <span className="font-mono text-foreground">σ ∝ 1/√N</span>. Más
            shots reducen la incertidumbre estadística, pero la diferencia
            sistemática entre la media muestral y el valor ideal (
            <span className="font-mono text-foreground">bias = f(p)</span>)
            permanece invariante: más disparos no "curan" el error de bit-flip.
          </p>
        </div>
      </div>
    </div>
  );
}
