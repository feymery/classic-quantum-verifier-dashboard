import type { ReactNode } from "react";
import { Badge } from "../../../../../ui/Badge";

export function StepTag({ children }: { children: ReactNode }) {
  return (
    <Badge variant="quantum" className="rounded px-1.5 py-0.5  text-[10px]">
      {children}
    </Badge>
  );
}
