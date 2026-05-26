import { ParamField } from "./ParamField";

export interface HeaderStripProps {
  // params
  shots: number;
  onShotsChange: (value: number) => void;
}

export function HeaderStrip({ shots, onShotsChange }: HeaderStripProps) {
  return (
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
  );
}
