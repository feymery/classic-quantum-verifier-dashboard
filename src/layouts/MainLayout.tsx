import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AsyncJobBanner } from "../components/AsyncJobBanner";
import { DashboardHeader } from "../components/DashboardHeader/DashboardHeader";
import { AppNavigation } from "../components/AppNavigation";
import { RunHistoryDrawer } from "../components/RunHistoryDrawer";
import { useAppState } from "../state/useAppState";
import type { JobHistoryItem } from "../types/runner";

export function MainLayout() {
  const { dashboard, backendStatus, runner } = useAppState();
  const [historyOpen, setHistoryOpen] = useState(false);

  const restoreHistoryEntry = (item: JobHistoryItem) => {
    dashboard.setAlpha(item.alpha);
    dashboard.setShots(item.shots);
    dashboard.setSelectedBackend(
      item.requestedBackend as Parameters<
        typeof dashboard.setSelectedBackend
      >[0],
    );
  };

  const loadHistoryResult = (item: JobHistoryItem) => {
    dashboard.setAlpha(item.alpha);
    dashboard.setShots(item.shots);
    dashboard.setSelectedBackend(
      item.requestedBackend as Parameters<
        typeof dashboard.setSelectedBackend
      >[0],
    );
    void runner.restoreResult(item);
  };

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
          onBackendChange={dashboard.setSelectedBackend}
          onTokenChange={dashboard.setIbmToken}
          onInstanceChange={dashboard.setIbmInstance}
          onBackendNameChange={dashboard.setIbmBackendName}
          onToggleShowToken={dashboard.toggleShowToken}
          onConfirmToken={dashboard.confirmToken}
          onAlphaChange={dashboard.setAlpha}
          onShotsChange={dashboard.setShots}
          energy={dashboard.formattedEnergy}
          latestJobId={runner.latestJobId ?? null}
          onOpenHistory={() => setHistoryOpen(true)}
        />

        <AppNavigation />

        <AsyncJobBanner
          job={runner.activeAsyncJob}
          onDismiss={runner.dismissActiveAsyncJob}
          onRetry={runner.retryActiveAsyncJob}
          onResume={() => {
            if (runner.activeAsyncJob) runner.resumeJob(runner.activeAsyncJob);
          }}
        />

        <main className="my-8">
          <Outlet />
        </main>
      </div>

      <RunHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={runner.historyItems}
        loading={runner.historyLoading}
        error={runner.historyError}
        onRestore={restoreHistoryEntry}
        onLoadResult={loadHistoryResult}
        onClear={runner.clearHistory}
      />
    </div>
  );
}
