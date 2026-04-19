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
        "rounded-lg border border-border bg-elevated p-5 shadow-card",
        wide ? "col-span-full" : "",
        className,
      )}
    >
      <div className="mb-4">
        {step && (
          <span className=" text-[10px] uppercase tracking-[0.22em] text-subtle">
            {step}
          </span>
        )}
        <h2 className="text-base font-semibold text-foreground mt-0.5">
          {title}
        </h2>
        {description && (
          <p className="mt-1  text-[11px] text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
