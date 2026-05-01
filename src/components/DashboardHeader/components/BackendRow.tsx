import {
  BACKENDS,
  type BackendId,
  type Backend,
} from "../../../utils/constants";
import type { BackendStatus } from "../../../types/dashboard";
import { Badge } from "../../../ui/Badge";

export interface BackendRowProps {
  selectedBackend: BackendId;
  backend: Backend;
  backendStatus: BackendStatus;
  onBackendChange: (id: BackendId) => void;
  onOpenHistory: () => void;
}

export function BackendRow({
  selectedBackend,
  backend,
  backendStatus,
  onBackendChange,
}: BackendRowProps) {
  return (
    <div className="flex justify-between gap-3">
      <Badge variant="neutral">backend</Badge>
      <div className="flex gap-3">
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
            className="h-2.5 w-2.5 rounded-lg"
            style={{ backgroundColor: backend.dotColor }}
          />
          {backendStatus}
        </Badge>
      </div>
    </div>
  );
}
