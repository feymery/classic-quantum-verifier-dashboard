/**
 * CircuitDiagram2Q/index.tsx
 * SVG schematic of the 3-qubit clock-state preparation circuit.
 *
 * Layout (left → right):
 *   |0⟩ ──── H ──── •  ──────────── M
 *                   |
 *   |0⟩ ─────────── U(α) ──── •  ── M
 *                              |
 *   |0⟩ ────────────────────── X  ── M
 */

import { GateBox, XorTarget, MeasBox } from "./components/CircuitElements";
import {
  dimStyle,
  labelStyle,
  roleStyle,
} from "./components/CircuitTextStyles";

interface CircuitDiagram2QProps {
  alpha: number;
}

// ── Layout constants ──────────────────────────────────────────────────────────

const W = 580;
const H = 200;

const Y0 = 55; // clock
const Y1 = 105; // work 1
const Y2 = 155; // work 2

const X_LABEL = 30;
const X_START = 68;
const X_H = 115;
const X_CU = 200;
const X_CNOT = 300;
const X_MEAS = 430;
const X_END = 470;

const WIRE_COLOR = "#6b6780";
const CTRL_COLOR = "#b7a8cf"; // muted violet-grey — identifies clock qubit
const CNOT_COLOR = "#34d399";
const MEAS_COLOR = "#e8a020";
const ACTIVE_COLOR = "#a78bfa";

export function CircuitDiagram2Q({ alpha }: CircuitDiagram2QProps) {
  const alphaStr = alpha.toFixed(3);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="3-qubit circuit diagram for 2-qubit extension protocol"
      style={{ overflow: "visible" }}
    >
      {/* ── Qubit index labels ── */}
      <text x={X_LABEL - 28} y={Y0 + 4} textAnchor="end" {...dimStyle}>
        q₀
      </text>
      <text x={X_LABEL - 28} y={Y1 + 4} textAnchor="end" {...dimStyle}>
        q₁
      </text>
      <text x={X_LABEL - 28} y={Y2 + 4} textAnchor="end" {...dimStyle}>
        q₂
      </text>

      {/* ── Initial state labels ── */}
      <text x={X_LABEL} y={Y0 + 4} textAnchor="end" {...labelStyle}>
        |0⟩
      </text>
      <text x={X_LABEL} y={Y1 + 4} textAnchor="end" {...labelStyle}>
        |0⟩
      </text>
      <text x={X_LABEL} y={Y2 + 4} textAnchor="end" {...labelStyle}>
        |0⟩
      </text>

      {/* ── Wires ── */}
      <line
        x1={X_START}
        y1={Y0}
        x2={X_END}
        y2={Y0}
        stroke={WIRE_COLOR}
        strokeWidth={0.75}
      />
      <line
        x1={X_START}
        y1={Y1}
        x2={X_END}
        y2={Y1}
        stroke={WIRE_COLOR}
        strokeWidth={0.75}
      />
      <line
        x1={X_START}
        y1={Y2}
        x2={X_END}
        y2={Y2}
        stroke={WIRE_COLOR}
        strokeWidth={0.75}
      />

      {/* ── H gate on q0 ── */}
      <GateBox x={X_H} y={Y0} label="H" color={CTRL_COLOR} />

      {/* ── Controlled-U(α): dot on q0, gate on q1 ── */}
      <circle cx={X_CU} cy={Y0} r={4} fill={CTRL_COLOR} />
      <line
        x1={X_CU}
        y1={Y0 + 4}
        x2={X_CU}
        y2={Y1 - 14}
        stroke={CTRL_COLOR}
        strokeWidth={0.75}
      />
      <GateBox
        x={X_CU}
        y={Y1}
        label={`U(${alphaStr})`}
        color={ACTIVE_COLOR}
        wide
      />

      {/* ── CNOT: dot on q1, ⊕ on q2 ── */}
      <circle cx={X_CNOT} cy={Y1} r={4} fill={CNOT_COLOR} />
      <line
        x1={X_CNOT}
        y1={Y1 + 4}
        x2={X_CNOT}
        y2={Y2 - 14}
        stroke={CNOT_COLOR}
        strokeWidth={0.75}
      />
      <XorTarget x={X_CNOT} y={Y2} color={CNOT_COLOR} />

      {/* ── Measurement boxes ── */}
      <MeasBox x={X_MEAS} y={Y0} color={MEAS_COLOR} />
      <MeasBox x={X_MEAS} y={Y1} color={MEAS_COLOR} />
      <MeasBox x={X_MEAS} y={Y2} color={MEAS_COLOR} />

      {/* ── Column labels ── */}
      <text x={X_H} y={Y0 - 16} textAnchor="middle" {...dimStyle}>
        Hadamard
      </text>
      <text x={X_CU} y={Y0 - 16} textAnchor="middle" {...dimStyle}>
        ctrl-U(α)
      </text>
      <text x={X_CNOT} y={Y0 - 16} textAnchor="middle" {...dimStyle}>
        CNOT
      </text>
      <text x={X_MEAS} y={Y0 - 16} textAnchor="middle" {...dimStyle}>
        measure
      </text>

      {/* ── Qubit role labels (right side) ── */}
      <text x={X_END + 8} y={Y0 + 4} {...roleStyle} fill={CTRL_COLOR}>
        clock
      </text>
      <text x={X_END + 8} y={Y1 + 4} {...roleStyle} fill={ACTIVE_COLOR}>
        work 1
      </text>
      <text x={X_END + 8} y={Y2 + 4} {...roleStyle} fill={CNOT_COLOR}>
        work 2
      </text>

      {/* ── State annotation ── */}
      <text x={W / 2} y={H - 8} textAnchor="middle" {...dimStyle}>
        {"|ψ⟩ = (1/√2)(|000⟩ + cos(α)|100⟩ + sin(α)|111⟩)"}
      </text>
    </svg>
  );
}
