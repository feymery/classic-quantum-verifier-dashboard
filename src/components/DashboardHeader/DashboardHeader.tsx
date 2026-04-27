import type { BackendId, Backend } from "../../utils/constants";
import type { BackendStatus } from "../../types/dashboard";
import { Card } from "../../ui/Card";
import {
  HeaderTitle,
  BackendRow,
  HeaderStrip,
  IbmTokenSection,
} from "./components";

export interface DashboardHeaderProps {
  // identity
  selectedBackend: BackendId;
  backend: Backend;
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
    backend,
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

  return (
    <Card className="rounded-lg" padded="lg" as="header">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <HeaderTitle />
        <BackendRow
          selectedBackend={selectedBackend}
          backend={backend}
          backendStatus={backendStatus}
          onBackendChange={onBackendChange}
        />
      </div>

      <HeaderStrip
        alpha={alpha}
        shots={shots}
        onAlphaChange={onAlphaChange}
        onShotsChange={onShotsChange}
        energy={energy}
        latestJobId={latestJobId}
        onOpenHistory={onOpenHistory}
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
    </Card>
  );
}
