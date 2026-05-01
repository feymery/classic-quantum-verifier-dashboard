import type { BackendId } from "../../utils/constants";
import type { BackendStatus } from "../../types/dashboard";
import { Card } from "../../ui/Card";
import { BackendRow, HeaderStrip, IbmTokenSection } from "./components";
import { useAppState } from "../../state/useAppState";
import { RunExperiment } from "./components/RunExperiment";
import { IntroPanel } from "./components/IntroPanel";

export interface DashboardHeaderProps {
  // identity
  selectedBackend: BackendId;
  backendStatus: BackendStatus;
  // parameters
  alpha: number;
  shots: number;
  // derived / read-only
  energy: string;
  latestJobId: string | null;
  // IBM credentials
  ibmToken: string;
  ibmTokenSet: boolean;
  ibmInstance: string;
  ibmBackendName: string;
  showToken: boolean;
  // callbacks
  onBackendChange: (id: BackendId) => void;
  onAlphaChange: (value: number) => void;
  onShotsChange: (value: number) => void;
  onTokenChange: (token: string) => void;
  onInstanceChange: (instance: string) => void;
  onBackendNameChange: (name: string) => void;
  onToggleShowToken: () => void;
  onConfirmToken: () => void;
  onOpenHistory: () => void;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const {
    selectedBackend,
    backendStatus,
    alpha,
    shots,
    energy,
    latestJobId,
    ibmToken,
    ibmTokenSet,
    ibmInstance,
    ibmBackendName,
    showToken,
    onBackendChange,
    onAlphaChange,
    onShotsChange,
    onTokenChange,
    onInstanceChange,
    onBackendNameChange,
    onToggleShowToken,
    onConfirmToken,
    onOpenHistory,
  } = props;

  const { runner, runFor1Q } = useAppState();

  return (
    <header className="flex flex-col gap-6 md:flex-row">
      <IntroPanel onOpenHistory={onOpenHistory} />

      <Card className="flex-1 rounded-lg " padded="sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-4">
            <BackendRow
              selectedBackend={selectedBackend}
              backendStatus={backendStatus}
              onBackendChange={onBackendChange}
              onOpenHistory={onOpenHistory}
            />
          </div>

          <HeaderStrip
            alpha={alpha}
            shots={shots}
            onAlphaChange={onAlphaChange}
            onShotsChange={onShotsChange}
            energy={energy}
            latestJobId={latestJobId}
          />

          {selectedBackend === "ibm_runtime" && (
            <IbmTokenSection
              ibmToken={ibmToken}
              ibmTokenSet={ibmTokenSet}
              ibmInstance={ibmInstance}
              ibmBackendName={ibmBackendName}
              showToken={showToken}
              onToggleShowToken={onToggleShowToken}
              onTokenChange={onTokenChange}
              onInstanceChange={onInstanceChange}
              onBackendNameChange={onBackendNameChange}
              onConfirmToken={onConfirmToken}
            />
          )}
          <RunExperiment
            energy={energy}
            latestJobId={latestJobId}
            runFor1Q={runFor1Q}
            isRunning={runner.isRunning}
          />
        </div>
      </Card>
    </header>
  );
}
