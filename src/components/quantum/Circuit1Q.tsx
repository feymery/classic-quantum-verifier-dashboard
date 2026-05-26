/**
 * Circuit1Q.tsx
 * SVG circuit for the 1-qubit verifier protocol (2-qubit clock state).
 *
 *  q₀ (clock): |0⟩ ──── H ──── • ──────── M
 *                               |
 *  q₁ (work):  |0⟩ ─────────── U(α) ───── M
 */

import { Cross, C_TRAP } from "./Circuit1Q.parts";

export interface Circuit1QProps {
  alpha: number;
  mode?: "honest" | "trap";
  highlightStep?: 0 | 1 | 2;
  stepWeights?: [number, number, number];
  showDiff?: boolean;
  annotation?: string;
}

const W = 238;
const H = 120; // extra height for optional annotation

const Y0 = 44; // clock qubit
const Y1 = 88; // work qubit

const X_START = 40;
const X_H = 74;
const X_CU = 134;
const X_MEAS = 200;
const X_END = 230;

// half-widths for wire gap around gates
const HW_NARROW = 13; // H gate
const HW_WIDE = 30; // U(α) gate

const NORM = 1 / 3;

const C_WIRE = "var(--color-subtle)";
const C_CTRL = "var(--color-accent-light)";
const C_GATE = "var(--color-accent)";
const C_MEAS = "#e8a020";
const BG = "var(--color-elevated)";

function GateBox({
  x,
  y,
  label,
  color,
  wide = false,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  wide?: boolean;
}) {
  const w = wide ? 54 : 22;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 11}
        width={w}
        height={22}
        rx={3}
        style={{ fill: BG }}
        stroke={color}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Courier New', monospace"
        fontSize={wide ? 8 : 10}
        fontWeight={500}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function MeasBox({ x, y }: { x: number; y: number }) {
  const w = 22;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 11}
        width={w}
        height={22}
        rx={3}
        style={{ fill: BG }}
        stroke={C_MEAS}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fill={C_MEAS}
      >
        M
      </text>
    </g>
  );
}

export function Circuit1Q({
  alpha,
  mode = "honest",
  showDiff = false,
  stepWeights,
  highlightStep,
  annotation,
}: Circuit1QProps) {
  const isTrap = mode === "trap";
  const fade = isTrap && showDiff;
  const gc = isTrap ? "#6b6780" : C_GATE;
  const cc = isTrap ? "#6b6780" : C_CTRL;

  // q₀ wire is segmented (3 clock steps): before-H | H-to-ctrl | after-ctrl
  const sw = (i: 0 | 1 | 2) =>
    stepWeights ? Math.max(0.6, Math.min(4, (stepWeights[i] / NORM) * 2)) : 1.5;
  const so = (i: 0 | 1 | 2) =>
    highlightStep === undefined || highlightStep === i ? 1 : 0.25;

  return (
    <svg
      width="100%"
      viewBox={`32 13 ${W - 32} ${H - 13}`}
      role="img"
      aria-label={`2-qubit circuit for 1-qubit verifier protocol, \u03b1=${alpha.toFixed(3)}`}
    >
      {/* ── q₀ wire — 3 segments for stepWeights / highlightStep ── */}
      <line
        x1={X_START}
        y1={Y0}
        x2={X_H - HW_NARROW}
        y2={Y0}
        stroke={C_WIRE}
        strokeWidth={sw(0)}
        opacity={so(0)}
      />
      <line
        x1={X_H + HW_NARROW}
        y1={Y0}
        x2={X_CU - 5}
        y2={Y0}
        stroke={C_WIRE}
        strokeWidth={sw(1)}
        opacity={so(1)}
      />
      <line
        x1={X_CU + 5}
        y1={Y0}
        x2={X_END}
        y2={Y0}
        stroke={C_WIRE}
        strokeWidth={sw(2)}
        opacity={so(2)}
      />

      {/* ── q₁ wire — continuous ── */}
      <line
        x1={X_START}
        y1={Y1}
        x2={X_CU - HW_WIDE}
        y2={Y1}
        stroke={C_WIRE}
        strokeWidth={1.5}
      />
      <line
        x1={X_CU + HW_WIDE}
        y1={Y1}
        x2={X_END}
        y2={Y1}
        stroke={C_WIRE}
        strokeWidth={1.5}
      />

      {/* ── H on q₀ ── */}
      <g opacity={fade ? 0.22 : 1}>
        <GateBox x={X_H} y={Y0} label="H" color={cc} />
      </g>
      {fade && <Cross x={X_H} y={Y0} />}

      {/* ── ctrl-U(α): dot on q₀, vertical line, box on q₁ ── */}
      <g opacity={fade ? 0.22 : 1}>
        <circle cx={X_CU} cy={Y0} r={5} fill={cc} />
        <line
          x1={X_CU}
          y1={Y0 + 5}
          x2={X_CU}
          y2={Y1 - 12}
          stroke={cc}
          strokeWidth={1.5}
        />
        <GateBox x={X_CU} y={Y1} label="U(α)" color={gc} wide />
      </g>
      {fade && <Cross x={X_CU} y={Y1} />}

      {/* ── measure ── */}
      <MeasBox x={X_MEAS} y={Y0} />
      <MeasBox x={X_MEAS} y={Y1} />

      {/* ── role labels ── */}
      <text
        x={X_H}
        y={Y0 - 20}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={8}
        fill={cc}
      >
        clock
      </text>
      <text
        x={X_CU}
        y={Y1 + 28}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={8}
        fill={gc}
      >
        work
      </text>

      {/* ── trap annotation ── */}
      {isTrap && annotation && (
        <text
          x={W / 2}
          y={H - 6}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize={8}
          fill={C_TRAP}
          opacity={0.65}
        >
          {annotation}
        </text>
      )}
    </svg>
  );
}
