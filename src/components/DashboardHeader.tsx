import { BACKENDS, type BackendId, type Backend } from "../utils/constants";
import type { BackendStatus } from "../types/dashboard";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

interface DashboardHeaderProps {
  selectedBackend: BackendId;
  backend: Backend;
  backendStatus: BackendStatus;
  ibmToken: string;
  ibmTokenSet: boolean;
  showToken: boolean;
  onBackendChange: (id: BackendId) => void;
  onTokenChange: (token: string) => void;
  onToggleShowToken: () => void;
  onConfirmToken: () => void;
}

export function DashboardHeader({
  selectedBackend,
  backend,
  backendStatus,
  ibmToken,
  ibmTokenSet,
  showToken,
  onBackendChange,
  onTokenChange,
  onToggleShowToken,
  onConfirmToken,
}: DashboardHeaderProps) {
  return (
    <Card className="mb-6 rounded-lg" padded="lg" as="header">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Text variant="label" color="accent" className="tracking-[0.28em]">
            QV Dashboard
          </Text>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Quantum Verifier Protocol
          </h1>
          <Text variant="body" color="muted" className="max-w-2xl mt-2">
            Explore parameter control, backend selection, measurement outcomes,
            and energy estimation for a quantum verification workflow.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="backend-select">
            <Badge
              variant="neutral"
              className="px-4 py-2 text-sm text-foreground"
            >
              backend
            </Badge>
          </label>
          <select
            id="backend-select"
            value={selectedBackend}
            onChange={(event) =>
              onBackendChange(event.target.value as BackendId)
            }
            className="px-4 py-3 text-sm border border-border bg-surface text-foreground outline-none rounded-lg"
          >
            {BACKENDS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <Badge
            variant="neutral"
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-normal"
          >
            <span
              className="h-2.5 w-2.5 rounded-lg"
              style={{ backgroundColor: backend.dotColor }}
            />
            {backendStatus}
          </Badge>
        </div>
      </div>

      {selectedBackend === "ibm_runtime" && (
        <IbmTokenSection
          ibmToken={ibmToken}
          ibmTokenSet={ibmTokenSet}
          showToken={showToken}
          onToggleShowToken={onToggleShowToken}
          onTokenChange={onTokenChange}
          onConfirmToken={onConfirmToken}
        />
      )}
    </Card>
  );
}

// ── IBM token sub-section ─────────────────────────────────────────────────────

interface IbmTokenSectionProps {
  ibmToken: string;
  ibmTokenSet: boolean;
  showToken: boolean;
  onToggleShowToken: () => void;
  onTokenChange: (token: string) => void;
  onConfirmToken: () => void;
}

function IbmTokenSection({
  ibmToken,
  ibmTokenSet,
  showToken,
  onToggleShowToken,
  onTokenChange,
  onConfirmToken,
}: IbmTokenSectionProps) {
  return (
    <div className="px-5 py-4 mt-6 border border-border bg-surface rounded-lg">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="ibm-token">
          <Text
            variant="caption"
            color="muted"
            className="uppercase tracking-[0.18em]"
          >
            IBM Quantum API token
          </Text>
        </label>
        <Button
          aria-label={
            ibmTokenSet
              ? "Token is set — click to update"
              : "Click to enter token"
          }
          aria-expanded={showToken}
          size="md"
          variant="secondary"
          className={`rounded-lg border text-sm font-normal ${
            ibmTokenSet
              ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-200 border-rose-500/20"
          }`}
          onClick={onToggleShowToken}
        >
          {ibmTokenSet ? "token set" : "set token"}
        </Button>
      </div>

      {showToken && (
        <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
          <input
            id="ibm-token"
            type="password"
            value={ibmToken}
            onChange={(event) => onTokenChange(event.target.value)}
            placeholder="paste token — never stored or logged"
            autoComplete="off"
            className="flex-1 min-w-0 px-4 py-3 text-sm border border-border bg-canvas text-foreground outline-none rounded-lg"
          />
          <Button
            onClick={onConfirmToken}
            variant="secondary"
            size="lg"
            className="rounded-lg border text-sm font-normal disabled:opacity-40"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-accent) 30%, transparent)",
              background:
                "color-mix(in srgb, var(--color-accent) 10%, transparent)",
              color: "var(--color-accent-dim)",
            }}
            disabled={!ibmToken}
          >
            send to backend
          </Button>
        </div>
      )}
    </div>
  );
}
