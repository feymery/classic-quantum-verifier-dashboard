import { Card } from "../../../ui/Card";
import { Circuit1Q } from "../../quantum/Circuit1Q";
import { useAppState } from "../../../state/useAppState";

export const IntroPanel = () => {
  const { dashboard } = useAppState();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-center grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="h-full col-span-1 sm:col-span-2" padded="sm">
          <img
            src="/protocol_diagram.png"
            alt="Classical verification protocol: Alice sends α to Bob, Bob returns outcomes, Alice computes E(α) and accepts if E < 0.4"
            className="w-full rounded-xl"
          />
        </Card>
        <Card className="h-full col-span-1" padded="sm">
          <Circuit1Q alpha={dashboard.alpha} />
        </Card>
      </div>
    </div>
  );
};
