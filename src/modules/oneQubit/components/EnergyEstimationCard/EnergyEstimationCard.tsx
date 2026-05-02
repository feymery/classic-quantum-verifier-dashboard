import { EnergySummary } from "../MeasurementPanel/components/EnergySummary";
import { Card } from "../../../../ui/Card";
import { Text } from "../../../../ui/Text";
import type { EnergyAnalysis } from "../../../../physics/energy";

interface EnergyEstimationCardProps {
  analysis: EnergyAnalysis | null;
  loading: boolean;
}

export function EnergyEstimationCard({
  analysis,
  loading,
}: EnergyEstimationCardProps) {
  return (
    <Card className="rounded-lg" padded="md">
      <div className="space-y-4">
        <Text variant="title" className="text-xs font-medium text-foreground">
          Energy Estimation
        </Text>

        <div className="border-t border-border" />

        <EnergySummary analysis={analysis} loading={loading} />
      </div>
    </Card>
  );
}
