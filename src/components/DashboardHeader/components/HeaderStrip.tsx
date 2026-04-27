import { ParamField } from "./ParamField";
import { Button } from "../../../ui/Button";

export interface HeaderStripProps {
  // params
  alpha: number;
  shots: number;
  onAlphaChange: (value: number) => void;
  onShotsChange: (value: number) => void;
  // info
  energy: string;
  latestJobId: string | null;
  onOpenHistory: () => void;
}

export function HeaderStrip({
  alpha,
  shots,
  onAlphaChange,
  onShotsChange,
  energy,
  latestJobId,
  onOpenHistory,
}: HeaderStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 mt-2 text-xs border-t border-border">
      <div className="flex flex-wrap items-center gap-3">
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

      <div className="flex flex-wrap items-center gap-4 text-muted">
        <span className="text-amber-300">E = {energy}</span>
        <span className={latestJobId ? "text-emerald-300" : ""}>
          last job = {latestJobId ?? "--"}
        </span>
        <Button onClick={onOpenHistory} className="px-3 py-1 rounded">
          History
        </Button>
      </div>
    </div>
  );
}
