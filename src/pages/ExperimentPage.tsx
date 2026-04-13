import { useState } from "react";
import { AlphaControl } from "../components/AlphaControl/index";
import { EnergyPanel } from "../components/EnergyPanel";
import { ExperimentControlBar } from "../components/ExperimentControlBar";
import { MeasurementPanel } from "../components/MeasurementPanel";
import { RunHistoryPanel } from "../components/RunHistoryPanel";
import { useAppState } from "../state/useAppState";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

function sourceLabel(source: string | null): string {
  if (source === "api") return "api";
  if (source === "fallback-local") return "fallback-local";
  if (source === "local-mock") return "local-mock";
  if (source === "local-2q") return "local-2q";
  return "unknown";
}

export function ExperimentPage() {
  const { dashboard, runner, runForMode } = useAppState();
  const [runMode, setRunMode] = useState<"oneQ" | "twoQ">("oneQ");

  const restoreHistoryEntry = (entry: (typeof runner.history)[number]) => {
    setRunMode(entry.mode);
    dashboard.setAlpha(entry.alpha);
    dashboard.setShots(entry.shots);
    dashboard.setSelectedBackend(entry.requestedBackend);
    dashboard.setComparisonAlphas(entry.comparisonAlphas);
  };

  return (
    <div className="space-y-3">
      <Card className="rounded-3xl" padded="md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="caption" color="muted" style={{ color: "#6b6780" }}>
            execution mode
          </Text>
          <div
            className="inline-flex overflow-hidden rounded-2xl border"
            style={{ borderColor: "#2d2b3a" }}
          >
            <Button
              onClick={() => setRunMode("oneQ")}
              size="sm"
              variant="secondary"
              className="rounded-none border-0 px-3 py-1.5 font-mono text-[10px]"
              style={{
                color: runMode === "oneQ" ? "#0f0e14" : "#9490a8",
                background: runMode === "oneQ" ? "#a78bfa" : "#181620",
              }}
            >
              1Q
            </Button>
            <Button
              onClick={() => setRunMode("twoQ")}
              size="sm"
              variant="secondary"
              className="rounded-none border-0 px-3 py-1.5 font-mono text-[10px]"
              style={{
                color: runMode === "twoQ" ? "#0f0e14" : "#9490a8",
                background: runMode === "twoQ" ? "#34d399" : "#181620",
              }}
            >
              2Q
            </Button>
          </div>
        </div>
      </Card>

      <ExperimentControlBar
        onRun={() => runForMode(runMode)}
        isRunning={runner.isRunning}
        statusText={
          runner.activeAsyncJob
            ? `IBM job ${runner.activeAsyncJob.status} · ${runner.activeAsyncJob.jobId}`
            : runner.isRunning
              ? "Running selected experiment..."
              : runner.latestJobId
                ? `${runner.latestJobId} · ${runner.latestBackend ?? dashboard.selectedBackend} · ${sourceLabel(runner.latestExecutionSource)}`
                : "One click = one experiment"
        }
      />

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr] items-start">
        <AlphaControl
          alpha={dashboard.alpha}
          setAlpha={dashboard.setAlpha}
          comparisonAlphas={dashboard.comparisonAlphas}
          setComparisonAlphas={dashboard.setComparisonAlphas}
        />

        <Card className="rounded-3xl" padded="md">
          <Text
            variant="caption"
            className="uppercase tracking-[0.24em]"
            style={{ color: "#6b6780" }}
          >
            experiment inputs
          </Text>

          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-sm" style={{ color: "#ddd9ee" }}>
                shots
              </span>
              <input
                type="number"
                value={dashboard.shots}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  if (!Number.isNaN(parsed) && parsed > 0) {
                    dashboard.setShots(parsed);
                  }
                }}
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                style={{
                  borderColor: "#2d2b3a",
                  background: "#181620",
                  color: "#ddd9ee",
                }}
              />
            </label>

            <Text variant="caption" color="muted">
              Run Experiment is the only execution trigger; mode is selected
              above.
            </Text>
          </div>
        </Card>
      </div>

      <RunHistoryPanel
        entries={runner.history}
        onRestore={restoreHistoryEntry}
        onClear={runner.clearHistory}
      />

      <EnergyPanel
        title="Instant Energy"
        description="Current protocol energy for the selected α value."
        energy={dashboard.formattedEnergy}
      />

      <MeasurementPanel
        alpha={dashboard.alpha}
        shots={dashboard.shots}
        result={runner.oneQResult}
        status={runner.status}
        error={runner.error}
        executionSource={runner.latestExecutionSource}
      />
    </div>
  );
}
