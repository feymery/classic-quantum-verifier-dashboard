import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-2 text-[10px] uppercase tracking-widest"
      style={{ color: "#6b6780" }}
    >
      {children}
    </p>
  );
}
