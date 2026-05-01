import { ExpectationTable } from "./components/ExpectationTable";
import { EnergySummary } from "./components/EnergySummary";
import { CountsDisplay } from "./components/CountsDisplay";
import { buildClockState } from "../../physics/hamiltonian";
import { exactExpectations } from "../../physics/measurements";
import type { ExperimentResult } from "../../../../types/experiment";
import type { RunnerStatus } from "../../../../types/runner";
import { Card } from "../../../../ui/Card";
import { Text } from "../../../../ui/Text";

interface MeasurementPanelProps {
  alpha: number;
  shots: number;
  result: ExperimentResult | null;
  status: RunnerStatus;
  error: string | null;
}

export function MeasurementPanel({
  alpha,
  shots,
  result,
  status,
  error,
}: MeasurementPanelProps) {
  // Compute exact values inline for the "exact" comparison column
  const psi = buildClockState(alpha);
  const exact = exactExpectations(psi);

  const isLoading = status === "running";

  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-4">
        {/* Header */}
        <Text variant="title" className="text-xs font-medium text-foreground">
          Measurement Results
        </Text>

        {/* Error state */}
        {error && (
          <div className="px-3 py-2 border rounded border-danger/30 bg-danger/5">
            <Text color="error" className="text-sm">
              {error}
            </Text>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Expectation values */}
        <section>
          <SectionLabel>expectation values</SectionLabel>
          <ExpectationTable
            sampled={result?.expectationValues ?? null}
            exact={exact}
            loading={isLoading}
          />
        </section>

        {/* Divider */}
        <div className="border-t border-elevated" />

        {/* Energy summary */}
        <section className="space-y-1.5">
          <SectionLabel>energy estimation</SectionLabel>
          <EnergySummary
            analysis={result?.energy ?? null}
            loading={isLoading}
          />
        </section>

        {/* Divider */}
        <div className="border-t border-elevated" />

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
    <span className="text-[10px] uppercase tracking-widest text-subtle">
      {children}
    </span>
  );
}
