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
import type { VerifierDecision } from "../../../../physics/energy";
import { Card } from "../../../../ui/Card";
import { Text } from "../../../../ui/Text";
import { BASIS_STATE_COLORS } from "../../../../components/charts/chartTheme";

// ── Constants ─────────────────────────────────────────────────────────────────

const BASIS_STATES = ["00", "01", "10", "11"] as const;

const MEASUREMENT_BASES: Array<{ key: string; label: string }> = [
  { key: "z", label: "ZZ basis" },
  { key: "zx", label: "Z₁X₂ basis" },
  { key: "x", label: "XX basis" },
];

const VERDICT_CONFIG: Record<
  VerifierDecision,
  { classes: string; label: string }
> = {
  accept: {
    classes: "text-success bg-success/8 border-success/30",
    label: "ACCEPT",
  },
  reject: {
    classes: "text-danger bg-danger/8 border-danger/30",
    label: "REJECT",
  },
  boundary: {
    classes: "text-warning bg-warning/8 border-warning/30",
    label: "BOUNDARY",
  },
};

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

  const verdict = result?.energy.decision ?? null;
  const verdictCfg = verdict ? VERDICT_CONFIG[verdict] : null;

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

        {/* Verifier decision */}
        <section>
          <SectionLabel>verifier decision</SectionLabel>
          {verdictCfg && result && !isLoading ? (
            <div
              className={`mt-2 flex items-center justify-between rounded px-3 py-2.5 border ${verdictCfg.classes}`}
            >
              <span className="text-[11px]">protocol outcome</span>
              <span className="text-sm font-semibold tracking-widest">
                {verdictCfg.label}
              </span>
            </div>
          ) : (
            <div className="px-3 py-2 mt-2 border rounded bg-surface border-border">
              <span className="text-[10px] text-subtle">
                {isLoading ? "computing…" : "run experiment to get decision"}
              </span>
            </div>
          )}
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
