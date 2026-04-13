import { CircuitDiagram } from "../CircuitDiagram";
import { ExtendedMeasurements } from "./ExtendedMeasurements";
import { ComplexityComparison } from "./ComplexityComparison";
import { buildClockState2Q } from "../../physics/hamiltonian2Q";
import { exactExpectations2Q } from "../../physics/measurements2Q";
import type { ExperimentResult2Q } from "../../services/simulate2Q";
import type {
  ExecutionSource,
  RunnerStatus,
} from "../../hooks/useExperimentRunner";
import { Card } from "../../ui/Card";
import { ResultProvenance } from "../ResultProvenance";
import { StepTag } from "./StepTag";
import { ProtocolMappingCard } from "./ProtocolMappingCard";
import { CountsBar8 } from "./CountsBar8";

interface TwoQubitPanelProps {
  alpha: number;
  shots: number;
  result: ExperimentResult2Q | null;
  status: RunnerStatus;
  error: string | null;
  executionSource: ExecutionSource | null;
}

export function TwoQubitPanel({
  alpha,
  shots,
  result,
  status,
  error,
  executionSource,
}: TwoQubitPanelProps) {
  // Always compute exact values for the reference column (no async needed)
  const psi = buildClockState2Q(alpha);
  const exact = exactExpectations2Q(psi);

  const isLoading = status === "running";

  return (
    <div className="space-y-4">
      {/* ── Row 1: Circuit + state summary ── */}
      <Card className="rounded-lg" padded="md">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepTag>step E</StepTag>
              <span
                className="text-xs font-medium"
                style={{ color: "#ddd9ee" }}
              >
                Circuit: 1 clock + 2 work qubits
              </span>
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#6b6780" }}
            >
              H · ctrl-U(α) · CNOT
            </span>
          </div>

          <CircuitDiagram alpha={alpha} />

          {/* Amplitude summary */}
          <div
            className="rounded border p-2.5"
            style={{ borderColor: "#2d2b3a", background: "#181620" }}
          >
            <div className="grid grid-cols-3 gap-3">
              <Amplitude
                label="|000⟩"
                value={`1/√2 = ${(1 / Math.SQRT2).toFixed(4)}`}
                color="#9490a8"
              />
              <Amplitude
                label="|100⟩"
                value={`cos(α)/√2 = ${(Math.cos(alpha) / Math.SQRT2).toFixed(4)}`}
                color="#a78bfa"
              />
              <Amplitude
                label="|111⟩"
                value={`sin(α)/√2 = ${(Math.sin(alpha) / Math.SQRT2).toFixed(4)}`}
                color="#a78bfa"
              />
            </div>
            <p
              className="font-mono text-[9px] mt-2"
              style={{ color: "#6b6780" }}
            >
              all other amplitudes = 0 · little-endian: q₀=clock (MSB), q₂=work2
              (LSB)
            </p>
          </div>

          <ProtocolMappingCard />
        </div>
      </Card>

      {/* ── Row 2: Execution meta (read-only) ── */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px]" style={{ color: "#6b6780" }}>
          read-only
        </span>
      </div>

      {result && (
        <ResultProvenance
          executionSource={executionSource}
          backend={result.backend}
          jobId={result.jobId}
          shotsExecuted={result.shotsExecuted}
        />
      )}

      {/* Error message */}
      {error && (
        <div
          className="px-3 py-2 border rounded"
          style={{
            borderColor: "rgba(248,113,113,0.3)",
            background: "rgba(248,113,113,0.05)",
          }}
        >
          <span className="font-mono text-[11px]" style={{ color: "#f87171" }}>
            {error}
          </span>
        </div>
      )}

      {/* ── Row 3: Measurements + Comparison ── */}
      <div className="grid grid-cols-2 gap-3">
        <ExtendedMeasurements
          sampled={result?.expectationValues ?? null}
          exact={exact}
          energy={result?.energy ?? null}
          loading={isLoading}
        />
        <ComplexityComparison />
      </div>

      {/* ── Row 4: Shot counts histogram ── */}
      {result && <CountsBar8 counts={result.counts} shots={shots} />}
    </div>
  );
}

// ── Micro-components ──────────────────────────────────────────────────────────

function Amplitude({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px]" style={{ color: "#6b6780" }}>
        {label}
      </div>
      <div className="font-mono text-[11px]" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
