import { Card } from "../../../ui/Card";
import { Circuit1Q } from "../../quantum/Circuit1Q";
import { QMAVerifierDiagram } from "../../CircuitDiagram/QMAVerifierDiagram";
import { useAppState } from "../../../state/useAppState";

export const IntroPanel = () => {
  const { dashboard } = useAppState();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-center grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="h-full col-span-1 sm:col-span-2" padded="sm">
          <QMAVerifierDiagram />
        </Card>
        <Card className="h-full col-span-1" padded="sm">
          <Circuit1Q alpha={dashboard.alpha} />
        </Card>
      </div>
    </div>
  );
};
