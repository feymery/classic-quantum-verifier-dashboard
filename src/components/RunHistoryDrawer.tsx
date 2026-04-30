import type { JobHistoryItem } from "../types/runner";
import { RunHistoryPanel } from "./RunHistoryPanel";

interface RunHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  items: JobHistoryItem[];
  loading: boolean;
  error: string | null;
  onRestore: (item: JobHistoryItem) => void;
  onLoadResult: (item: JobHistoryItem) => void;
  onClear: () => void;
}

export function RunHistoryDrawer({
  open,
  onClose,
  items,
  loading,
  error,
  onRestore,
  onLoadResult,
  onClear,
}: RunHistoryDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-2xl overflow-y-auto"
        style={{ background: "#131217", borderLeft: "1px solid #2d2b3a" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #2d2b3a" }}
        >
          <span className="text-sm font-semibold" style={{ color: "#ddd9ee" }}>
            Run History
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded"
            style={{ color: "#9490a8", background: "#2d2b3a" }}
          >
            Close
          </button>
        </div>

        <div className="flex-1 px-6 py-4">
          <RunHistoryPanel
            items={items}
            loading={loading}
            error={error}
            onRestore={(item) => {
              onRestore(item);
              onClose();
            }}
            onLoadResult={(item) => {
              onLoadResult(item);
              onClose();
            }}
            onClear={onClear}
          />
        </div>
      </div>
    </>
  );
}
