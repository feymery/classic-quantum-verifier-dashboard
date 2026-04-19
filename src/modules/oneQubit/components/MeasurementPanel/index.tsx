import { ExpectationTable } from "./ExpectationTable";
import { EnergySummary } from "./EnergySummary";
import { CountsDisplay } from "./CountsDisplay";
import { buildClockState } from "../../physics/hamiltonian";
import { exactExpectations } from "../../physics/measurements";
import type { ExperimentResult } from "../../../../types/experiment";
import type { ExecutionSource, RunnerStatus } from "../../../../types/runner";
import { Badge } from "../../../../ui/Badge";
import { Card } from "../../../../ui/Card";
import { Text } from "../../../../ui/Text";
import { ResultProvenance } from "../../../../components/ResultProvenance";

interface MeasurementPanelProps {
  alpha: number;
  shots: number;
  result: ExperimentResult | null;
  status: RunnerStatus;
  error: string | null;
  executionSource: ExecutionSource | null;
}

export function MeasurementPanel({
  alpha,
  shots,
  result,
  status,
  error,
  executionSource,
}: MeasurementPanelProps) {
  // Compute exact values inline for the "exact" comparison column
  const psi = buildClockState(alpha);
  const exact = exactExpectations(psi);

  const isLoading = status === "running";

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="quantum"
              className="rounded px-1.5 py-0.5  text-[10px]"
            >
              step C
            </Badge>
            <Text
              as="span"
              variant="caption"
              className="text-xs font-medium text-foreground"
            >
              Measurement Results
            </Text>
          </div>
          <Text as="span" variant="caption" style={{ color: "#6b6780" }}>
            read-only
          </Text>
        </div>

        {result && (
          <ResultProvenance
            executionSource={executionSource}
            backend={result.backend}
            jobId={result.jobId}
            shotsExecuted={result.shotsExecuted}
          />
        )}

        {/* Error state */}
        {error && (
          <div
            className="px-3 py-2 border rounded"
            style={{
              borderColor: "rgba(248,113,113,0.3)",
              background: "rgba(248,113,113,0.05)",
            }}
          >
            <span className=" text-[11px]" style={{ color: "#f87171" }}>
              {error}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "#1e1c28" }} />

        {/* Little-endian explanation */}
        <Card
          as="section"
          className="rounded"
          padded="none"
          style={{ borderColor: "#2d2b3a", background: "#181620" }}
        >
          <div className="space-y-1 px-3 py-2.5">
            <SectionLabel>little-endian ordering</SectionLabel>
            <p
              className=" text-[10px] leading-relaxed"
              style={{ color: "#9490a8" }}
            >
              We display basis states as |q0 q1⟩ with q0 = clock qubit (left
              digit) and q1 = work qubit (right digit). Example: |10⟩ means
              clock=1, work=0.
            </p>
          </div>
        </Card>

        {/* Expectation values */}
        <section className="space-y-1.5">
          <SectionLabel>expectation values</SectionLabel>
          <ExpectationTable
            sampled={result?.expectationValues ?? null}
            exact={exact}
            loading={isLoading}
          />
        </section>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "#1e1c28" }} />

        {/* Energy summary */}
        <section className="space-y-1.5">
          <SectionLabel>energy estimation</SectionLabel>
          <EnergySummary
            analysis={result?.energy ?? null}
            loading={isLoading}
          />
        </section>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "#1e1c28" }} />

        {/* Counts */}
        <section className="space-y-1.5">
          <SectionLabel>shot counts</SectionLabel>
          <CountsDisplay
            counts={result?.counts ?? null}
            shots={shots}
            loading={isLoading}
          />
        </section>
      </div>
    </Card>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className=" text-[10px] uppercase tracking-widest"
      style={{ color: "#6b6780" }}
    >
      {children}
    </span>
  );
}
