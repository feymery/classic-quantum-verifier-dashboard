import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[10px] uppercase tracking-widest text-subtle">
      {children}
    </p>
  );
}
