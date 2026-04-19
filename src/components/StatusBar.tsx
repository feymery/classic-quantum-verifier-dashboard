interface StatusBarProps {
  alpha: number;
  energy: string;
  shots: number;
  noiseLambda: number;
  selectedBackend: string;
  comparisonCount: number;
}

export function StatusBar({
  alpha,
  energy,
  shots,
  noiseLambda,
  selectedBackend,
  comparisonCount,
}: StatusBarProps) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border px-6 py-3 backdrop-blur-sm bg-canvas/95">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="font-semibold text-foreground">
          α = {alpha.toFixed(4)}
        </span>
        <span className="text-amber-300">E = {energy}</span>
        <span>shots = {shots}</span>
        <span>λ = {noiseLambda.toFixed(3)}</span>
        <span>backend = {selectedBackend}</span>
        <span className={comparisonCount ? "text-accent" : "text-subtle"}>
          compare [{comparisonCount}]
        </span>
      </div>
    </div>
  );
}
