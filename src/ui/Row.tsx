import type { ReactNode } from "react";
import type { AccentTone } from "../types/dashboard";

interface RowProps {
  label: string;
  value: string | number | ReactNode;
  accent?: AccentTone;
}

const accentMap: Record<AccentTone, string> = {
  cyan: "text-accent",
  amber: "text-amber-300",
  purple: "text-purple-300",
  neutral: "text-foreground",
};

export function Row({ label, value, accent = "neutral" }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-t border-border first:border-t-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={`${accentMap[accent]} text-sm font-medium`}>
        {value}
      </span>
    </div>
  );
}
