import { Button } from "../../../ui/Button";
import { Text } from "../../../ui/Text";

export interface IbmTokenSectionProps {
  ibmToken: string;
  ibmTokenSet: boolean;
  ibmInstance: string;
  ibmBackendName: string;
  showToken: boolean;
  onToggleShowToken: () => void;
  onTokenChange: (token: string) => void;
  onInstanceChange: (instance: string) => void;
  onBackendNameChange: (name: string) => void;
  onConfirmToken: () => void;
}

export function IbmTokenSection({
  ibmToken,
  ibmTokenSet,
  ibmInstance,
  ibmBackendName,
  showToken,
  onToggleShowToken,
  onTokenChange,
  onInstanceChange,
  onBackendNameChange,
  onConfirmToken,
}: IbmTokenSectionProps) {
  return (
    <div className="px-5 py-4 mt-6 border rounded-lg border-border bg-surface">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="ibm-token">
          <Text
            variant="caption"
            color="muted"
            className="uppercase tracking-[0.18em]"
          >
            IBM Quantum credentials
          </Text>
        </label>
        <Button
          aria-label={
            ibmTokenSet
              ? "Token is set — click to update"
              : "Click to enter credentials"
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
          {ibmTokenSet ? "credentials set" : "set credentials"}
        </Button>
      </div>

      {showToken && (
        <div className="flex flex-col gap-3 mt-4">
          {/* Token row */}
          <div className="flex flex-col gap-1">
            <label htmlFor="ibm-token">
              <Text variant="caption" color="muted" className="text-xs">
                API token
              </Text>
            </label>
            <input
              id="ibm-token"
              type="password"
              value={ibmToken}
              onChange={(event) => onTokenChange(event.target.value)}
              placeholder="paste token — never stored or logged"
              autoComplete="off"
              className="w-full px-4 py-3 text-sm border rounded-lg outline-none border-border bg-canvas text-foreground"
            />
          </div>

          {/* Instance row */}
          <div className="flex flex-col gap-1">
            <label htmlFor="ibm-instance">
              <Text variant="caption" color="muted" className="text-xs">
                instance <span className="opacity-50">(CRN — optional)</span>
              </Text>
            </label>
            <input
              id="ibm-instance"
              type="text"
              value={ibmInstance}
              onChange={(event) => onInstanceChange(event.target.value)}
              placeholder="crn:v1:bluemix:public:quantum-computing:eu-de:a/..."
              autoComplete="off"
              spellCheck={false}
              className="w-full px-4 py-3 font-mono text-sm border rounded-lg outline-none border-border bg-canvas text-foreground"
            />
          </div>

          {/* Backend name row */}
          <div className="flex flex-col gap-1">
            <label htmlFor="ibm-backend-name">
              <Text variant="caption" color="muted" className="text-xs">
                backend name <span className="opacity-50">(required)</span>
              </Text>
            </label>
            <input
              id="ibm-backend-name"
              type="text"
              value={ibmBackendName}
              onChange={(event) => onBackendNameChange(event.target.value)}
              placeholder="ibm_strasbourg"
              autoComplete="off"
              spellCheck={false}
              className="w-full px-4 py-3 font-mono text-sm border rounded-lg outline-none border-border bg-canvas text-foreground"
            />
          </div>

          <Button
            onClick={onConfirmToken}
            variant="secondary"
            size="lg"
            className="self-start text-sm font-normal border rounded-lg disabled:opacity-40"
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
