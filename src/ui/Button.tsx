import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "./utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent text-canvas hover:bg-accent-light disabled:hover:bg-accent",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-elevated",
  ghost:
    "border border-transparent bg-transparent text-muted hover:text-foreground",
  danger: "border border-danger/35 bg-danger/10 text-danger hover:bg-danger/15",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-lg px-3 py-1.5 text-xs",
  md: "rounded-lg px-4 py-2 text-sm",
  lg: "rounded-lg px-6 py-3 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  loadingLabel = "Running...",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={classNames(
        "inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
