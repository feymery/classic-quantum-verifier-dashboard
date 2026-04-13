interface GateBoxProps {
  x: number;
  y: number;
  label: string;
  color: string;
  wide?: boolean;
}

interface XorTargetProps {
  x: number;
  y: number;
  color: string;
}

interface MeasBoxProps {
  x: number;
  y: number;
  color: string;
}

const GATE_BG = "#181620";

export function GateBox({ x, y, label, color, wide = false }: GateBoxProps) {
  const w = wide ? 64 : 26;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 13}
        width={w}
        height={26}
        rx={4}
        fill={GATE_BG}
        stroke={color}
        strokeWidth={0.75}
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

export function XorTarget({ x, y, color }: XorTargetProps) {
  const r = 12;
  return (
    <g>
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
