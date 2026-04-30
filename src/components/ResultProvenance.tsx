import type { ExecutionSource } from "../types/runner";
import { Badge } from "../ui/Badge";
import { Text } from "../ui/Text";

interface ResultProvenanceProps {
  executionSource: ExecutionSource | null;
  backend: string | null;
  jobId?: string | null;
  shotsExecuted?: number | null;
}

function sourceLabel(source: ExecutionSource | null): string {
  if (source === "api") return "backend API";
  return "unknown";
}

function sourceDescription(source: ExecutionSource | null): string {
  if (source === "api") return "Result produced by the FastAPI backend.";
  return "Execution origin is unavailable for this result.";
}

function sourceVariant(
  source: ExecutionSource | null,
): "success" | "warning" | "neutral" {
  if (source === "api") return "success";
  return "neutral";
}

export function ResultProvenance({
  executionSource,
  backend,
  jobId,
  shotsExecuted,
}: ResultProvenanceProps) {
  return (
    <div
      className="rounded-lg border px-3 py-2.5"
      style={{ borderColor: "#2d2b3a", background: "#181620" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Text as="span" variant="caption" color="muted">
          data provenance
        </Text>
        <Badge variant={sourceVariant(executionSource)}>
          {sourceLabel(executionSource)}
        </Badge>
        {backend && <Badge variant="neutral">backend: {backend}</Badge>}
        {typeof shotsExecuted === "number" && (
          <Badge variant="neutral">shots: {shotsExecuted}</Badge>
        )}
      </div>
      <Text variant="caption" color="muted" className="block mt-2">
        {sourceDescription(executionSource)}
      </Text>
      {jobId && (
        <Text variant="caption" color="muted" className="block mt-1">
          job id: {jobId}
        </Text>
      )}
    </div>
  );
}
