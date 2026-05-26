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
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs select-none text-muted">
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
        className="w-24 px-3 py-1 text-xs border rounded-lg outline-none border-border bg-surface text-foreground"
      />
    </div>
  );
}
