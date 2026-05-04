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

const W = 460;
const H = 160; // extra height for optional annotation

const Y0 = 55; // clock qubit
const Y1 = 105; // work qubit

const X_LABEL = 28;
const X_START = 60;
const X_H = 105;
const X_CU = 200;
const X_MEAS = 350;
const X_END = 390;

// half-widths for wire gap around gates
const HW_NARROW = 13; // H gate
const HW_WIDE = 30; // U(α) gate

const NORM = 1 / 3;

const C_WIRE = "#6b6780";
const C_CTRL = "#b7a8cf";
const C_GATE = "#a78bfa";
const C_MEAS = "#e8a020";
const C_DIM = "#4a4760";
const BG = "#181620";

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
  const w = wide ? 58 : 24;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 12}
        width={w}
        height={24}
        rx={4}
        fill={BG}
        stroke={color}
        strokeWidth={0.8}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontFamily="'Courier New', monospace"
        fontSize={wide ? 9 : 11}
        fontWeight={500}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function MeasBox({ x, y }: { x: number; y: number }) {
  const w = 26;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 12}
        width={w}
        height={24}
        rx={4}
        fill={BG}
        stroke={C_MEAS}
        strokeWidth={0.8}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontFamily="'Courier New', monospace"
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
    stepWeights
      ? Math.max(0.3, Math.min(4, (stepWeights[i] / NORM) * 1.5))
      : 0.75;
  const so = (i: 0 | 1 | 2) =>
    highlightStep === undefined || highlightStep === i ? 1 : 0.25;

  const aStr = alpha.toFixed(3);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="2-qubit circuit for 1-qubit verifier protocol"
      style={{ overflow: "visible" }}
    >
      {/* ── index labels ── */}
      <text
        x={X_LABEL - 24}
        y={Y0 + 4}
        textAnchor="end"
        fontFamily="monospace"
        fontSize={9}
        fill={C_DIM}
      >
        q₀
      </text>
      <text
        x={X_LABEL - 24}
        y={Y1 + 4}
        textAnchor="end"
        fontFamily="monospace"
        fontSize={9}
        fill={C_DIM}
      >
        q₁
      </text>

      {/* ── initial state ── */}
      <text
        x={X_LABEL}
        y={Y0 + 4}
        textAnchor="end"
        fontFamily="monospace"
        fontSize={11}
        fontWeight={500}
        fill={cc}
      >
        |0⟩
      </text>
      <text
        x={X_LABEL}
        y={Y1 + 4}
        textAnchor="end"
        fontFamily="monospace"
        fontSize={11}
        fontWeight={500}
        fill="#9490a8"
      >
        |0⟩
      </text>

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
        strokeWidth={0.75}
      />
      <line
        x1={X_CU + HW_WIDE}
        y1={Y1}
        x2={X_END}
        y2={Y1}
        stroke={C_WIRE}
        strokeWidth={0.75}
      />

      {/* ── H on q₀ ── */}
      <g opacity={fade ? 0.22 : 1}>
        <GateBox x={X_H} y={Y0} label="H" color={cc} />
      </g>
      {fade && <Cross x={X_H} y={Y0} />}

      {/* ── ctrl-U(α): dot on q₀, vertical line, box on q₁ ── */}
      <g opacity={fade ? 0.22 : 1}>
        <circle cx={X_CU} cy={Y0} r={4} fill={cc} />
        <line
          x1={X_CU}
          y1={Y0 + 4}
          x2={X_CU}
          y2={Y1 - 13}
          stroke={cc}
          strokeWidth={0.75}
        />
        <GateBox x={X_CU} y={Y1} label={`U(${aStr})`} color={gc} wide />
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
