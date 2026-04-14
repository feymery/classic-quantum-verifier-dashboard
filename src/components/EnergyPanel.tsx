import { Panel } from "../ui/Panel";

const VERDICT_COLOR: Record<string, string> = {
  accept: "#34d399",
  reject: "#f87171",
  marginal: "#f59e0b",
  boundary: "#f59e0b",
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
    ? (VERDICT_COLOR[verdict] ?? "#9490a8")
    : undefined;

  return (
    <Panel step="step E" title={title} description={description}>
      <div className="space-y-2">
        <p className="text-4xl font-semibold" style={{ color: "#a78bfa" }}>
          {energy}
          {energyError != null && (
            <span
              className="ml-2 text-base font-normal"
              style={{ color: "#9490a8" }}
            >
              ± {energyError.toFixed(4)}
            </span>
          )}
        </p>
        <p className="text-sm" style={{ color: "#6b6780" }}>
          energy estimate
        </p>
        {verdict && (
          <p
            className="font-mono text-xs font-medium uppercase tracking-wider"
            style={{ color: verdictColor }}
          >
            {verdict}
          </p>
        )}
      </div>
    </Panel>
  );
}
