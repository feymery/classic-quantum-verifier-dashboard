import { Panel } from "../ui/Panel";

const VERDICT_VAR: Record<string, string> = {
  accept: "var(--color-success)",
  reject: "var(--color-danger)",
  marginal: "var(--color-warning)",
  boundary: "var(--color-warning)",
};

interface EnergyPanelProps {
  title: string;
  description: string;
  energy: string;
  energyError?: number | null;
  verdict?: string | null;
}

export function EnergyPanel({
  title,
  description,
  energy,
  energyError,
  verdict,
}: EnergyPanelProps) {
  const verdictColor = verdict
    ? (VERDICT_VAR[verdict] ?? "var(--color-muted)")
    : undefined;

  return (
    <Panel step="step E" title={title} description={description}>
      <div className="space-y-2">
        <p className="text-4xl font-semibold text-accent">
          {energy}
          {energyError != null && (
            <span className="ml-2 text-base font-normal text-muted">
              ± {energyError.toFixed(4)}
            </span>
          )}
        </p>
        <p className="text-sm text-subtle">energy estimate</p>
        {verdict && (
          <p
            className=" text-xs font-medium uppercase tracking-wider"
            style={{ color: verdictColor }}
          >
            {verdict}
          </p>
        )}
      </div>
    </Panel>
  );
}
