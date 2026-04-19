import { ParamField } from "./ParamField";

export interface ParameterRowProps {
  alpha: number;
  shots: number;
  noiseLambda: number;
  onAlphaChange: (value: number) => void;
  onShotsChange: (value: number) => void;
  onNoiseLambdaChange: (value: number) => void;
}

export function ParameterRow({
  alpha,
  shots,
  noiseLambda,
  onAlphaChange,
  onShotsChange,
  onNoiseLambdaChange,
}: ParameterRowProps) {
  return (
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
      <ParamField
        id="header-noise"
        label="λ"
        value={noiseLambda}
        min={0}
        max={0.5}
        step={0.001}
        decimals={3}
        onChange={onNoiseLambdaChange}
      />
    </div>
  );
}
