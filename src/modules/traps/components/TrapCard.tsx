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
  circuitShowDiffToggle,
  circuitStepWeights,
  children,
}: Props) {
  const [mode, setMode] = useState<"honest" | "trap">("honest");
  const [showDiff, setShowDiff] = useState(true);

  const isActive = Boolean(children);
  const isTrap = isActive && mode === "trap";
  const borderColor = isTrap ? "#3a1e1e" : isActive ? "#1a2a3a" : "#2d2b3a";

  return (
    <div
      className="rounded-lg border p-5 space-y-5 transition-colors duration-500"
      style={{
        borderColor,
        background: "#131217",
        opacity: isActive ? 1 : 0.55,
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{
                background: isActive ? "#2a2338" : "#1e1c2a",
                color: isActive ? "#a78bfa" : "#4b4860",
              }}
            >
              {id}
            </span>
            <h2
              className="text-[14px] font-semibold"
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

        {isActive ? (
          <ToggleButton
            isTrap={isTrap}
            onToggle={() => setMode(isTrap ? "honest" : "trap")}
          />
        ) : (
          <span
            className="shrink-0 rounded-lg px-2 py-0.5 text-[10px]"
            style={{ background: "#1e1c2a", color: "#6b6780" }}
          >
            coming soon
          </span>
        )}
      </div>

      {/* ── Circuit + body ── */}
      {children && alpha !== undefined && (
        <>
          <TrapCircuitSection
            alpha={alpha}
            isTrap={isTrap}
            annotation={isTrap ? circuitAnnotation : undefined}
            showDiff={showDiff}
            onToggleDiff={
              circuitShowDiffToggle ? () => setShowDiff((v) => !v) : undefined
            }
            stepWeights={isTrap ? circuitStepWeights : undefined}
          />
          {children({ isTrap })}
        </>
      )}
    </div>
  );
}
