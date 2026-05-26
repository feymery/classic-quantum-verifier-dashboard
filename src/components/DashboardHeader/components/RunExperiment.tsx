import { Button } from "../../../ui";

export interface RunExperimentProps {
  runFor1Q: () => void;
  isRunning: boolean;
  selectedCount?: number;
}

export function RunExperiment({
  runFor1Q,
  isRunning,
  selectedCount = 1,
}: RunExperimentProps) {
  const label = isRunning
    ? "Running..."
    : selectedCount > 1
      ? `Run sweep (${selectedCount})`
      : "Run experiment";

  return (
    <Button
      onClick={runFor1Q}
      disabled={isRunning}
      variant="primary"
      loading={isRunning}
      loadingLabel="Running..."
      className="w-full rounded-lg"
    >
      {label}
    </Button>
  );
}
