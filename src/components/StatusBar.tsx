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
    <div
      className="sticky bottom-0 z-10 border-t px-6 py-3 backdrop-blur-sm"
      style={{ borderColor: "#2d2b3a", background: "rgba(19,18,23,0.95)" }}
    >
      <div
        className="flex flex-wrap items-center gap-3 text-xs"
        style={{ color: "#9490a8" }}
      >
        <span className="font-semibold" style={{ color: "#ddd9ee" }}>
          α = {alpha.toFixed(4)}
        </span>
        <span className="text-amber-300">E = {energy}</span>
        <span>shots = {shots}</span>
        <span>λ = {noiseLambda.toFixed(3)}</span>
        <span>backend = {selectedBackend}</span>
        <span style={{ color: comparisonCount ? "#a78bfa" : "#6b6780" }}>
          compare [{comparisonCount}]
        </span>
      </div>
    </div>
  );
}
