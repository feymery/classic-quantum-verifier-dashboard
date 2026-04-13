import { Link } from "react-router-dom";
import { useAppState } from "../state/useAppState";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

const SECTIONS = [
  {
    to: "/experiment",
    title: "Experiment",
    desc: "Primary workflow: controls, run, measurements, and basic results.",
  },
  {
    to: "/visualization",
    title: "Visualization",
    desc: "Energy, histogram, and comparison charts in one place.",
  },
  {
    to: "/circuit",
    title: "Circuit",
    desc: "Circuit structure, state representation, and key observables.",
  },
  {
    to: "/adversarial",
    title: "Adversarial",
    desc: "Adversarial controls, attack curves, and detection analysis.",
  },
];

export function DashboardPage() {
  const { dashboard, runner } = useAppState();

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl" padded="lg">
        <Text variant="label" color="accent" className="tracking-[0.28em]">
          platform overview
        </Text>
        <Text as="h2" variant="title" color="primary" className="mt-3">
          Quantum Verifier Workspace
        </Text>
        <Text variant="body" color="muted" className="mt-2">
          Navigation now uses URL-routed pages. Execution remains centralized
          via the single Run Experiment action in the primary control bar.
        </Text>

        <div className="grid gap-3 mt-4 md:grid-cols-3">
          <Metric label="alpha" value={dashboard.alpha.toFixed(4)} />
          <Metric label="shots" value={String(dashboard.shots)} />
          <Metric label="last job" value={runner.latestJobId ?? "--"} />
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.to} to={section.to}>
            <Card
              padded="md"
              className="rounded-3xl transition"
              style={{
                borderColor: "#2d2b3a",
                background: "#181620",
                color: "#ddd9ee",
              }}
            >
              <Text as="p" variant="subtitle" className="text-lg">
                {section.title}
              </Text>
              <Text
                as="p"
                variant="caption"
                color="muted"
                className="mt-1 text-xs"
              >
                {section.desc}
              </Text>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card
      className="rounded-xl"
      padded="sm"
      style={{ borderColor: "#2d2b3a", background: "#181620" }}
    >
      <Text
        as="p"
        variant="caption"
        className="uppercase tracking-[0.24em]"
        style={{ color: "#6b6780" }}
      >
        {label}
      </Text>
      <Text as="p" variant="subtitle" color="accent" className="mt-2 text-lg">
        {value}
      </Text>
    </Card>
  );
}
