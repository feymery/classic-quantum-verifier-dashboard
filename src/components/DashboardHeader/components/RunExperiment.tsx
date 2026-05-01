import { Button } from "../../../ui";

export interface RunExperimentProps {
  runFor1Q: () => void;
  isRunning: boolean;
}

export function RunExperiment({ runFor1Q, isRunning }: RunExperimentProps) {
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
    </div>
  );
}
