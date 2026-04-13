import type { ExecutionSource } from "../hooks/useExperimentRunner";
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
  if (source === "fallback-local") return "local fallback";
  if (source === "local-mock") return "local mock";
  if (source === "local-2q") return "local 2Q";
  return "unknown";
}

function sourceDescription(source: ExecutionSource | null): string {
  if (source === "api") return "Result produced by the FastAPI backend.";
  if (source === "fallback-local") {
    return "Backend path was requested, then resolved locally after fallback.";
  }
  if (source === "local-mock") {
    return "Result generated entirely in the frontend mock simulator.";
  }
  if (source === "local-2q") {
    return "2Q result generated entirely in the frontend simulator.";
  }
  return "Execution origin is unavailable for this result.";
}

function sourceVariant(
  source: ExecutionSource | null,
): "success" | "warning" | "neutral" {
  if (source === "api") return "success";
  if (source === "fallback-local") return "warning";
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
      className="rounded-2xl border px-3 py-2.5"
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
      <Text variant="caption" color="muted" className="mt-2 block">
        {sourceDescription(executionSource)}
      </Text>
      {jobId && (
        <Text variant="caption" color="muted" className="mt-1 block">
          job id: {jobId}
        </Text>
      )}
    </div>
  );
}
