import { Panel } from "../ui/Panel";

interface EnergyPanelProps {
  title: string;
  description: string;
  energy: string;
}

export function EnergyPanel({ title, description, energy }: EnergyPanelProps) {
  return (
    <Panel step="step E" title={title} description={description}>
      <div className="space-y-2">
        <p className="text-4xl font-semibold" style={{ color: "#a78bfa" }}>
          {energy}
        </p>
        <p className="text-sm" style={{ color: "#6b6780" }}>
          energy estimate
        </p>
      </div>
    </Panel>
  );
}
