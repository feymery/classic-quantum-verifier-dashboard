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
  caption: " text-[10px]",
  label: "text-xs font-medium uppercase tracking-[0.24em]",
};

const colorClasses: Record<TextColor, string> = {
  primary: "text-foreground",
  muted: "text-muted",
  accent: "text-accent",
  success: "text-success",
  warning: "text-caution",
  error: "text-danger",
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
