/**
 * Circuit1Q.parts.tsx — Internal SVG helper components for Circuit1Q.
 * Kept separate to respect the 100-line limit on the main file.
 */

export const GW = 26;
export const GH = 20;
export const C_GATE = "#a78bfa";
export const C_TRAP = "#f87171";

export function GBox({
  x,
  y,
  label,
  sub,
  color = C_GATE,
  faded = false,
}: {
  x: number;
  y: number;
  label: string;
  sub?: string;
  color?: string;
  faded?: boolean;
}) {
  const w = sub ? 62 : GW;
  return (
    <g opacity={faded ? 0.22 : 1}>
      <rect
        x={x - w / 2}
        y={y - GH / 2}
        width={w}
        height={GH}
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

export function Cross({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line
        x1={x - 9}
        y1={y - 9}
        x2={x + 9}
        y2={y + 9}
        stroke={C_TRAP}
        strokeWidth={1.5}
        opacity={0.75}
      />
      <line
        x1={x + 9}
        y1={y - 9}
        x2={x - 9}
        y2={y + 9}
        stroke={C_TRAP}
        strokeWidth={1.5}
        opacity={0.75}
      />
    </g>
  );
}

export function MBox({ x, y }: { x: number; y: number }) {
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
