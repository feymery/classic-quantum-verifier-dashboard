import { useMemo } from "react";
import { analyseNoise } from "../../physics/noise";
import { NoiseSweepPlot } from "../charts/NoiseSweepPlot";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { CritLambdaRow, LegendDot, StatCell, StepTag } from "./components/NoisePanelParts";

interface NoisePanelProps {
  alpha: number;
  noiseLambda: number;
  onNoiseLambdaChange: (v: number) => void;
}

export function NoisePanel({
  alpha,
  noiseLambda,
  onNoiseLambdaChange,
}: NoisePanelProps) {
  const analysis = useMemo(
    () => analyseNoise(alpha, noiseLambda),
    [alpha, noiseLambda],
  );

  const decisionColor =
    analysis.decision === "accept"
      ? "#34d399"
      : analysis.decision === "reject"
        ? "#f87171"
        : "#f59e0b";

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StepTag>step F</StepTag>
            <span className="text-xs font-medium" style={{ color: "#ddd9ee" }}>
              Noise Model
            </span>
          </div>
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            depolarising channel
          </span>
        </div>

        {/* Lambda control */}
        <div
          className="p-3 border rounded"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className=" text-[10px]" style={{ color: "#6b6780" }}>
              λ depolarising noise
            </span>
            <span className=" text-[11px]" style={{ color: "#a78bfa" }}>
              {noiseLambda.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={0.3}
            step={0.005}
            value={noiseLambda}
            onChange={(e) => onNoiseLambdaChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg cursor-pointer appearance-none bg-border accent-accent shadow-inner shadow-black/30"
            aria-label="Depolarising noise lambda"
          />
          <div className="flex items-center gap-1.5 mt-2">
            {[0, 0.05, 0.1, 0.2, 0.3].map((value) => (
              <Button
                key={value}
                onClick={() => onNoiseLambdaChange(value)}
                variant="secondary"
                size="sm"
                className="rounded px-2 py-0.5  text-[9px] font-normal"
                style={{
                  borderColor:
                    Math.abs(noiseLambda - value) < 0.001
                      ? "#a78bfa"
                      : "#2d2b3a",
                  background:
                    Math.abs(noiseLambda - value) < 0.001
                      ? "rgba(167,139,250,0.15)"
                      : "transparent",
                  color:
                    Math.abs(noiseLambda - value) < 0.001
                      ? "#a78bfa"
                      : "#9490a8",
                }}
              >
                {value.toFixed(2)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 gap-px overflow-hidden border rounded"
          style={{ borderColor: "#2d2b3a" }}
        >
          <StatCell
            label="λ (noise param)"
            value={noiseLambda.toFixed(3)}
            color="#a78bfa"
          />
          <StatCell
            label="theoretical E = sin²(α)"
            value={analysis.theoretical.toFixed(4)}
            color="#a78bfa"
          />
          <StatCell
            label="noisy E"
            value={analysis.noisy.toFixed(4)}
            color="#e8a020"
          />
          <StatCell
            label="deviation"
            value={`${analysis.deviation >= 0 ? "+" : ""}${analysis.deviation.toFixed(4)}  (${analysis.deviationPct.toFixed(1)}%)`}
            color={analysis.deviation < -0.02 ? "#f87171" : "#9490a8"}
          />
        </div>

        {/* Verifier decision */}
        <div
          className="flex items-center justify-between px-3 py-2 border rounded"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            verifier decision at current noise
          </span>
          <span
            className="text-xs font-semibold tracking-widest "
            style={{ color: decisionColor }}
          >
            {analysis.decision.toUpperCase()}
          </span>
        </div>

        {/* Critical lambda info */}
        <div className="space-y-1">
          <CritLambdaRow
            label="λ boundary (accept → boundary)"
            value={analysis.critLambdaAccept}
            threshold="0.5"
            color="#f59e0b"
            current={noiseLambda}
          />
          <CritLambdaRow
            label="λ reject  (boundary → reject)"
            value={analysis.critLambdaReject}
            threshold="0.4"
            color="#f87171"
            current={noiseLambda}
          />
        </div>

        {/* Energy formula */}
        <div
          className="px-3 py-2 border rounded"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <span className=" text-[10px]" style={{ color: "#6b6780" }}>
            E_noisy = 0.5 + (1 − λ) · (sin²(α) − 0.5)
          </span>
        </div>

        {/* Sweep chart */}
        <div>
          <p className=" text-[10px] mb-2" style={{ color: "#6b6780" }}>
            energy vs λ sweep — vertical line = current λ
          </p>
          <NoiseSweepPlot alpha={alpha} lambda={noiseLambda} />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <LegendDot color="#a78bfa" label="theoretical (flat)" dashed />
          <LegendDot color="#e8a020" label="noisy E(λ)" />
          <LegendDot color="#f59e0b" label="boundary 0.5" dashed />
          <LegendDot color="#f87171" label="reject 0.4" dashed />
        </div>
      </div>
    </Card>
  );
}
