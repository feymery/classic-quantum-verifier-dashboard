import type { JobHistoryItem } from "../../types/runner";
import { Button, Drawer } from "../../ui";
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
  onSync: (item: JobHistoryItem) => void;
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
  onSync,
}: RunHistoryDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Run History"
      headerActions={
        <div className="flex gap-2">
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            disabled={items.length === 0}
          >
            Clear history
          </Button>
          <Button onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      }
    >
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
        onSync={onSync}
      />
    </Drawer>
  );
}
