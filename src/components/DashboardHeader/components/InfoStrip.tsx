export interface InfoStripProps {
  energy: string;
  comparisonCount: number;
  latestJobId: string | null;
}

export function InfoStrip({
  energy,
  comparisonCount,
  latestJobId,
}: InfoStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-4 mt-4 text-xs border-t border-border text-muted">
      <span className="text-amber-300">E = {energy}</span>
      <span className={comparisonCount ? "text-accent" : ""}>
        compare [{comparisonCount}]
      </span>
      <span className={latestJobId ? "text-emerald-300" : ""}>
        last job = {latestJobId ?? "--"}
      </span>
    </div>
  );
}
