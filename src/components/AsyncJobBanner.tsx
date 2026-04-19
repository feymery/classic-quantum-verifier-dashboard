import type { ActiveAsyncJob } from "../types/runner";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

interface AsyncJobBannerProps {
  job: ActiveAsyncJob | null;
  onDismiss: () => void;
  onRetry: () => void;
}

function modeLabel(mode: ActiveAsyncJob["mode"]): string {
  return mode === "twoQ" ? "2Q" : "1Q";
}

function statusVariant(
  status: ActiveAsyncJob["status"],
): "warning" | "success" | "error" | "neutral" {
  if (status === "queued" || status === "running") return "warning";
  if (status === "done") return "success";
  if (status === "failed") return "error";
  return "neutral";
}

function statusLabel(status: ActiveAsyncJob["status"]): string {
  if (status === "queued") return "queued";
  if (status === "running") return "running";
  if (status === "done") return "complete";
  if (status === "failed") return "failed";
  return status;
}

export function AsyncJobBanner({
  job,
  onDismiss,
  onRetry,
}: AsyncJobBannerProps) {
  if (!job) return null;

  const canRetry = job.status === "failed" || job.status === "done";
  const canDismiss = job.status === "done" || job.status === "failed";

  return (
    <Card
      className="mb-6 rounded-lg border"
      padded="md"
      style={{ borderColor: "#3a334a", background: "#181620" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="quantum">IBM workflow</Badge>
            <Badge variant={statusVariant(job.status)}>
              {statusLabel(job.status)}
            </Badge>
            <Badge variant="neutral">{modeLabel(job.mode)}</Badge>
            <Badge variant="neutral">{job.requestedBackend}</Badge>
          </div>

          <Text variant="body" className="mt-3 font-semibold">
            Long-running job in background
          </Text>
          <Text variant="caption" color="muted" className="mt-1 block">
            {job.message ?? "IBM job is being tracked in the background."}
          </Text>
          <Text variant="caption" color="muted" className="mt-2 block">
            job id: {job.jobId} · α={job.alpha.toFixed(4)} · shots=
            {job.shots.toLocaleString()}
          </Text>
          <Text variant="caption" color="muted" className="mt-1 block">
            You can keep navigating while polling continues. Cancellation is not
            available yet because the backend exposes no cancel endpoint.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            Cancel unavailable
          </Button>
          <Button
            onClick={onRetry}
            variant="secondary"
            size="sm"
            disabled={!canRetry}
          >
            Retry
          </Button>
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            disabled={!canDismiss}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}
