import { Link } from "react-router-dom";
import { TwoQubitPanel } from "../components/TwoQubitPanel";
import { useAppState } from "../state/useAppState";
import { Text } from "../ui/Text";

export function CircuitPage() {
  const { dashboard, runner } = useAppState();

  return (
    <div className="space-y-3">
      <div>
        <Text variant="label" color="accent" className="tracking-[0.28em]">
          physics layer
        </Text>
        <Text as="h2" variant="subtitle" className="mt-2">
          Circuit + Observables
        </Text>
        {!runner.twoQResult && (
          <Text variant="caption" color="muted" className="mt-2">
            No 2Q run yet. Go to{" "}
            <Link
              to="/experiment"
              className="underline"
              style={{ color: "#a78bfa" }}
            >
              Experiment
            </Link>{" "}
            , select 2Q mode, and run.
          </Text>
        )}
      </div>

      <TwoQubitPanel
        alpha={dashboard.alpha}
        shots={dashboard.shots}
        result={runner.twoQResult}
        status={runner.status}
        error={runner.error}
        executionSource={runner.latestExecutionSource}
      />
    </div>
  );
}
