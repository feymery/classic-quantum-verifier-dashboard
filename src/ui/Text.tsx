import type { HTMLAttributes } from "react";
import { classNames } from "./utils/classNames";

type TextVariant = "title" | "subtitle" | "body" | "caption" | "label";
type TextColor =
  | "primary"
  | "muted"
  | "accent"
  | "success"
  | "warning"
  | "error";

const variantClasses: Record<TextVariant, string> = {
  title: "text-2xl font-semibold",
  subtitle: "text-xl font-semibold",
  body: "text-sm",
  caption: "font-mono text-[10px]",
  label: "text-xs font-medium uppercase tracking-[0.24em]",
};

const colorClasses: Record<TextColor, string> = {
  primary: "text-[#ddd9ee]",
  muted: "text-[#9490a8]",
  accent: "text-[#a78bfa]",
  success: "text-[#34d399]",
  warning: "text-[#c7a472]",
  error: "text-[#f87171]",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "h1" | "h2" | "h3" | "label";
  variant?: TextVariant;
  color?: TextColor;
}

export function Text({
  as: Component = "p",
  variant = "body",
  color = "primary",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component
      className={classNames(
        variantClasses[variant],
        colorClasses[color],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
