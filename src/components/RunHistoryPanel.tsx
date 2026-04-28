import type { RunHistoryEntry } from "../types/runner";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

interface RunHistoryPanelProps {
  entries: RunHistoryEntry[];
  onRestore: (entry: RunHistoryEntry) => void;
  onLoadResult: (entry: RunHistoryEntry) => void;
  onClear: () => void;
}

function formatSource(source: RunHistoryEntry["executionSource"]): string {
  if (source === "api") return "api";
  if (source === "fallback-local") return "fallback";
  if (source === "local-mock") return "mock";
  if (source === "local-2q") return "local-2q";
  return "unknown";
}

function formatMode(mode: RunHistoryEntry["mode"]): string {
  return mode === "twoQ" ? "2Q" : "1Q";
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
  entries,
  onRestore,
  onLoadResult,
  onClear,
}: RunHistoryPanelProps) {
  return (
    <Card className="rounded-lg" padded="md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text variant="caption" className="uppercase tracking-[0.24em]">
            Run History
          </Text>
          <Text variant="body" className="mt-2 font-semibold">
            Persistent experiment history
          </Text>
          <Text variant="caption" color="muted" className="mt-1">
            Recent runs survive reloads and keep enough context to restore the
            input state.
          </Text>
        </div>

        <Button
          onClick={onClear}
          variant="ghost"
          size="sm"
          disabled={entries.length === 0}
        >
          Clear history
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="px-4 py-5 mt-4 border rounded-lg border-border bg-surface">
          <Text variant="caption" color="muted">
            No runs recorded yet. Execute 1Q or 2Q once and the timeline will
            persist locally in this browser.
          </Text>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="px-4 py-4 border rounded-lg border-border bg-surface"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={entry.status === "error" ? "error" : "quantum"}
                  >
                    {formatMode(entry.mode)}
                  </Badge>
                  <Badge variant="neutral">{entry.requestedBackend}</Badge>
                  <Badge variant="neutral">
                    {formatSource(entry.executionSource)}
                  </Badge>
                  <Badge variant={decisionVariant(entry.decision)}>
                    {entry.status === "error"
                      ? "error"
                      : (entry.decision ?? "complete")}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Text variant="caption" color="muted">
                    {formatTimestamp(entry.createdAt)}
                  </Text>
                  {entry.result && (
                    <Button
                      onClick={() => onLoadResult(entry)}
                      variant="primary"
                      size="sm"
                    >
                      Load results
                    </Button>
                  )}
                  <Button
                    onClick={() => onRestore(entry)}
                    variant="secondary"
                    size="sm"
                  >
                    Restore inputs
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 mt-3 md:grid-cols-5">
                <div>
                  <Text variant="caption" color="muted">
                    alpha
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {entry.alpha.toFixed(4)}
                  </Text>
                </div>
                <div>
                  <Text variant="caption" color="muted">
                    shots
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {entry.shots.toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Text variant="caption" color="muted">
                    energy
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {entry.energyEstimate === null
                      ? "-"
                      : entry.energyEstimate.toFixed(4)}
                  </Text>
                </div>
                <div>
                  <Text variant="caption" color="muted">
                    job id
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {entry.jobId ?? "failed before job creation"}
                  </Text>
                </div>
                <div>
                  <Text variant="caption" color="muted">
                    result backend
                  </Text>
                  <Text variant="body" className="mt-1 font-semibold">
                    {entry.resolvedBackend ?? "n/a"}
                  </Text>
                </div>
              </div>

              {entry.error && (
                <Text variant="caption" color="error" className="block mt-3">
                  {entry.error}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
