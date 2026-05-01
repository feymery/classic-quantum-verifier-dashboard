import { Button } from "../../../ui";

export const IntroPanel = ({
  onOpenHistory,
}: {
  onOpenHistory: () => void;
}) => {
  return (
    <div className="flex flex-col gap-3 ">
      <div className="flex flex-col justify-between gap-3 md:flex-row">
        <h1 className="text-2xl font-semibold leading-snug text-foreground">
          Quantum Verifier Protocol
        </h1>
        <Button onClick={onOpenHistory} size="sm">
          History
        </Button>
      </div>
      <div className="flex flex-wrap">
        <p className="text-sm leading-relaxed text-muted">
          Interactive companion to{" "}
          <span className="font-medium text-foreground">
            Stricker et al. (2024)
          </span>
          , which demonstrates a classical-verifier protocol for certifying
          quantum state preparation on a real device.
        </p>
        <ol className="space-y-1 text-sm list-none text-muted">
          <li>
            <span className="font-medium text-foreground">
              1. Set α &amp; shots
            </span>{" "}
            — choose the preparation angle and sample count.
          </li>
          <li>
            <span className="font-medium text-foreground">
              2. Run experiment
            </span>{" "}
            — executes three measurement bases (Z, ZX, X) and estimates the
            energy ⟨E⟩.
          </li>
          <li>
            <span className="font-medium text-foreground">
              3. Read the verdict
            </span>{" "}
            — <em>accept</em> if E &lt; 0.4, <em>reject</em> if E ≥ 0.5,
            <em> boundary</em> in between.
          </li>
          <li>
            <span className="font-medium text-foreground">4. Explore tabs</span>{" "}
            — sweep α or shots, inspect noise curves, circuit diagrams, and
            protocol details.
          </li>
        </ol>
      </div>
    </div>
  );
};
