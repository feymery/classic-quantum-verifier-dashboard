import { ProtocolGuide1Q } from "../modules/oneQubit/components/ProtocolGuide1Q/ProtocolGuide1Q";
import { AlphaSweepChart } from "../components/charts/AlphaSweepChart";
import { CircuitStateExplainer } from "../modules/traps/components/CircuitStateExplainer";
import { useAppState } from "../state/useAppState";

export function FundamentalsPage() {
  const { dashboard } = useAppState();

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        This page will cover the fundamental concepts of the classic-quantum
        verification protocol.
      </p>

      <CircuitStateExplainer alpha={dashboard.alpha} />

      <ProtocolGuide1Q alpha={dashboard.alpha} />

      <AlphaSweepChart
        points={dashboard.sweepPoints}
        loading={dashboard.sweepLoading}
        error={dashboard.sweepError}
        onRun={dashboard.runSweep}
      />
    </div>
  );
}
