import { Button, Text } from "../../../ui";

export interface RunExperimentProps {
  energy: string;
  latestJobId: string | null;
  runFor1Q: () => void;
  isRunning: boolean;
}

export function RunExperiment({
  energy,
  latestJobId,
  runFor1Q,
  isRunning,
}: RunExperimentProps) {
  return (
    <div className="gap-4">
      <Button
        onClick={runFor1Q}
        disabled={isRunning}
        variant="primary"
        loading={isRunning}
        loadingLabel="Running..."
        className="w-full rounded-lg"
      >
        Run experiment
      </Button>
      <div className="flex flex-col gap-3 mt-2">
        <Text variant="caption" color="accent">
          energy: {energy}
        </Text>
        <Text variant="caption" color="muted">
          last job: {latestJobId ?? "--"}
        </Text>
      </div>
    </div>
  );
}
