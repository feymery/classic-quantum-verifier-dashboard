/**
 * DualPSlider.tsx
 *
 * Two independent bit-flip probability sliders — one for the clock qubit,
 * one for the work qubit. Replaces the old single-slider + FlipTargetSelector.
 *
 * Visual cues:
 *   - Clock slider: violet (#a78bfa), dynamic p_crit tick, SAFE / REJECTS badge
 *   - Work slider:  amber  (#f59e0b), dynamic p_crit tick, SAFE / REJECTS badge
 */

import { Slider } from "../../../../../ui";
import { P_MAX, P_STEP } from "../BitFlipTrap.constants";
import { SectionLabel } from "../../../shared/SectionLabel";

interface Props {
  pClock: number;
  setPClock: (v: number) => void;
  pWork: number;
  setPWork: (v: number) => void;
  pCritClock: number;
  pCritWork: number;
}

const P_CRIT_FALLBACK = 0.5;

export function DualPSlider({
  pClock,
  setPClock,
  pWork,
  setPWork,
  pCritClock,
  pCritWork,
}: Props) {
  const clockPct = (pClock / P_MAX) * 100;
  const workPct = (pWork / P_MAX) * 100;
  const clockRejects = pClock >= pCritClock;
  const workRejects = pWork >= pCritWork;

  return (
    <div className="space-y-5">
      <SectionLabel>Bit-flip probabilities</SectionLabel>

      {/* ── Clock qubit ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "#a78bfa" }}
            />
            <span className="text-[11px] font-medium text-foreground">
              Clock qubit
            </span>
            <span
              className="font-mono text-[11px]"
              style={{ color: "#a78bfa" }}
            >
              p_c = {pClock.toFixed(2)}
            </span>
          </div>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              clockRejects
                ? "bg-danger/15 text-danger"
                : "bg-success/15 text-success"
            }`}
          >
            {clockRejects ? "REJECTS" : "SAFE"}
          </span>
        </div>

        {/* Slider with p_crit tick overlay */}
        <div className="relative">
          <Slider
            min={0}
            max={P_MAX}
            step={P_STEP}
            value={pClock}
            onChange={(e) => setPClock(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #a78bfa 0%, #a78bfa ${clockPct}%, var(--color-border) ${clockPct}%, var(--color-border) 100%)`,
            }}
          />
          {/* p_crit tick */}
          <div
            className="pointer-events-none absolute top-0 h-full"
            style={{ left: `${(pCritClock / P_MAX) * 100}%` }}
          >
            <div
              className="absolute top-1/2 h-3 w-px -translate-y-1/2"
              style={{ background: "#ef4444", opacity: 0.7 }}
            />
          </div>
        </div>

        <div className="flex justify-between text-[9px] text-subtle">
          <span>0 — ideal</span>
          <span
            style={{
              color: "#ef4444",
              opacity: 0.8,
              position: "relative",
              left: `${(pCritClock / P_MAX) * 100 - 50}%`,
            }}
          >
            p_crit ≈ {pCritClock.toFixed(3)}
          </span>
          <span>0.5 — max</span>
        </div>
      </div>

      {/* ── Work qubit ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "#f59e0b" }}
            />
            <span className="text-[11px] font-medium text-foreground">
              Work qubit
            </span>
            <span
              className="font-mono text-[11px]"
              style={{ color: "#f59e0b" }}
            >
              p_w = {pWork.toFixed(2)}
            </span>
          </div>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              workRejects
                ? "bg-danger/15 text-danger"
                : "bg-success/15 text-success"
            }`}
          >
            {workRejects ? "REJECTS" : "SAFE"}
          </span>
        </div>
        <div className="relative">
          <Slider
            min={0}
            max={P_MAX}
            step={P_STEP}
            value={pWork}
            onChange={(e) => setPWork(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${workPct}%, var(--color-border) ${workPct}%, var(--color-border) 100%)`,
            }}
          />
          {/* p_crit tick */}
          <div
            className="pointer-events-none absolute top-0 h-full"
            style={{ left: `${(pCritWork / P_MAX) * 100}%` }}
          >
            <div
              className="absolute top-1/2 h-3 w-px -translate-y-1/2"
              style={{ background: "#ef4444", opacity: 0.7 }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-subtle">
          <span>0 — ideal</span>
          <span
            style={{
              color: "#ef4444",
              opacity: 0.8,
              position: "relative",
              left: `${(pCritWork / P_MAX) * 100 - 50}%`,
            }}
          >
            p_crit ≈ {pCritWork.toFixed(3)}
          </span>
          <span>0.5 — max</span>
        </div>
      </div>
    </div>
  );
}
