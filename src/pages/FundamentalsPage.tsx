import { ProtocolGuide1Q } from "../modules/oneQubit/components/ProtocolGuide1Q/ProtocolGuide1Q";
import { NoisePanel } from "../components/NoisePanel/NoisePanel";
import { useAppState } from "../state/useAppState";

export function FundamentalsPage() {
  const { dashboard } = useAppState();

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        This page will cover the fundamental concepts of the classic-quantum
        verification protocol.
      </p>

      <ProtocolGuide1Q alpha={dashboard.alpha} />

      <NoisePanel
        alpha={dashboard.alpha}
        noiseLambda={dashboard.noiseLambda}
        onNoiseLambdaChange={dashboard.setNoiseLambda}
      />
    </div>
  );
}
