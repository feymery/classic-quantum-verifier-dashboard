import { Outlet } from "react-router-dom";
import { AsyncJobBanner } from "../components/AsyncJobBanner";
import { DashboardHeader } from "../components/DashboardHeader";
import { StatusBar } from "../components/StatusBar";
import { AppNavigation } from "../components/AppNavigation";
import { useAppState } from "../state/useAppState";

export function MainLayout() {
  const { dashboard, backendStatus, runner } = useAppState();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#131217", color: "#ddd9ee" }}
    >
      <div className="mx-auto max-w-330 px-6 py-6">
        <DashboardHeader
          selectedBackend={dashboard.selectedBackend}
          backend={dashboard.backend}
          backendStatus={backendStatus}
          ibmToken={dashboard.ibmToken}
          ibmTokenSet={dashboard.ibmTokenSet}
          showToken={dashboard.showToken}
          onBackendChange={dashboard.setSelectedBackend}
          onTokenChange={dashboard.setIbmToken}
          onToggleShowToken={dashboard.toggleShowToken}
          onConfirmToken={dashboard.confirmToken}
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

      <StatusBar
        alpha={dashboard.alpha}
        energy={dashboard.formattedEnergy}
        shots={dashboard.shots}
        noiseLambda={dashboard.noiseLambda}
        selectedBackend={dashboard.selectedBackend}
        comparisonCount={dashboard.comparisonAlphas.length}
      />
    </div>
  );
}
