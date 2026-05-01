import { Badge } from "../ui/Badge";
import { Text } from "../ui/Text";

interface ResultProvenanceProps {
  backend: string | null;
  jobId?: string | null;
  shotsExecuted?: number | null;
}

export function ResultProvenance({
  backend,
  jobId,
  shotsExecuted,
}: ResultProvenanceProps) {
  return (
    <div className="rounded-lg border px-3 py-2.5 border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2">
        <Text as="span" variant="caption" color="muted">
          data provenance
        </Text>
        {backend && <Badge variant="neutral">backend: {backend}</Badge>}
        {typeof shotsExecuted === "number" && (
          <Badge variant="neutral">shots: {shotsExecuted}</Badge>
        )}
      </div>
      {jobId && (
        <Text variant="caption" color="muted" className="block mt-1">
          job id: {jobId}
        </Text>
      )}
    </div>
  );
}
