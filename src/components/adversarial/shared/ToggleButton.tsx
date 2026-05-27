import { HONEST_COLOR, TRAP_COLOR } from "./trapShared.constants";

interface Props {
  isTrap: boolean;
  onToggle: () => void;
}

export function ToggleButton({ isTrap, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-all duration-300"
      style={
        isTrap
          ? {
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.4)",
              color: TRAP_COLOR,
            }
          : {
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              color: HONEST_COLOR,
            }
      }
    >
      {isTrap ? "← honest prover" : "activate trap →"}
    </button>
  );
}
