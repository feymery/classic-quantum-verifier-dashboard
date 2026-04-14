/**
 * ConceptBox.tsx
 * Collapsible conceptual explanation card.
 */

import { useState } from "react";

interface ConceptBoxProps {
  title: string;
  accentColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ConceptBox({
  title,
  accentColor = "#a78bfa",
  defaultOpen = false,
  children,
}: ConceptBoxProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: open ? accentColor + "55" : "#2d2b3a",
        background: "#1e1c26",
        transition: "border-color 0.15s",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <span
          className="text-xs font-medium"
          style={{ color: open ? accentColor : "#9490a8" }}
        >
          {title}
        </span>
        <span
          className="font-mono text-base leading-none"
          style={{ color: "#4a4760" }}
          aria-hidden
        >
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div
          className="border-t px-3 pb-3 pt-2 text-xs leading-relaxed space-y-1"
          style={{ borderColor: "#2d2b3a", color: "#ddd9ee" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
