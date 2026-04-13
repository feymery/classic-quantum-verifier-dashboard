interface PlotPlaceholderProps {
  label: string;
  height?: number;
}

export function PlotPlaceholder({ label, height = 120 }: PlotPlaceholderProps) {
  return (
    <div
      className="flex min-h-20 items-center justify-center rounded-[1.75rem] border px-4 text-center"
      style={{ height, borderColor: "#2d2b3a", background: "#181620" }}
    >
      <p className="text-xs" style={{ color: "#6b6780" }}>
        {label}
      </p>
    </div>
  );
}
