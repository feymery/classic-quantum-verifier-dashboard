/**
 * EnergyGauge.tsx — Visual energy meter with accept/reject zones.
 *
 * Renders a horizontal bar from 0 → 1 with:
 *   - green zone: E < 0.4 (accept)
 *   - amber zone: 0.4 ≤ E < 0.5 (marginal)
 *   - red zone:   E ≥ 0.5 (reject)
 *   - a needle marker at the current energy value
 */

import { THRESHOLD_LOW, THRESHOLD_HIGH } from "../../../utils/constants";

interface Props {
  energy: number;
  energyTheory: number;
}

function zone(e: number): { color: string; label: string } {
  if (e < THRESHOLD_LOW) return { color: "#34d399", label: "ACCEPTED" };
  if (e < THRESHOLD_HIGH) return { color: "#f59e0b", label: "MARGINAL" };
  return { color: "#f87171", label: "REJECTED" };
}

export function EnergyGauge({ energy, energyTheory }: Props) {
  const { color, label } = zone(energy);
  const clampedPct = Math.min(100, Math.max(0, energy * 100));
  const theoryPct = Math.min(100, Math.max(0, energyTheory * 100));

  return (
    <div className="space-y-2">
      {/* Track */}
      <div
        className="relative h-5 w-full overflow-hidden rounded-lg"
        style={{ background: "#2d2b3a" }}
      >
        {/* Accept zone */}
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${THRESHOLD_LOW * 100}%`,
            background: "rgba(52,211,153,0.15)",
          }}
        />
        {/* Marginal zone */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${THRESHOLD_LOW * 100}%`,
            width: `${(THRESHOLD_HIGH - THRESHOLD_LOW) * 100}%`,
            background: "rgba(245,158,11,0.15)",
          }}
        />
        {/* Reject zone */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${THRESHOLD_HIGH * 100}%`,
            right: 0,
            background: "rgba(248,113,113,0.15)",
          }}
        />

        {/* Theoretical dot */}
        <div
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-lg opacity-60"
          style={{ left: `${theoryPct}%`, background: "#a78bfa" }}
        />

        {/* Energy needle */}
        <div
          className="absolute top-0 h-full w-1 -translate-x-1/2 rounded-lg transition-all duration-500"
          style={{ left: `${clampedPct}%`, background: color }}
        />

        {/* Threshold lines */}
        <div
          className="absolute top-0 h-full w-px opacity-40"
          style={{ left: `${THRESHOLD_LOW * 100}%`, background: "#34d399" }}
        />
        <div
          className="absolute top-0 h-full w-px opacity-40"
          style={{ left: `${THRESHOLD_HIGH * 100}%`, background: "#f87171" }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="rounded-lg px-2 py-0.5  text-[10px] font-semibold"
            style={{ background: `${color}20`, color }}
          >
            {label}
          </span>
          <span className=" text-[11px]" style={{ color: "#ddd9ee" }}>
            E = {energy.toFixed(3)}
          </span>
        </div>
        <span className=" text-[10px]" style={{ color: "#6b6780" }}>
          theory: {energyTheory.toFixed(3)}
        </span>
      </div>
    </div>
  );
}
