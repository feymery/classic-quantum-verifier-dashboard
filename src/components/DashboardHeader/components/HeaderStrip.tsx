import { ParamField } from "./ParamField";

export interface HeaderStripProps {
  // params
  shots: number;
  onShotsChange: (value: number) => void;
}

export function HeaderStrip({
  shots,
  onShotsChange,
}: HeaderStripProps) {
  return (
    <div className="flex flex-col justify-between gap-4 pt-2 text-xs border-t border-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-row items-center justify-center w-full">
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
