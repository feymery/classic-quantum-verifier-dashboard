import { Outlet } from "react-router-dom";
import { AsyncJobBanner } from "../components/AsyncJobBanner";
import { DashboardHeader } from "../components/DashboardHeader/DashboardHeader";
import { AppNavigation } from "../components/AppNavigation";
import { useAppState } from "../state/useAppState";

export function MainLayout() {
  const { dashboard, backendStatus, runner } = useAppState();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#131217", color: "#ddd9ee" }}
    >
      <div className="px-6 py-6 mx-auto max-w-330">
        <DashboardHeader
          selectedBackend={dashboard.selectedBackend}
          backend={dashboard.backend}
          backendStatus={backendStatus}
          ibmToken={dashboard.ibmToken}
          ibmTokenSet={dashboard.ibmTokenSet}
          ibmInstance={dashboard.ibmInstance}
          ibmBackendName={dashboard.ibmBackendName}
          showToken={dashboard.showToken}
          alpha={dashboard.alpha}
          shots={dashboard.shots}
          noiseLambda={dashboard.noiseLambda}
          onBackendChange={dashboard.setSelectedBackend}
          onTokenChange={dashboard.setIbmToken}
          onInstanceChange={dashboard.setIbmInstance}
          onBackendNameChange={dashboard.setIbmBackendName}
          onToggleShowToken={dashboard.toggleShowToken}
          onConfirmToken={dashboard.confirmToken}
          onAlphaChange={dashboard.setAlpha}
          onShotsChange={dashboard.setShots}
          onNoiseLambdaChange={dashboard.setNoiseLambda}
          energy={dashboard.formattedEnergy}
          comparisonCount={dashboard.comparisonAlphas.length}
          latestJobId={runner.latestJobId ?? null}
        />

        <AppNavigation />

        <AsyncJobBanner
          job={runner.activeAsyncJob}
          onDismiss={runner.dismissActiveAsyncJob}
          onRetry={runner.retryActiveAsyncJob}
        />

        <main className="my-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
