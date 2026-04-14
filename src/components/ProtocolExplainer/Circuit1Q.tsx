/**
 * Circuit1Q.tsx
 * SVG circuit for the 1-qubit verifier protocol (2-qubit clock state).
 *
 *  q₀ (clock): |0⟩ ──── H ──── • ──────── M
 *                               |
 *  q₁ (work):  |0⟩ ─────────── U(α) ───── M
 */

interface Circuit1QProps {
  alpha: number;
}

const W = 460;
const H = 140;

const Y0 = 55; // clock qubit
const Y1 = 105; // work qubit

const X_LABEL = 28;
const X_START = 60;
const X_H = 105;
const X_CU = 200;
const X_MEAS = 350;
const X_END = 390;

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

export function Circuit1Q({ alpha }: Circuit1QProps) {
  const aStr = alpha.toFixed(3);

  return (
    <svg
      width="100%"
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
        fill={C_CTRL}
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

      {/* ── wires ── */}
      <line
        x1={X_START}
        y1={Y0}
        x2={X_END}
        y2={Y0}
        stroke={C_WIRE}
        strokeWidth={0.75}
      />
      <line
        x1={X_START}
        y1={Y1}
        x2={X_END}
        y2={Y1}
        stroke={C_WIRE}
        strokeWidth={0.75}
      />

      {/* ── H on q₀ ── */}
      <GateBox x={X_H} y={Y0} label="H" color={C_CTRL} />

      {/* ── ctrl-U(α): dot on q₀, box on q₁ ── */}
      <circle cx={X_CU} cy={Y0} r={4} fill={C_CTRL} />
      <line
        x1={X_CU}
        y1={Y0 + 4}
        x2={X_CU}
        y2={Y1 - 13}
        stroke={C_CTRL}
        strokeWidth={0.75}
      />
      <GateBox x={X_CU} y={Y1} label={`U(${aStr})`} color={C_GATE} wide />

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
        fill={C_CTRL}
      >
        clock
      </text>
      <text
        x={X_CU}
        y={Y1 + 28}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={8}
        fill={C_GATE}
      >
        work
      </text>
    </svg>
  );
}
