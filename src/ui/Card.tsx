import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { clsx as classNames } from "clsx";

type CardPadding = "none" | "sm" | "md" | "lg";

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  header?: ReactNode;
  footer?: ReactNode;
  padded?: CardPadding;
}

export function Card({
  as: Component = "div",
  header,
  footer,
  padded = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={classNames(
        "flex flex-col rounded-lg border border-border bg-surface",
        className,
      )}
      {...props}
    >
      {header && <div className="px-4 pt-4">{header}</div>}
      <div
        className={classNames(
          paddingClasses[padded],
          Boolean(header) && "pt-3",
          "relative flex-1",
        )}
      >
        {children}
      </div>
      {footer && <div className="px-4 pb-4">{footer}</div>}
    </Component>
  );
}
