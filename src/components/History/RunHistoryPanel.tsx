import type { JobHistoryItem } from "../../types/runner";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Text } from "../../ui/Text";

interface RunHistoryPanelProps {
  items: JobHistoryItem[];
  loading: boolean;
  error: string | null;
  onRestore: (item: JobHistoryItem) => void;
  onLoadResult: (item: JobHistoryItem) => void;
  onClear: () => void;
  onSync: (item: JobHistoryItem) => void;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function decisionVariant(
  decision: string | null,
): "success" | "warning" | "error" | "neutral" {
  if (decision === "accept") return "success";
  if (decision === "boundary") return "warning";
  if (decision === "reject") return "error";
  return "neutral";
}

export function RunHistoryPanel({
  items,
  loading,
  error,
  onRestore,
  onLoadResult,
  onSync,
}: RunHistoryPanelProps) {
  return (
    <Card className="rounded-lg" padded="md">
      {error !== null && (
        <Text variant="caption" color="error" className="block mt-4">
          {error}
        </Text>
      )}

      {loading && (
        <Text variant="caption" color="muted" className="block mt-4">
          Loading…
        </Text>
      )}

      {!loading && error === null && items.length === 0 ? (
        <div className="px-4 py-5 mt-4 border rounded-lg border-border bg-surface">
          <Text variant="caption" color="muted">
            No runs recorded yet. Execute an experiment once and the timeline
            will appear here. Results are stored on the server.
          </Text>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.jobId}
              className="px-4 py-4 border rounded-lg border-border bg-surface"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    {item.executionSource ?? "unknown"}
                  </Badge>
                  <Badge variant={decisionVariant(item.decision)}>
                    {item.status === "failed"
                      ? "error"
                      : (item.decision ?? item.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Text variant="caption" color="muted">
                    {formatTimestamp(item.createdAt)}
                  </Text>
                  {item.status === "done" && (
                    <Button
                      onClick={() => onLoadResult(item)}
                      variant="primary"
                      size="sm"
                    >
                      Load results
                    </Button>
                  )}
                  {(item.status === "pending" || item.status === "running") &&
                    item.requestedBackend.includes("ibm") && (
                      <Button
                        onClick={() => onSync(item)}
                        variant="secondary"
                        size="sm"
                      >
                        Sync
                      </Button>
                    )}
                  <Button
                    onClick={() => onRestore(item)}
                    variant="secondary"
                    size="sm"
                  >
                    Restore inputs
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 mt-3 md:grid-cols-4">
                <div>
                  <Text variant="caption" color="muted">
                    alpha
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {item.alpha.toFixed(4)}
                  </Text>
                </div>
                <div>
                  <Text variant="caption" color="muted">
                    shots
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {item.shots.toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Text variant="caption" color="muted">
                    energy
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {item.energyEstimate === null
                      ? "-"
                      : item.energyEstimate.toFixed(4)}
                  </Text>
                </div>
              </div>
              <div className="mt-3">
                <Text variant="caption" color="muted">
                  job id
                </Text>
                <Text variant="body" className="mt-1 font-semibold">
                  {item.jobId}
                </Text>
              </div>
              {item.error && (
                <Text variant="caption" color="error" className="block mt-3">
                  {item.error}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
