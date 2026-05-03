import { Button } from "../../../ui";

const steps = [
  {
    number: "01",
    title: "Set α & shots",
    description: "Choose the preparation angle and sample count.",
    color: "text-accent",
    border: "border-accent/30",
    bg: "bg-accent/10",
    numberBg: "bg-accent/20 text-accent",
  },
  {
    number: "02",
    title: "Run experiment",
    description:
      "Executes three measurement bases (Z, ZX, X) and estimates the energy ⟨E⟩.",
    color: "text-success",
    border: "border-success/30",
    bg: "bg-success/10",
    numberBg: "bg-success/20 text-success",
  },
  {
    number: "03",
    title: "Read the verdict",
    description: (
      <>
        <em className="not-italic font-medium text-success">Accept</em> if E
        &lt; 0.4, <em className="not-italic font-medium text-danger">reject</em>{" "}
        if E ≥ 0.5,{" "}
        <em className="not-italic font-medium text-caution">boundary</em> in
        between.
      </>
    ),
    color: "text-caution",
    border: "border-caution/30",
    bg: "bg-caution/10",
    numberBg: "bg-caution/20 text-caution",
  },
  {
    number: "04",
    title: "Explore tabs",
    description:
      "Sweep α or shots, inspect noise curves, circuit diagrams, and protocol details.",
    color: "text-accent-light",
    border: "border-accent-light/30",
    bg: "bg-accent-light/10",
    numberBg: "bg-accent-light/20 text-accent-light",
  },
] as const;

export const IntroPanel = ({
  onOpenHistory,
}: {
  onOpenHistory: () => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-semibold leading-snug text-foreground">
            Quantum Verifier Protocol
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Interactive companion to{" "}
            <span className="font-medium text-foreground">
              Stricker et al. (2024)
            </span>
            , certifying quantum state preparation on a real device.
          </p>
        </div>
        <Button onClick={onOpenHistory} size="sm" className="shrink-0">
          History
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex flex-col gap-2 rounded-lg border ${step.border} ${step.bg} p-3`}
          >
            <span
              className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${step.numberBg}`}
            >
              {step.number}
            </span>
            <p className={`text-sm font-semibold leading-tight ${step.color}`}>
              {step.title}
            </p>
            <p className="text-xs leading-relaxed text-muted">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
