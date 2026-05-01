import { ParamField } from "./ParamField";

export interface HeaderStripProps {
  // params
  alpha: number;
  shots: number;
  onAlphaChange: (value: number) => void;
  onShotsChange: (value: number) => void;
  // info
  energy: string;
  latestJobId: string | null;
}

export function HeaderStrip({
  alpha,
  shots,
  onAlphaChange,
  onShotsChange,
}: HeaderStripProps) {
  return (
    <div className="flex flex-col justify-between gap-4 pt-2 text-xs border-t border-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-row gap-2">
          <ParamField
            id="header-alpha"
            label="α"
            value={alpha}
            min={0}
            max={Math.PI / 2}
            step={0.0001}
            decimals={4}
            onChange={onAlphaChange}
          />
          <ParamField
            id="header-shots"
            label="shots"
            value={shots}
            min={1}
            max={65536}
            step={1}
            decimals={0}
            onChange={onShotsChange}
          />
        </div>
      </div>
    </div>
  );
}
