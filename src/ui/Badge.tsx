import type { HTMLAttributes } from "react";
import { classNames } from "./utils/classNames";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "quantum";

const badgeClasses: Record<BadgeVariant, string> = {
  success: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  warning: "border border-amber-500/20 bg-amber-500/10 text-amber-200",
  error: "border border-rose-500/20 bg-rose-500/10 text-rose-200",
  neutral: "border border-[#2d2b3a] bg-[#181620] text-[#9490a8]",
  quantum:
    "border border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.1)] text-[#d8b4fe]",
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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        badgeClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
