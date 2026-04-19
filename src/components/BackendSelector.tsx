import type { Backend } from "../utils/constants";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

interface BackendSelectorProps {
  backends: Backend[];
  selectedBackend: string;
  backendStatus: string;
  onChange: (selected: string) => void;
}

export function BackendSelector({
  backends,
  selectedBackend,
  backendStatus,
  onChange,
}: BackendSelectorProps) {
  return (
    <Card
      className="rounded-lg"
      padded="lg"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <Text
            variant="label"
            color="muted"
            className="tracking-[0.24em] text-subtle"
          >
            Backend
          </Text>
        </div>
        <Badge
          variant={backendStatus === "running" ? "success" : "neutral"}
          className={`rounded-lg px-3 py-1 text-xs ${
            backendStatus === "running"
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-elevated text-subtle"
          }`}
        >
          {backendStatus}
        </Badge>
      </div>
      <label className="block text-sm font-medium text-foreground">
        Backend
      </label>
      <select
        value={selectedBackend}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 py-3 mt-2 text-sm border rounded-lg outline-none border-border bg-elevated text-foreground"
      >
        {backends.map((backend) => (
          <option key={backend.id} value={backend.id}>
            {backend.label}
          </option>
        ))}
      </select>
    </Card>
  );
}
