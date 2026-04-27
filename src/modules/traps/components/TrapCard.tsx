/**
 * TrapCard.tsx — Universal shell for all protocol traps.
 *
 * With `children`: renders the active header + body content.
 * Without:         renders the header in "coming soon" skeleton mode.
 */

import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  description: string;
  /** Right slot of the header (e.g. toggle button). */
  actions?: ReactNode;
  /** Container border color — defaults to #2d2b3a. */
  borderColor?: string;
  /** Card body; if absent the skeleton is shown. */
  children?: ReactNode;
}

export function TrapCard({
  id,
  title,
  description,
  actions,
  borderColor,
  children,
}: Props) {
  const isActive = Boolean(children);
  const resolvedBorder = borderColor ?? (isActive ? "#1a2a3a" : "#2d2b3a");

  return (
    <div
      className="rounded-lg border p-5 space-y-5 transition-colors duration-500"
      style={{
        borderColor: resolvedBorder,
        background: "#131217",
        opacity: isActive ? 1 : 0.55,
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="rounded-lg px-2 py-0.5  text-[10px] font-bold uppercase"
              style={{
                background: isActive ? "#2a2338" : "#1e1c2a",
                color: isActive ? "#a78bfa" : "#4b4860",
              }}
            >
              {id}
            </span>
            <h2
              className=" text-[14px] font-semibold"
              style={{ color: isActive ? "#ddd9ee" : "#4b4860" }}
            >
              {title}
            </h2>
          </div>
          <p
            className="mt-1 text-[12px]"
            style={{ color: isActive ? "#9490a8" : "#4b4860" }}
          >
            {description}
          </p>
        </div>

        {actions ??
          (!isActive && (
            <span
              className="shrink-0 rounded-lg px-2 py-0.5  text-[10px]"
              style={{ background: "#1e1c2a", color: "#6b6780" }}
            >
              coming soon
            </span>
          ))}
      </div>

      {/* ── Body ── */}
      {children}
    </div>
  );
}
