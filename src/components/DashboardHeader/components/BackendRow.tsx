import { BACKENDS, type BackendId } from "../../../utils/constants";
import type { BackendStatus } from "../../../types/dashboard";
import { Badge } from "../../../ui/Badge";

export interface BackendRowProps {
  selectedBackend: BackendId;
  backendStatus: BackendStatus;
  onBackendChange: (id: BackendId) => void;
  onOpenHistory: () => void;
}

const statusColors: Record<BackendStatus, string> = {
  idle: "bg-success",
  error: "bg-error",
  running: "bg-warning",
};

export function BackendRow({
  selectedBackend,
  backendStatus,
  onBackendChange,
}: BackendRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs select-none text-muted">backend</span>
      <div className="flex gap-2">
        <select
          id="backend-select"
          value={selectedBackend}
          onChange={(event) => onBackendChange(event.target.value as BackendId)}
          className="p-1 text-xs border rounded-lg outline-none border-border bg-surface text-foreground"
        >
          {BACKENDS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <Badge
          variant="neutral"
          className="flex items-center gap-2 p-1 text-sm font-normal rounded-lg"
        >
          <span
            className={`h-1.5 w-1.5 rounded-lg ${statusColors[backendStatus]}`}
          />
          {backendStatus}
        </Badge>
      </div>
    </div>
  );
}
