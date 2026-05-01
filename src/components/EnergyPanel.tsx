import type { ExperimentResult } from "../types/experiment";
import type { Verdict } from "../types/dashboard";
import type { TextColor } from "../ui/Text";
import { Panel, Text } from "../ui";
import { ResultProvenance } from "./ResultProvenance";

interface EnergyPanelProps {
  title: string;
  description: string;
  energy: string;
  energyTheoretical?: string;
  result: ExperimentResult | null;
  verdict?: Verdict | null;
}

const verdictColors: Record<Verdict, TextColor> = {
  accept: "success",
  reject: "error",
  boundary: "warning",
};

export function EnergyPanel({
  title,
  description,
  energy,
  energyTheoretical,
  verdict,
  result,
}: EnergyPanelProps) {
  return (
    <Panel
      className="flex flex-col gap-3"
      title={title}
      description={description}
    >
      <div className="flex-1 space-y-2 ">
        <p className="text-4xl font-semibold text-accent">{energy}</p>
        <p className="text-sm text-subtle">energy estimate</p>
        {energyTheoretical != null && (
          <p className="text-xs text-muted">
            theoretical (sin²α): {energyTheoretical}
          </p>
        )}
        {verdict && (
          <Text color={verdictColors[verdict]} variant="title">
            {verdict.toLocaleUpperCase()}
          </Text>
        )}
      </div>
      <ResultProvenance
        backend={result?.backend ?? null}
        jobId={result?.jobId}
        shotsExecuted={result?.shotsExecuted}
      />
    </Panel>
  );
}
