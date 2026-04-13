import { Panel } from "../ui/Panel";
import { PlotPlaceholder } from "./PlotPlaceholder";

interface PlotPanelProps {
  step: string;
  title: string;
  description: string;
  label: string;
  height?: number;
}

export function PlotPanel({
  step,
  title,
  description,
  label,
  height = 120,
}: PlotPanelProps) {
  return (
    <Panel step={step} title={title} description={description}>
      <PlotPlaceholder label={label} height={height} />
    </Panel>
  );
}
