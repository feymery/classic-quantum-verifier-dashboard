import type { InputHTMLAttributes } from "react";

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  valueDisplay?: string;
}

export function Slider({
  label,
  valueDisplay,
  className,
  ...props
}: SliderProps) {
  return (
    <div className="space-y-1.5">
      {(label || valueDisplay) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[10px] uppercase tracking-widest text-subtle">
              {label}
            </span>
          )}
          {valueDisplay && (
            <span className="text-[11px] font-medium text-accent">
              {valueDisplay}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        className={[
          "w-full h-1.5 appearance-none rounded-full cursor-pointer",
          "bg-border",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-accent",
          "[&::-webkit-slider-thumb]:transition-colors",
          "[&::-webkit-slider-thumb]:hover:bg-accent-light",
          "[&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5",
          "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
          "[&::-moz-range-thumb]:bg-accent",
          className ?? "",
        ].join(" ")}
        {...props}
      />
    </div>
  );
}
