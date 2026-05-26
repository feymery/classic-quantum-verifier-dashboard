/**
 * TrapCard.tsx — Universal shell for all protocol traps.
 *
 * Manages mode state (honest / trap), renders the toggle button,
 * and renders the shared 2-qubit circuit section.
 *
 * With `children`: renders the active card.
 * Without:         renders the "coming soon" skeleton.
 */

import { useState } from "react";
import type { ReactNode } from "react";
import { ToggleButton } from "../shared/ToggleButton";
import { TrapCircuitSection } from "../shared/TrapCircuitSection";

interface ActiveProps {
  id: string;
  title: string;
  description: string;
  alpha: number;
  /** Annotation shown on the circuit in trap mode (pass the current value; TrapCard hides it in honest mode). */
  circuitAnnotation?: string;
  /** Enables the hide/show diff toggle button on the circuit (ClassicalStateTrap). */
  circuitShowDiffToggle?: boolean;
  /** Non-uniform step weights for the circuit (BiasedAmplitudesTrap). Applied only in trap mode. */
  circuitStepWeights?: [number, number, number];
  children: (ctx: { isTrap: boolean }) => ReactNode;
}

interface SkeletonProps {
  id: string;
  title: string;
  description: string;
  alpha?: never;
  circuitAnnotation?: never;
  circuitShowDiffToggle?: never;
  circuitStepWeights?: never;
  children?: never;
}

type Props = ActiveProps | SkeletonProps;

export function TrapCard({
  id,
  title,
  description,
  alpha,
  circuitAnnotation,
  circuitStepWeights,
  children,
}: Props) {
  const [mode, setMode] = useState<"honest" | "trap">("honest");
  const [collapsed, setCollapsed] = useState(false);

  const isActive = Boolean(children);
  const isTrap = isActive && mode === "trap";

  // border shifts from border → success-tinted (honest active) → danger-tinted (trap)
  const borderClass = isTrap
    ? "border-danger/30"
    : isActive
      ? "border-accent/20"
      : "border-border";

  return (
    <div
      className={`transition-colors duration-500 border rounded-lg bg-canvas ${borderClass}`}
      style={{ opacity: isActive ? 1 : 0.55 }}
    >
      {/* ── Header (always visible, clickable to collapse) ── */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => isActive && setCollapsed((v) => !v)}
      >
        <div className="flex items-center min-w-0 gap-3">
          <span
            className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
              isActive
                ? "bg-accent/10 text-accent"
                : "bg-elevated text-subtle/60"
            }`}
          >
            {id}
          </span>
          <h2
            className={`text-[14px] font-semibold truncate ${
              isActive ? "text-foreground" : "text-subtle/60"
            }`}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isActive ? (
            <>
              <div onClick={(e) => e.stopPropagation()}>
                <ToggleButton
                  isTrap={isTrap}
                  onToggle={() => {
                    setMode(isTrap ? "honest" : "trap");
                    if (collapsed) setCollapsed(false);
                  }}
                />
              </div>
              <button
                className="p-1 transition-colors rounded text-subtle hover:text-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed((v) => !v);
                }}
                aria-label={collapsed ? "Expand" : "Collapse"}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{
                    transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 200ms",
                  }}
                >
                  <path
                    d="M2 5l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          ) : (
            <span className="rounded-lg px-2 py-0.5 text-[10px] bg-elevated text-subtle">
              coming soon
            </span>
          )}
        </div>
      </div>

      {/* ── Circuit (left) + body (right) ── */}
      {!collapsed && children && alpha !== undefined && (
        <div className="flex flex-col items-start gap-3 px-5 pb-5 lg:flex-row">
          <div className="flex flex-col gap-3 shrink-0 lg:w-1/3">
            <TrapCircuitSection
              alpha={alpha}
              isTrap={isTrap}
              annotation={isTrap ? circuitAnnotation : undefined}
              stepWeights={isTrap ? circuitStepWeights : undefined}
            />
            {/* ── Description (hidden when collapsed) ── */}
            {!collapsed && isActive && (
              <p className="px-5 pb-3 text-[12px] text-muted">{description}</p>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-4">{children({ isTrap })}</div>
        </div>
      )}

      {/* ── Skeleton description (always visible) ── */}
      {!isActive && (
        <p className="px-5 pb-4 text-[12px] text-subtle/60">{description}</p>
      )}
    </div>
  );
}
