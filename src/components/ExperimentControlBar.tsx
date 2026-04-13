import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

interface ExperimentControlBarProps {
  onRun: () => void;
  isRunning: boolean;
  statusText?: string;
}

export function ExperimentControlBar({
  onRun,
  isRunning,
  statusText,
}: ExperimentControlBarProps) {
  return (
    <Card className="rounded-3xl" padded="lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Text variant="body" className="font-semibold">
            Experiment control
          </Text>
          <Text
            variant="caption"
            color="muted"
            className="mt-1"
            style={{ color: "#6b6780" }}
          >
            Run backend workloads from this single control point.
          </Text>
          {statusText && (
            <Text variant="caption" color="muted" className="mt-1">
              {statusText}
            </Text>
          )}
        </div>
        <RunButton onRun={onRun} isRunning={isRunning} />
      </div>
    </Card>
  );
}

// ── Run button ────────────────────────────────────────────────────────────────

interface RunButtonProps {
  onRun: () => void;
  isRunning: boolean;
}

function RunButton({ onRun, isRunning }: RunButtonProps) {
  return (
    <Button
      onClick={onRun}
      disabled={isRunning}
      variant="primary"
      size="lg"
      loading={isRunning}
      loadingLabel="Running..."
      className="rounded-3xl run-experiment-btn"
    >
      Run experiment
    </Button>
  );
}
