import { FundamentalsContent } from "../components/ProtocolExplainer/FundamentalsContent";
import { useAppState } from "../state/useAppState";

export function FundamentalsPage() {
  const { dashboard } = useAppState();

  return (
    <div className="space-y-6">
      <FundamentalsContent alpha={dashboard.alpha} />
    </div>
  );
}
