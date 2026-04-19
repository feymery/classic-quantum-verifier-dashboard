import { Button } from "../../../ui/Button";
import { Text } from "../../../ui/Text";

export interface IbmTokenSectionProps {
  ibmToken: string;
  ibmTokenSet: boolean;
  showToken: boolean;
  onToggleShowToken: () => void;
  onTokenChange: (token: string) => void;
  onConfirmToken: () => void;
}

export function IbmTokenSection({
  ibmToken,
  ibmTokenSet,
  showToken,
  onToggleShowToken,
  onTokenChange,
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
            className="flex-1 min-w-0 px-4 py-3 text-sm border rounded-lg outline-none border-border bg-canvas text-foreground"
          />
          <Button
            onClick={onConfirmToken}
            variant="secondary"
            size="lg"
            className="text-sm font-normal border rounded-lg disabled:opacity-40"
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
