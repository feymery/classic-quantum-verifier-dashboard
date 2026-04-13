import type { ReactNode } from "react";
import { classNames } from "./utils/classNames";

export interface PanelProps {
  step?: string;
  title: string;
  description?: string;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}

export function Panel({
  step,
  title,
  description,
  wide = false,
  className,
  children,
}: PanelProps) {
  return (
    <section
      className={classNames(
        "rounded-3xl border border-[#2d2b3a] bg-[#1e1c26] p-5 shadow-sm",
        wide ? "col-span-full" : "",
        className,
      )}
    >
      <div className="mb-4">
        {step && (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6b6780]">
            {step}
          </span>
        )}
        <h2 className="text-base font-semibold text-[#ddd9ee] mt-0.5">
          {title}
        </h2>
        {description && (
          <p className="mt-1 font-mono text-[11px] text-[#9490a8]">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
