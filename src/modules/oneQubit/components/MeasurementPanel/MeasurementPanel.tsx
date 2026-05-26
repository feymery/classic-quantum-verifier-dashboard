import { useMemo } from "react";
import { ExpectationTable } from "./components/ExpectationTable";
import { BasisMeasurementSection } from "./components/BasisMeasurementSection";
import { buildClockState } from "../../physics/hamiltonian";
import {
  exactExpectations,
  expectedBasisProbabilities,
} from "../../physics/measurements";
import type { ExperimentResult } from "../../../../types/experiment";
import type { RunnerStatus } from "../../../../types/runner";
import { Card } from "../../../../ui/Card";
import { Text } from "../../../../ui/Text";
import { BASIS_STATE_COLORS } from "../../../../components/charts/chartTheme";

// ── Constants ─────────────────────────────────────────────────────────────────

const BASIS_STATES = ["00", "01", "10", "11"] as const;

const MEASUREMENT_BASES: Array<{ key: string; label: string }> = [
  { key: "z", label: "ZZ basis" },
  { key: "zx", label: "X₁Z₂ basis" },
  { key: "x", label: "XX basis" },
];

// ── Component ─────────────────────────────────────────────────────────────────

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
  const psi = buildClockState(alpha);
  const exact = exactExpectations(psi);
  const isLoading = status === "running";

  // Born-rule expected probabilities per basis
  const expectedByBasis = useMemo(
    () => expectedBasisProbabilities(psi),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alpha],
  );

  return (
    <Card className="rounded-lg" padded="md">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Error state */}
        {error && (
          <div className="px-3 py-2 border rounded border-danger/30 bg-danger/5">
            <Text color="error" className="text-sm">
              {error}
            </Text>
          </div>
        )}

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

        {/* Shot distributions — one per measurement basis */}
        {MEASUREMENT_BASES.map(({ key, label }, idx) => (
          <section key={key}>
            <BasisMeasurementSection
              label={`shot distribution · ${label}`}
              states={BASIS_STATES}
              stateColors={BASIS_STATE_COLORS}
              counts={result?.countsByBasis[key] ?? null}
              expectedProbs={expectedByBasis[key]}
              shots={shots}
              loading={isLoading}
            />
            {idx < MEASUREMENT_BASES.length - 1 && (
              <div className="mt-4 border-t border-elevated" />
            )}
          </section>
        ))}

        {/* Divider */}
        <div className="border-t border-elevated" />
      </div>
    </Card>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-widest text-white/80">
      {children}
    </span>
  );
}
