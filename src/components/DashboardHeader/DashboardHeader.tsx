import type { BackendId } from "../../utils/constants";
import type { BackendStatus } from "../../types/dashboard";
import { Card } from "../../ui/Card";
import { BackendRow, HeaderStrip, IbmTokenSection } from "./components";
import { useAppState } from "../../state/useAppState";
import { RunExperiment } from "./components/RunExperiment";
import { IntroPanel } from "./components/IntroPanel";
import { AppNavigation } from "../AppNavigation";

export interface DashboardHeaderProps {
  // identity
  selectedBackend: BackendId;
  backendStatus: BackendStatus;
  // parameters
  alpha: number;
  shots: number;
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

  const { runner, runFor1Q, runForSelectedAlphas, dashboard } = useAppState();
  const selectedCount = dashboard.selectedAlphas.length;

  return (
    <header className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-col gap-6">
        <IntroPanel onOpenHistory={onOpenHistory} />
        <AppNavigation />
      </div>

      <Card>
        <div className="flex flex-col justify-between h-full gap-3">
          <BackendRow
            selectedBackend={selectedBackend}
            backendStatus={backendStatus}
            onBackendChange={onBackendChange}
            onOpenHistory={onOpenHistory}
          />

          <HeaderStrip
            alpha={alpha}
            shots={shots}
            onAlphaChange={onAlphaChange}
            onShotsChange={onShotsChange}
          />

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
          <RunExperiment
            runFor1Q={selectedCount > 1 ? runForSelectedAlphas : runFor1Q}
            isRunning={runner.isRunning}
            selectedCount={selectedCount}
          />
        </div>
      </Card>
    </header>
  );
}
