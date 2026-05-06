/**
 * LambdaSlider.tsx
 * Lambda (λ) rate slider with Stricker best-fit and λ_crit annotations.
 * Uses the app's Slider UI component with a dynamic track gradient.
 */

import { Slider } from "../../../../../ui";
import {
  STRICKER_LAM,
  LAMBDA_MAX,
  PI_HALF,
} from "../DepolarizingTrap.constants";

interface Props {
  lam: number;
  setLam: (v: number) => void;
  lineColor: string;
  lcrit: number;
  alpha: number;
  aboveCrit: boolean;
}

export function LambdaSlider({
  lam,
  setLam,
  lineColor,
  lcrit,
  alpha,
  aboveCrit,
}: Props) {
  const pct = (lam / LAMBDA_MAX) * 100;
  const trackColor = aboveCrit ? "var(--color-danger)" : "var(--color-warning)";

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-subtle">
          Depolarizing rate λ
        </span>
        <span
          className="font-mono text-[11px] font-medium"
          style={{ color: lineColor }}
        >
          λ = {lam.toFixed(2)}
        </span>
      </div>

      {/* Slider — inline style overrides bg-border set by the Slider component */}
      <Slider
        min={0}
        max={LAMBDA_MAX}
        step={0.01}
        value={lam}
        onChange={(e) => setLam(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`,
        }}
      />

      {/* Reference annotations */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--color-muted)" }}
          />
          λ = {STRICKER_LAM.toFixed(2)} — Stricker et al. best fit
        </div>
        <div
          className={`flex items-center gap-1.5 text-[10px] ${
            lcrit > 0 ? "text-danger" : "text-subtle"
          }`}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger" />
          λ_crit({((alpha / PI_HALF) * 90).toFixed(0)}°) = {lcrit.toFixed(3)} —
          verification fails above this
        </div>
      </div>
    </div>
  );
}
