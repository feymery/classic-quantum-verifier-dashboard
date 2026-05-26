import type { CSSProperties, HTMLAttributes } from "react";
import { clsx as classNames } from "clsx";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "quantum";

const badgeClasses: Record<BadgeVariant, string> = {
  success: "border",
  warning: "border",
  error: "border",
  neutral: "border border-border bg-surface text-muted",
  quantum: "border border-accent/30 bg-accent/10 text-accent-dim",
};

const badgeVarStyles: Record<BadgeVariant, CSSProperties> = {
  success: {
    color: "var(--color-badge-success-text)",
    background: "var(--color-badge-success-bg)",
    borderColor: "var(--color-badge-success-border)",
  },
  warning: {
    color: "var(--color-badge-warning-text)",
    background: "var(--color-badge-warning-bg)",
    borderColor: "var(--color-badge-warning-border)",
  },
  error: {
    color: "var(--color-badge-error-text)",
    background: "var(--color-badge-error-bg)",
    borderColor: "var(--color-badge-error-border)",
  },
  neutral: {},
  quantum: {},
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "neutral",
  className,
  style,
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
      style={{ ...badgeVarStyles[variant], ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
