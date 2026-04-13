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
    <Card className="rounded-4xl" padded="lg" style={{ background: "#181620" }}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <Text
            variant="label"
            color="muted"
            className="tracking-[0.24em]"
            style={{ color: "#6b6780" }}
          >
            Backend
          </Text>
        </div>
        <Badge
          variant={backendStatus === "running" ? "success" : "neutral"}
          className={`rounded-full px-3 py-1 text-xs ${
            backendStatus === "running"
              ? "bg-emerald-500/10 text-emerald-300"
              : ""
          }`}
          style={
            backendStatus !== "running"
              ? { background: "#1e1c26", color: "#6b6780" }
              : undefined
          }
        >
          {backendStatus}
        </Badge>
      </div>
      <label className="block text-sm font-medium" style={{ color: "#ddd9ee" }}>
        Backend
      </label>
      <select
        value={selectedBackend}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 py-3 mt-2 text-sm border outline-none rounded-2xl"
        style={{
          borderColor: "#2d2b3a",
          background: "#1e1c26",
          color: "#ddd9ee",
        }}
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
