import { TwoQubitPanel } from "../modules/twoQubit/components/TwoQubitPanel/TwoQubitPanel";
import { QubitComparison, ConceptBox } from "../components/ProtocolExplainer";
import { ExperimentControlBar } from "../components/ExperimentControlBar";
import { useAppState } from "../state/useAppState";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

export function CircuitPage() {
  const { dashboard, runner, runForMode } = useAppState();

  return (
    <div className="space-y-4">
      <div>
        <Text variant="label" color="accent" className="tracking-[0.28em]">
          physics layer
        </Text>
        <Text as="h2" variant="subtitle" className="mt-2">
          Circuit + Observables
        </Text>
      </div>

      <ExperimentControlBar
        onRun={() => runForMode("twoQ")}
        isRunning={runner.isRunning}
        statusText={
          runner.isRunning
            ? "Running 2Q experiment..."
            : runner.twoQResult
              ? `${runner.twoQResult.jobId} · ${runner.twoQResult.backend}`
              : "Click to run 2Q experiment"
        }
      />

      {/* ── 2Q simulation result panel ── */}
      <TwoQubitPanel
        alpha={dashboard.alpha}
        shots={dashboard.shots}
        result={runner.twoQResult}
        status={runner.status}
        error={runner.error}
        executionSource={runner.latestExecutionSource}
      />

      {/* ── How the protocol scales ── */}
      <Card className="rounded-lg" padded="md">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="rounded  text-[9px] px-1.5 py-0.5 uppercase tracking-wider"
            style={{ background: "#2d2b3a", color: "#9490a8" }}
          >
            guide
          </span>
          <Text as="h3" variant="subtitle" style={{ color: "#ddd9ee" }}>
            How the protocol scales
          </Text>
        </div>

        {/* Side-by-side comparison */}
        <QubitComparison alpha={dashboard.alpha} />

        {/* Conceptual explanations for 2Q */}
        <div className="mt-4 space-y-2">
          <ConceptBox
            title="Why add a second work qubit?"
            accentColor="#34d399"
            defaultOpen
          >
            <p>
              The 2-qubit extension tests whether a prover can maintain
              entanglement in the work register. A classical prover can fake a
              1-qubit rotation but cannot efficiently simulate the entangled
              3-qubit clock state.
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              The CNOT between work qubits creates correlations (Z₂Z₃, X₂X₃)
              that a separable simulator would miss under sufficiently many
              shots.
            </p>
          </ConceptBox>

          <ConceptBox
            title="How does entanglement change the Hamiltonian?"
            accentColor="#34d399"
          >
            <p>
              The 2Q Hamiltonian includes all pairwise Pauli terms across 3
              qubits: 3 single-qubit Z-terms + 3 ZZ-pairs + 3 XX-pairs + 2 cross
              terms = 11 coefficients vs. 5 for 1Q.
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              Each new qubit roughly doubles the number of independent Pauli
              expectation values that need to be measured, increasing sampling
              overhead by ~1.8× per qubit added.
            </p>
          </ConceptBox>

          <ConceptBox
            title="Circuit differences highlighted"
            accentColor="#b7a8cf"
          >
            <div className="space-y-1">
              {[
                ["1Q", "H → ctrl-U(α) → M×2", "#a78bfa"],
                ["2Q", "H → ctrl-U(α) → CNOT → M×3", "#34d399"],
              ].map(([label, circuit, color]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-2 py-1 rounded"
                  style={{ background: "#181620" }}
                >
                  <span
                    className=" text-[9px] rounded px-1"
                    style={{
                      background: (color as string) + "33",
                      color: color as string,
                    }}
                  >
                    {label}
                  </span>
                  <code className="text-xs " style={{ color: "#ddd9ee" }}>
                    {circuit}
                  </code>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[10px]" style={{ color: "#6b6780" }}>
              The only structural addition is a CNOT gate on the work register
              after the controlled-U(α). The clock qubit logic is identical.
            </p>
          </ConceptBox>
        </div>
      </Card>
    </div>
  );
}
