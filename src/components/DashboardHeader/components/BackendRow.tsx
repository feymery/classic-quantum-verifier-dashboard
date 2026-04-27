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
}

export function BackendRow({
  selectedBackend,
  backend,
  backendStatus,
  onBackendChange,
}: BackendRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="backend-select">
        <Badge variant="neutral" className="px-4 py-2 text-sm text-foreground">
          backend
        </Badge>
      </label>

      <select
        id="backend-select"
        value={selectedBackend}
        onChange={(event) => onBackendChange(event.target.value as BackendId)}
        className="p-2 text-xs border rounded-lg outline-none border-border bg-surface text-foreground"
      >
        {BACKENDS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      <Badge
        variant="neutral"
        className="flex items-center gap-2 px-4 py-2 text-sm font-normal rounded-lg"
      >
        <span
          className="h-2.5 w-2.5 rounded-lg"
          style={{ backgroundColor: backend.dotColor }}
        />
        {backendStatus}
      </Badge>
    </div>
  );
}
