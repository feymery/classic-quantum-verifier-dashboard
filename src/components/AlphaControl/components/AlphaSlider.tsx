import { useCallback, useRef } from "react";
import { KEY_ALPHAS } from "../../../utils/constants";
import {
  alphaToPercent,
  percentToAlpha,
  snapToKey,
  nearestKeyIndex,
} from "../../../utils/alphaUtils";

interface AlphaSliderProps {
  alpha: number;
  onChange: (v: number) => void;
  guidedMode: boolean;
}

export function AlphaSlider({ alpha, onChange, guidedMode }: AlphaSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const keyValues = KEY_ALPHAS.map((k) => k.value);
  const snappedIdx = guidedMode ? nearestKeyIndex(alpha, keyValues) : -1;
  const fillPct = alphaToPercent(alpha);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = percentToAlpha(parseFloat(e.target.value));
      const next = guidedMode ? snapToKey(raw, keyValues) : raw;
      onChange(next);
    },
    [guidedMode, onChange, keyValues],
  );

  return (
    <div className="relative w-full select-none" ref={trackRef}>
      {/* ── Track background ── */}
      <div className="relative h-1.5 w-full rounded-lg bg-border mt-2 mb-1">
        {/* Filled portion */}
        <div
          className="absolute top-0 left-0 h-full transition-all duration-75 rounded-lg"
          style={{
            width: `${fillPct}%`,
            background:
              snappedIdx >= 0 ? KEY_ALPHAS[snappedIdx].color : "#a78bfa",
          }}
        />

        {/* Tick marks for key alphas */}
        {KEY_ALPHAS.map((ka, i) => {
          const pct = alphaToPercent(ka.value);
          const isSnapped = snappedIdx === i;
          return (
            <div
              key={ka.label}
              className="absolute transition-all duration-150 -translate-x-1/2 -translate-y-1/2 top-1/2"
              style={{ left: `${pct}%` }}
            >
              {/* Tick dot */}
              <div
                className="w-2 h-2 transition-all duration-150 border rounded-lg"
                style={{
                  background: isSnapped ? ka.color : "#181620",
                  borderColor: ka.color,
                  boxShadow: isSnapped ? `0 0 8px ${ka.color}` : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Native range input (invisible, on top) ── */}
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={fillPct}
        onChange={handleChange}
        aria-label="Alpha parameter"
        aria-valuetext={`alpha = ${alpha.toFixed(4)}`}
        className="absolute inset-0 w-full h-6 bg-transparent opacity-0 appearance-none cursor-pointer -top-2"
      />

      {/* ── Tick labels below ── */}
      <div className="relative w-full h-6 mt-2">
        {KEY_ALPHAS.map((ka, i) => {
          const pct = alphaToPercent(ka.value);
          const isSnapped = snappedIdx === i;
          return (
            <div
              key={ka.label}
              className="absolute -translate-x-1/2 flex flex-col items-center gap-0.5"
              style={{ left: `${pct}%` }}
            >
              <span
                className=" text-[10px] leading-none transition-colors duration-150"
                style={{ color: isSnapped ? ka.color : "#6b6780" }}
              >
                {ka.label}
              </span>
              {isSnapped && (
                <span
                  className=" text-[9px] leading-none whitespace-nowrap"
                  style={{ color: ka.color + "aa" }}
                >
                  {ka.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
