import type { BackendId, Backend } from "../../utils/constants";
import type { BackendStatus } from "../../types/dashboard";
import { Card } from "../../ui/Card";
import {
  HeaderTitle,
  ParameterRow,
  BackendRow,
  InfoStrip,
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
  noiseLambda: number;
  // derived / read-only
  energy: string;
  comparisonCount: number;
  latestJobId: string | null;
  // IBM token
  ibmToken: string;
  ibmTokenSet: boolean;
  showToken: boolean;
  // callbacks
  onBackendChange: (id: BackendId) => void;
  onAlphaChange: (value: number) => void;
  onShotsChange: (value: number) => void;
  onNoiseLambdaChange: (value: number) => void;
  onTokenChange: (token: string) => void;
  onToggleShowToken: () => void;
  onConfirmToken: () => void;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const {
    selectedBackend,
    backend,
    backendStatus,
    alpha,
    shots,
    noiseLambda,
    energy,
    comparisonCount,
    latestJobId,
    ibmToken,
    ibmTokenSet,
    showToken,
    onBackendChange,
    onAlphaChange,
    onShotsChange,
    onNoiseLambdaChange,
    onTokenChange,
    onToggleShowToken,
    onConfirmToken,
  } = props;

  return (
    <Card className="mb-6 rounded-lg" padded="lg" as="header">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <HeaderTitle />

        <ParameterRow
          alpha={alpha}
          shots={shots}
          noiseLambda={noiseLambda}
          onAlphaChange={onAlphaChange}
          onShotsChange={onShotsChange}
          onNoiseLambdaChange={onNoiseLambdaChange}
        />
        <BackendRow
          selectedBackend={selectedBackend}
          backend={backend}
          backendStatus={backendStatus}
          onBackendChange={onBackendChange}
        />
      </div>

      <InfoStrip
        energy={energy}
        comparisonCount={comparisonCount}
        latestJobId={latestJobId}
      />

      {selectedBackend === "ibm_runtime" && (
        <IbmTokenSection
          ibmToken={ibmToken}
          ibmTokenSet={ibmTokenSet}
          showToken={showToken}
          onToggleShowToken={onToggleShowToken}
          onTokenChange={onTokenChange}
          onConfirmToken={onConfirmToken}
        />
      )}
    </Card>
  );
}
