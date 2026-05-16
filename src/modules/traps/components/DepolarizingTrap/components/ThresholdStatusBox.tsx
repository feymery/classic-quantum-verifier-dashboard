/**
 * ThresholdStatusBox.tsx
 * Shows whether the current (alpha, lambda) combination can still be verified.
 */

import { PI_HALF } from "../DepolarizingTrap.constants";

interface Props {
  lam: number;
  lcrit: number;
  alpha: number;
  aboveCrit: boolean;
}

export function ThresholdStatusBox({ lam, lcrit, alpha, aboveCrit }: Props) {
  const alphaDeg = ((alpha / PI_HALF) * 90).toFixed(0);

  return (
    <div
      className={`rounded-md border px-4 py-3 text-[12px] ${
        aboveCrit
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-success/30 bg-success/10 text-success"
      }`}
    >
      {aboveCrit ? (
        <>
          <span className="mr-1.5 font-semibold">
            ⚠ VERIFICATION IMPOSSIBLE
          </span>
          at this α — λ exceeds λ_crit({alphaDeg}°) = {lcrit.toFixed(3)}
        </>
      ) : (
        <>
          <span className="mr-1.5 font-semibold">✓ Verification possible</span>—
          margin: Δλ = {(lcrit - lam).toFixed(3)} before threshold
        </>
      )}
    </div>
  );
}
