import { Slider } from "../../../../../ui";
import { P_MAX, P_STEP } from "../BitFlipTrap.constants";
import { SectionLabel } from "../../../shared/SectionLabel";

interface Props {
  p: number;
  setP: (v: number) => void;
}

function pColor(p: number): string {
  const t = Math.min(1, p / P_MAX);
  const r = Math.round(245 + (248 - 245) * t);
  const g = Math.round(158 + (113 - 158) * t);
  const b = Math.round(11 + (113 - 11) * t);
  return `rgb(${r},${g},${b})`;
}

export function ProbabilitySlider({ p, setP }: Props) {
  const pct = (p / P_MAX) * 100;
  const color = pColor(p);
  const trackColor = p > 0.25 ? "var(--color-danger)" : "var(--color-warning)";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionLabel>Bit-flip probability p</SectionLabel>
        <span className="font-mono text-[11px] font-medium" style={{ color }}>
          p = {p.toFixed(2)}
        </span>
      </div>
      <Slider
        min={0}
        max={P_MAX}
        step={P_STEP}
        value={p}
        onChange={(e) => setP(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`,
        }}
      />
      <div className="flex flex-col gap-0.5 text-[10px] text-subtle">
        <span>p = 0 → ideal circuit, no errors</span>
        <span>p = 0.5 → fully random readout, maximum noise</span>
      </div>
    </div>
  );
}
