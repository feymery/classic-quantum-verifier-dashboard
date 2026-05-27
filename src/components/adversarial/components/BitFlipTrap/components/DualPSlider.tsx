/**
 * DualPSlider.tsx
 *
 * Two independent bit-flip probability sliders — one for the clock qubit,
 * one for the work qubit, displayed side by side.
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
    <div>
      <SectionLabel>Bit-flip probabilities</SectionLabel>
      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* ── Clock qubit ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "#a78bfa" }}
              />
              <span className="text-[11px] font-medium text-foreground">
                Clock
              </span>
              <span
                className="font-mono text-[11px]"
                style={{ color: "#a78bfa" }}
              >
                p_c={pClock.toFixed(2)}
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
          <div className="flex justify-between text-[9px] text-subtle">
            <span>0</span>
            <span>0.5 max</span>
          </div>
        </div>

        {/* ── Work qubit ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "#f59e0b" }}
              />
              <span className="text-[11px] font-medium text-foreground">
                Work
              </span>
              <span
                className="font-mono text-[11px]"
                style={{ color: "#f59e0b" }}
              >
                p_w={pWork.toFixed(2)}
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
          <div className="flex justify-between text-[9px] text-subtle">
            <span>0</span>
            <span>0.5 max</span>
          </div>
        </div>
      </div>
    </div>
  );
}
