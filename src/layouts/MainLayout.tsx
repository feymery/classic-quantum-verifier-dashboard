import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardHeader } from "../components/DashboardHeader/DashboardHeader";
import { AppNavigation } from "../components/AppNavigation";
import { RunHistoryDrawer } from "../components/History/RunHistoryDrawer";
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
    <div className="min-h-screen px-64 py-6">
      <div className="flex flex-col">
        <DashboardHeader
          selectedBackend={dashboard.selectedBackend}
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
          onOpenHistory={() => setHistoryOpen(true)}
        />
        <div className="flex-1 px-2 py-6">
          <AppNavigation />
          <Outlet />
        </div>
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
        onSync={(item) => void runner.syncJob(item.jobId)}
      />
    </div>
  );
}
