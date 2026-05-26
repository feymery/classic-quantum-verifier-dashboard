import type { JobHistoryItem } from "../../types/runner";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Text } from "../../ui/Text";
import { formatAlpha } from "../../utils/alphaUtils";

interface RunHistoryPanelProps {
  items: JobHistoryItem[];
  loading: boolean;
  error: string | null;
  onRestore: (item: JobHistoryItem) => void;
  onLoadResult: (item: JobHistoryItem) => void;
  onLoadSweep: (items: JobHistoryItem[]) => void;
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

// ── Sweep group helpers ────────────────────────────────────────────────────────

type HistoryEntry =
  | { kind: "solo"; item: JobHistoryItem; sortKey: string }
  | { kind: "sweep"; items: JobHistoryItem[]; sortKey: string };

function partitionItems(items: JobHistoryItem[]): HistoryEntry[] {
  const sweepMap = new Map<string, JobHistoryItem[]>();
  const soloItems: JobHistoryItem[] = [];

  for (const item of items) {
    if (item.sweepId) {
      const group = sweepMap.get(item.sweepId) ?? [];
      group.push(item);
      sweepMap.set(item.sweepId, group);
    } else {
      soloItems.push(item);
    }
  }

  const entries: HistoryEntry[] = [
    ...soloItems.map(
      (item): HistoryEntry => ({ kind: "solo", item, sortKey: item.createdAt }),
    ),
    ...[...sweepMap.values()].map(
      (group): HistoryEntry => ({
        kind: "sweep",
        items: group,
        sortKey: group.reduce(
          (max, i) => (i.createdAt > max ? i.createdAt : max),
          "",
        ),
      }),
    ),
  ];

  return entries.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

// ── Components ─────────────────────────────────────────────────────────────────

function SoloItem({
  item,
  onRestore,
  onLoadResult,
  onSync,
}: {
  item: JobHistoryItem;
  onRestore: (item: JobHistoryItem) => void;
  onLoadResult: (item: JobHistoryItem) => void;
  onSync: (item: JobHistoryItem) => void;
}) {
  return (
    <div className="px-4 py-4 border rounded-lg border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{item.executionSource ?? "unknown"}</Badge>
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
          <Button onClick={() => onRestore(item)} variant="secondary" size="sm">
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
  );
}

const DECISION_DOT_COLOR: Record<string, string> = {
  accept: "var(--color-success)",
  reject: "var(--color-danger)",
  boundary: "var(--color-warning)",
};

function SweepGroup({
  items,
  onRestore,
  onLoadSweep,
  onSync,
}: {
  items: JobHistoryItem[];
  onRestore: (item: JobHistoryItem) => void;
  onLoadSweep: (items: JobHistoryItem[]) => void;
  onSync: (item: JobHistoryItem) => void;
}) {
  const doneCount = items.filter((i) => i.status === "done").length;
  const acceptCount = items.filter((i) => i.decision === "accept").length;
  const rejectCount = items.filter((i) => i.decision === "reject").length;
  const sortedItems = [...items].sort((a, b) => a.alpha - b.alpha);
  const newest = items.reduce(
    (max, i) => (i.createdAt > max.createdAt ? i : max),
    items[0],
  );
  const first = sortedItems[0];
  const pendingIbmItems = items.filter(
    (i) =>
      (i.status === "pending" || i.status === "running") &&
      i.requestedBackend.includes("ibm"),
  );

  return (
    <div className="px-4 py-4 border rounded-lg border-border bg-surface">
      {/* Row 1: badges + timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral">sweep</Badge>
          <Badge variant="neutral">{items.length} α values</Badge>
          {acceptCount > 0 && (
            <Badge variant="success">accept: {acceptCount}</Badge>
          )}
          {rejectCount > 0 && (
            <Badge variant="error">reject: {rejectCount}</Badge>
          )}
          {doneCount < items.length && (
            <Badge variant="warning">pending: {items.length - doneCount}</Badge>
          )}
        </div>
        <Text variant="caption" color="muted" className="shrink-0">
          {formatTimestamp(newest.createdAt)}
        </Text>
      </div>

      {/* Row 2: alpha chips */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {sortedItems.map((item) => (
          <span
            key={item.jobId}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: `1px solid ${DECISION_DOT_COLOR[item.decision ?? ""] ?? "var(--color-border)"}`,
              color:
                DECISION_DOT_COLOR[item.decision ?? ""] ?? "var(--color-muted)",
            }}
          >
            {formatAlpha(item.alpha)}
            {item.status !== "done" && (
              <span className="opacity-60">({item.status})</span>
            )}
          </span>
        ))}
      </div>

      {/* Row 3: shots info + action buttons */}
      <div className="flex items-center justify-between gap-3 mt-3">
        <Text variant="caption" color="muted">
          shots: {first?.shots.toLocaleString()} &middot;{" "}
          {first?.requestedBackend ?? "—"}
        </Text>
        <div className="flex items-center gap-2">
          {pendingIbmItems.length > 0 && (
            <Button
              onClick={() => pendingIbmItems.forEach((i) => onSync(i))}
              variant="secondary"
              size="sm"
            >
              Sync results
            </Button>
          )}
          {first && (
            <Button onClick={() => onRestore(first)} variant="ghost" size="sm">
              Restore inputs
            </Button>
          )}
          {doneCount > 0 && (
            <Button
              onClick={() => onLoadSweep(items)}
              variant="primary"
              size="sm"
            >
              Load sweep
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RunHistoryPanel({
  items,
  loading,
  error,
  onRestore,
  onLoadResult,
  onLoadSweep,
  onSync,
}: RunHistoryPanelProps) {
  const entries = partitionItems(items);

  return (
    <>
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

      {!loading && error === null && entries.length === 0 ? (
        <div className="px-4 py-5 mt-4 border rounded-lg border-border bg-surface">
          <Text variant="caption" color="muted">
            No runs recorded yet. Execute an experiment once and the timeline
            will appear here. Results are stored on the server.
          </Text>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {entries.map((entry) =>
            entry.kind === "solo" ? (
              <SoloItem
                key={entry.item.jobId}
                item={entry.item}
                onRestore={onRestore}
                onLoadResult={onLoadResult}
                onSync={onSync}
              />
            ) : (
              <SweepGroup
                key={entry.items[0].sweepId}
                items={entry.items}
                onRestore={onRestore}
                onLoadSweep={onLoadSweep}
                onSync={onSync}
              />
            ),
          )}
        </div>
      )}
    </>
  );
}
