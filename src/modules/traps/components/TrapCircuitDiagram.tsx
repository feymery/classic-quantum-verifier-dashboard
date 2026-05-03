/**
 * TrapCircuitDiagram.tsx — Shared 2-qubit clock-state circuit SVG.
 *
 * Circuit:
 *   |0⟩_prover ──── a ──────────────── M
 *   |0⟩_clock  ──── H ──── CRY(2α) ── M
 *
 * In trap mode (isTrap=true):
 *   - Gates turn grey
 *   - If highlightDiff=true: H and CRY are faded + crossed out (Trap 1)
 *   - If annotation is provided: shown at the bottom in red
 */

// ── SVG layout constants ───────────────────────────────────────────────────────

const SVG_W = 680;
const SVG_H = 110;
const Y_PROVER = 34;
const Y_CLOCK = 76;
const WIRE_L = 72;
const WIRE_R = SVG_W - 20;
const X_GATE_A = 104;
const X_GATE_H = 230;
const X_GATE_CRY = 400;
const X_MEAS = SVG_W - 30;
const GATE_W = 26;
const GATE_H = 20;

const TRAP_COLOR = "#f87171";

// ── SVG helpers ────────────────────────────────────────────────────────────────

function SvgGateBox({
  x,
  y,
  label,
  sub,
  color = "#a78bfa",
  faded = false,
}: {
  x: number;
  y: number;
  label: string;
  sub?: string;
  color?: string;
  faded?: boolean;
}) {
  const w = sub ? 62 : GATE_W;
  return (
    <g opacity={faded ? 0.22 : 1}>
      <rect
        x={x - w / 2}
        y={y - GATE_H / 2}
        width={w}
        height={GATE_H}
        rx={3}
        fill="#1e1c2a"
        stroke={color}
        strokeWidth={1.2}
      />
      <text
        x={x}
        y={y + (sub ? -1 : 4)}
        textAnchor="middle"
        fill={color}
        fontSize={sub ? 7.5 : 9}
        fontFamily="monospace"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={y + 8}
          textAnchor="middle"
          fill={color}
          fontSize={6}
          fontFamily="monospace"
          opacity={0.75}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function SvgCross({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line
        x1={x - 9}
        y1={y - 9}
        x2={x + 9}
        y2={y + 9}
        stroke={TRAP_COLOR}
        strokeWidth={1.5}
        opacity={0.75}
      />
      <line
        x1={x + 9}
        y1={y - 9}
        x2={x - 9}
        y2={y + 9}
        stroke={TRAP_COLOR}
        strokeWidth={1.5}
        opacity={0.75}
      />
    </g>
  );
}

function SvgMeasBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect
        x={x - 12}
        y={y - 10}
        width={24}
        height={20}
        rx={3}
        fill="#1e1c2a"
        stroke="#3d3b4a"
        strokeWidth={1}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="#6b6780"
        fontSize={8}
        fontFamily="monospace"
      >
        M
      </text>
    </g>
  );
}

// ── Exported component ─────────────────────────────────────────────────────────

interface Props {
  alpha: number;
  /** Show the trap overlay (grey + optional crosses + annotation). */
  isTrap?: boolean;
  /** When true and isTrap=true: fade H/CRY gates and draw red crosses. */
  highlightDiff?: boolean;
  /** Text shown at the bottom of the SVG in trap mode. */
  annotation?: string;
}

export function TrapCircuitDiagram1Q({
  alpha,
  isTrap = false,
  highlightDiff = false,
  annotation,
}: Props) {
  const gateColor = isTrap ? "#6b6780" : "#a78bfa";
  const cryColor = isTrap ? "#6b6780" : "#6366f1";
  const fadeTrap = isTrap && highlightDiff;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ background: "#1e1c2a", borderRadius: 8 }}
      role="img"
      aria-label="2-qubit clock-state circuit"
    >
      {/* qubit labels */}
      <text
        x={8}
        y={Y_PROVER + 4}
        textAnchor="start"
        fill="#6b6780"
        fontSize={9}
        fontFamily="monospace"
      >
        |0⟩_prover
      </text>
      <text
        x={8}
        y={Y_CLOCK + 4}
        textAnchor="start"
        fill="#6b6780"
        fontSize={9}
        fontFamily="monospace"
      >
        |0⟩_clock
      </text>

      {/* wires */}
      <line
        x1={WIRE_L}
        y1={Y_PROVER}
        x2={WIRE_R}
        y2={Y_PROVER}
        stroke="#3d3b4a"
        strokeWidth={1.5}
      />
      <line
        x1={WIRE_L}
        y1={Y_CLOCK}
        x2={WIRE_R}
        y2={Y_CLOCK}
        stroke="#3d3b4a"
        strokeWidth={1.5}
      />

      {/* a gate — identity, always present */}
      <SvgGateBox x={X_GATE_A} y={Y_PROVER} label="a" color="#6b6780" />

      {/* H gate */}
      <SvgGateBox
        x={X_GATE_H}
        y={Y_CLOCK}
        label="H"
        color={gateColor}
        faded={fadeTrap}
      />
      {fadeTrap && <SvgCross x={X_GATE_H} y={Y_CLOCK} />}

      {/* CRY gate */}
      <g opacity={fadeTrap ? 0.22 : 1}>
        <line
          x1={X_GATE_CRY}
          y1={Y_PROVER + GATE_H / 2 + 1}
          x2={X_GATE_CRY}
          y2={Y_CLOCK - 5}
          stroke={cryColor}
          strokeWidth={1.2}
        />
        <circle cx={X_GATE_CRY} cy={Y_CLOCK} r={4} fill={cryColor} />
      </g>
      <SvgGateBox
        x={X_GATE_CRY}
        y={Y_PROVER}
        label="CRY"
        sub={`2α=${(2 * alpha).toFixed(2)}`}
        color={cryColor}
        faded={fadeTrap}
      />
      {fadeTrap && <SvgCross x={X_GATE_CRY} y={Y_PROVER} />}

      {/* Measurement */}
      <SvgMeasBox x={X_MEAS} y={Y_PROVER} />
      <SvgMeasBox x={X_MEAS} y={Y_CLOCK} />

      {/* Annotation */}
      {isTrap && annotation && (
        <text
          x={SVG_W / 2}
          y={SVG_H - 5}
          textAnchor="middle"
          fill={TRAP_COLOR}
          fontSize={8}
          fontFamily="monospace"
          opacity={0.65}
        >
          {annotation}
        </text>
      )}
    </svg>
  );
}
