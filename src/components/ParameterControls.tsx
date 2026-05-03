import type { ChangeEvent } from "react";
import type { Backend } from "../utils/constants";
import { AlphaControl } from "./AlphaControl/AlphaControl";
import { BackendSelector } from "./BackendSelector";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

interface ParameterControlsProps {
  alpha: number;
  shots: number;
  noiseLambda: number;
  alphaFake: number;
  selectedBackend: string;
  backends: Backend[];
  backendStatus: string;
  setAlpha: (value: number) => void;
  onShotsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNoiseLambdaChange: (value: number) => void;
  onAlphaFakeChange: (value: number) => void;
  onBackendChange: (selected: string) => void;
}

export function ParameterControls({
  alpha,
  shots,
  noiseLambda,
  alphaFake,
  selectedBackend,
  backends,
  backendStatus,
  setAlpha,
  onShotsChange,
  onNoiseLambdaChange,
  onAlphaFakeChange,
  onBackendChange,
}: ParameterControlsProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.55fr_0.95fr]">
      <AlphaControl alpha={alpha} setAlpha={setAlpha} />

      <div className="space-y-3">
        <BackendSelector
          backends={backends}
          selectedBackend={selectedBackend}
          backendStatus={backendStatus}
          onChange={onBackendChange}
        />

        <Card
          className="rounded-lg"
          padded="lg"
          style={{ background: "var(--color-surface)" }}
        >
          <Text
            variant="label"
            color="muted"
            className="mb-4 tracking-[0.3em] text-subtle"
          >
            Experiment inputs
          </Text>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Shots
              </label>
              <input
                type="number"
                value={shots}
                onChange={onShotsChange}
                className="w-full px-4 py-3 mt-2 text-sm border border-border bg-elevated text-foreground outline-none rounded-lg"
              />
            </div>

            <div>
              <div className="mb-2 text-sm text-subtle">Noise λ</div>
              <input
                type="range"
                value={noiseLambda}
                min={0}
                max={0.5}
                step={0.005}
                onChange={(event) =>
                  onNoiseLambdaChange(Number(event.target.value))
                }
                className="w-full cursor-pointer accent-accent"
              />
              <div className="mt-2 text-sm text-muted">
                {noiseLambda.toFixed(3)}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm text-subtle">Fake prover α</div>
              <input
                type="range"
                value={alphaFake}
                min={0}
                max={Math.PI / 2}
                step={0.001}
                onChange={(event) =>
                  onAlphaFakeChange(Number(event.target.value))
                }
                className="w-full cursor-pointer accent-accent"
              />
              <div className="mt-2 text-sm text-muted">
                {alphaFake.toFixed(4)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
