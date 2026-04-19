import type { HTMLAttributes } from "react";
import { clsx as classNames } from "clsx";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "quantum";

const badgeClasses: Record<BadgeVariant, string> = {
  success: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  warning: "border border-amber-500/20 bg-amber-500/10 text-amber-200",
  error: "border border-rose-500/20 bg-rose-500/10 text-rose-200",
  neutral: "border border-border bg-surface text-muted",
  quantum: "border border-accent/30 bg-accent/10 text-accent-dim",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium",
        badgeClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
