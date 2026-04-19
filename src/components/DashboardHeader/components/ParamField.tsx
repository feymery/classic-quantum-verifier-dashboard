export interface ParamFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  decimals: number;
  onChange: (value: number) => void;
}

export function ParamField({
  id,
  label,
  value,
  min,
  max,
  step,
  decimals,
  onChange,
}: ParamFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-[0.2em] text-muted select-none"
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value.toFixed(decimals)}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        className="w-24 px-3 py-2 text-sm border rounded-lg outline-none border-border bg-surface text-foreground"
      />
    </div>
  );
}
