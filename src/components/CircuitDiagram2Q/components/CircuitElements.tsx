import {
  CIRCUIT_WIRE_COLOR,
  CIRCUIT_GATE_BG,
  CIRCUIT_DIM_COLOR,
  CIRCUIT_DIMMER_COLOR,
} from "./CircuitTextStyles";

interface GateBoxProps {
  x: number;
  y: number;
  label: string;
  color: string;
  wide?: boolean;
  /** Compact 22×22 variant for trap/smaller diagrams */
  compact?: boolean;
  /** Reduced opacity — use for "missing gate" states in trap diagrams */
  faded?: boolean;
  /** Optional sub-label rendered below the main label */
  sub?: string;
}

interface XorTargetProps {
  x: number;
  y: number;
  color: string;
  /** Reduced opacity — use for "missing gate" states in trap diagrams */
  faded?: boolean;
}

interface MeasBoxProps {
  x: number;
  y: number;
  color: string;
}

const GATE_BG = "#181620";

export function GateBox({
  x,
  y,
  label,
  color,
  wide = false,
  compact = false,
  faded = false,
  sub,
}: GateBoxProps) {
  // Width logic: wide flag or sub-label on normal → 64; compact+sub → 30; compact → 22; default → 26
  const w =
    wide || (!compact && sub) ? 64 : compact && sub ? 30 : compact ? 22 : 26;
  const h = compact ? 22 : 26;
  const bg = compact ? CIRCUIT_GATE_BG : GATE_BG;
  const fontSize = wide ? 9 : compact ? (sub ? 7 : 8) : 11;
  const textY = sub ? y + (compact ? 0 : 1) : y + 4;

  return (
    <g opacity={faded ? 0.22 : 1}>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={compact ? 3 : 4}
        fill={bg}
        stroke={color}
        strokeWidth={compact ? 1.2 : 0.75}
      />
      <text
        x={x}
        y={textY}
        textAnchor="middle"
        fontFamily={compact ? "monospace" : "'Courier New', monospace"}
        fontSize={fontSize}
        fontWeight={compact ? undefined : 500}
        fill={color}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={y + (compact ? 8 : 10)}
          textAnchor="middle"
          fontFamily={compact ? "monospace" : "'Courier New', monospace"}
          fontSize={compact ? 6 : 7}
          fill={color}
          opacity={0.75}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

export function XorTarget({ x, y, color, faded = false }: XorTargetProps) {
  const r = 12;
  return (
    <g opacity={faded ? 0.22 : 1}>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={GATE_BG}
        stroke={color}
        strokeWidth={0.75}
      />
      <line
        x1={x - r}
        y1={y}
        x2={x + r}
        y2={y}
        stroke={color}
        strokeWidth={0.75}
      />
      <line
        x1={x}
        y1={y - r}
        x2={x}
        y2={y + r}
        stroke={color}
        strokeWidth={0.75}
      />
    </g>
  );
}

export function MeasBox({ x, y, color }: MeasBoxProps) {
  const w = 28;
  const h = 24;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={3}
        fill={GATE_BG}
        stroke={color}
        strokeWidth={0.75}
      />
      <path
        d={`M ${x - 8} ${y + 4} A 8 8 0 0 1 ${x + 8} ${y + 4}`}
        fill="none"
        stroke={color}
        strokeWidth={0.75}
      />
      <line
        x1={x}
        y1={y + 4}
        x2={x + 6}
        y2={y - 4}
        stroke={color}
        strokeWidth={0.75}
        strokeLinecap="round"
      />
    </g>
  );
}

// ── Shared primitives for trap / compact circuit diagrams ─────────────────────

/** Filled control dot (control qubit indicator). */
export function CtrlDot({
  x,
  y,
  color = CIRCUIT_DIM_COLOR,
}: {
  x: number;
  y: number;
  color?: string;
}) {
  return <circle cx={x} cy={y} r={3.5} fill={color} />;
}

/** Vertical control line connecting ctrl dot to target gate. */
export function CtrlLine({
  x,
  y1,
  y2,
  color,
}: {
  x: number;
  y1: number;
  y2: number;
  color: string;
}) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={1} />;
}

/** Horizontal qubit wire. */
export function WireLine({ x1, y, x2 }: { x1: number; y: number; x2: number }) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke={CIRCUIT_WIRE_COLOR}
      strokeWidth={1.5}
    />
  );
}

/** Qubit label at the left edge of a wire. */
export function QubitLabel({
  x = 4,
  y,
  label,
}: {
  x?: number;
  y: number;
  label: string;
}) {
  return (
    <text
      x={x}
      y={y + 4}
      fontSize={8}
      fill={CIRCUIT_DIM_COLOR}
      fontFamily="monospace"
      textAnchor="start"
    >
      {label}
    </text>
  );
}

/**
 * Simple measurement box (plain "M" text, no arc).
 * Use in compact circuit diagrams; use MeasBox for the main CircuitDiagram2Q.
 */
export function SimpleMeasBox({
  x,
  y,
  size = 11,
}: {
  x: number;
  y: number;
  size?: number;
}) {
  return (
    <g>
      <rect
        x={x - size}
        y={y - size}
        width={size * 2}
        height={size * 2}
        rx={3}
        fill={CIRCUIT_GATE_BG}
        stroke={CIRCUIT_DIMMER_COLOR}
        strokeWidth={1}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={CIRCUIT_DIM_COLOR}
        fontSize={7}
        fontFamily="monospace"
      >
        M
      </text>
    </g>
  );
}

/** Red × cross overlay — marks a gate as missing/skipped in trap diagrams. */
export function RedCross({
  x,
  y,
  size = 9,
}: {
  x: number;
  y: number;
  size?: number;
}) {
  return (
    <g>
      <line
        x1={x - size}
        y1={y - size}
        x2={x + size}
        y2={y + size}
        stroke="#f87171"
        strokeWidth={1.4}
        opacity={0.7}
      />
      <line
        x1={x + size}
        y1={y - size}
        x2={x - size}
        y2={y + size}
        stroke="#f87171"
        strokeWidth={1.4}
        opacity={0.7}
      />
    </g>
  );
}
