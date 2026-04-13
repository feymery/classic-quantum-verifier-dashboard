import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "./utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-[#a78bfa] bg-[#a78bfa] text-[#131217] hover:bg-[#c4b5fd] disabled:hover:bg-[#a78bfa]",
  secondary:
    "border border-[#2d2b3a] bg-[#181620] text-[#ddd9ee] hover:bg-[#1f1b2a]",
  ghost:
    "border border-transparent bg-transparent text-[#9490a8] hover:text-[#ddd9ee]",
  danger:
    "border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.1)] text-[#f87171] hover:bg-[rgba(248,113,113,0.15)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-xl px-3 py-1.5 text-xs",
  md: "rounded-2xl px-4 py-2 text-sm",
  lg: "rounded-3xl px-6 py-3 text-sm",
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
