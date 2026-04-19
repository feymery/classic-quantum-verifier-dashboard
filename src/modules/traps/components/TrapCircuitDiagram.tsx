/**
 * TrapCircuitDiagram.tsx — Side-by-side SVG diagrams comparing
 * the honest circuit with the Trap 1 classical shortcut.
 *
 * Honest:  H(q1) → RY(α/2) → CZ → RY(-α/2) → measure
 * Trap 1:  (nothing)                            → measure
 *
 * When highlightDiff=true the missing gates pulse red on the trap side.
 */

interface Props {
  alpha: number;
  showTrap?: boolean;
  highlightDiff?: boolean;
}

const W = 340;
const H_SVG = 88;
const Y_TOP = 28; // q_clock row
const Y_BOT = 60; // q_prover row
const WIRE_START = 32;
const WIRE_END = W - 8;
const GATE_R = 11;

function Wire({ y }: { y: number }) {
  return (
    <line
      x1={WIRE_START}
      y1={y}
      x2={WIRE_END}
      y2={y}
      stroke="#3d3b4a"
      strokeWidth={1.5}
    />
  );
}

function GateBox({
  x,
  y,
  label,
  color = "#a78bfa",
  faded = false,
}: {
  x: number;
  y: number;
  label: string;
  color?: string;
  faded?: boolean;
}) {
  return (
    <g opacity={faded ? 0.25 : 1}>
      <rect
        x={x - GATE_R}
        y={y - GATE_R}
        width={GATE_R * 2}
        height={GATE_R * 2}
        rx={4}
        fill="#1e1c2a"
        stroke={color}
        strokeWidth={1.2}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={color}
        fontSize={8}
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

function CtrlDot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3} fill="#6b6780" />;
}

function Qubit({ y, label }: { y: number; label: string }) {
  return (
    <text
      x={4}
      y={y + 4}
      fontSize={8}
      fill="#6b6780"
      fontFamily="monospace"
      textAnchor="start"
    >
      {label}
    </text>
  );
}

function MeasureBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect
        x={x - GATE_R}
        y={y - GATE_R}
        width={GATE_R * 2}
        height={GATE_R * 2}
        rx={4}
        fill="#1e1c2a"
        stroke="#4b4860"
        strokeWidth={1}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="#6b6780"
        fontSize={7}
        fontFamily="monospace"
      >
        M
      </text>
    </g>
  );
}

export function TrapCircuitDiagram({
  alpha,
  showTrap = false,
  highlightDiff = false,
}: Props) {
  const degs = ((alpha / Math.PI) * 180).toFixed(1);
  const missingColor = highlightDiff ? "#f87171" : "#3d3b4a";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* ── Honest circuit ── */}
      <div className="flex-1 space-y-1">
        <p className=" text-[10px]" style={{ color: "#34d399" }}>
          honest prover
        </p>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H_SVG}`}
          style={{ background: "#131217", borderRadius: 8 }}
        >
          <Wire y={Y_TOP} />
          <Wire y={Y_BOT} />
          <Qubit y={Y_TOP} label="q_clk" />
          <Qubit y={Y_BOT} label="q_prv" />

          {/* H on q_clock */}
          <GateBox x={60} y={Y_TOP} label="H" color="#a78bfa" />

          {/* RY(α/2) */}
          <GateBox x={110} y={Y_BOT} label={`RY\n+α/2`} color="#60a5fa" />

          {/* CZ */}
          <line
            x1={155}
            y1={Y_TOP}
            x2={155}
            y2={Y_BOT}
            stroke="#6b6780"
            strokeWidth={1}
          />
          <CtrlDot x={155} y={Y_TOP} />
          <GateBox x={155} y={Y_BOT} label="CZ" color="#60a5fa" />

          {/* RY(-α/2) */}
          <GateBox x={205} y={Y_BOT} label={`RY\n-α/2`} color="#60a5fa" />

          {/* Measure */}
          <MeasureBox x={290} y={Y_TOP} />
          <MeasureBox x={290} y={Y_BOT} />

          {/* Alpha label */}
          <text
            x={155}
            y={H_SVG - 4}
            textAnchor="middle"
            fontSize={7}
            fill="#4b4860"
            fontFamily="monospace"
          >
            α = {degs}°
          </text>
        </svg>
      </div>

      {/* ── Trap 1 circuit ── */}
      <div className="flex-1 space-y-1">
        <p
          className=" text-[10px]"
          style={{ color: showTrap ? "#f87171" : "#6b6780" }}
        >
          {showTrap ? "trap 1 — |00⟩ classical" : "trap 1 (inactive)"}
        </p>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H_SVG}`}
          style={{
            background: "#131217",
            borderRadius: 8,
            border:
              showTrap && highlightDiff
                ? "1px solid rgba(248,113,113,0.3)"
                : "1px solid transparent",
          }}
        >
          <Wire y={Y_TOP} />
          <Wire y={Y_BOT} />
          <Qubit y={Y_TOP} label="q_clk" />
          <Qubit y={Y_BOT} label="q_prv" />

          {/* Missing gates — faded red crosses */}
          <GateBox
            x={60}
            y={Y_TOP}
            label="H"
            color={missingColor}
            faded={!showTrap}
          />
          <GateBox
            x={110}
            y={Y_BOT}
            label="RY"
            color={missingColor}
            faded={!showTrap}
          />
          <GateBox
            x={155}
            y={Y_BOT}
            label="CZ"
            color={missingColor}
            faded={!showTrap}
          />
          <GateBox
            x={205}
            y={Y_BOT}
            label="RY"
            color={missingColor}
            faded={!showTrap}
          />
          {showTrap && highlightDiff && (
            <>
              {[60, 110, 155, 205].map((x) => (
                <g key={x}>
                  <line
                    x1={x - GATE_R + 2}
                    y1={x === 60 ? Y_TOP - GATE_R + 2 : Y_BOT - GATE_R + 2}
                    x2={x + GATE_R - 2}
                    y2={x === 60 ? Y_TOP + GATE_R - 2 : Y_BOT + GATE_R - 2}
                    stroke="#f87171"
                    strokeWidth={1.2}
                    opacity={0.6}
                  />
                  <line
                    x1={x + GATE_R - 2}
                    y1={x === 60 ? Y_TOP - GATE_R + 2 : Y_BOT - GATE_R + 2}
                    x2={x - GATE_R + 2}
                    y2={x === 60 ? Y_TOP + GATE_R - 2 : Y_BOT + GATE_R - 2}
                    stroke="#f87171"
                    strokeWidth={1.2}
                    opacity={0.6}
                  />
                </g>
              ))}
            </>
          )}

          {/* Measure */}
          <MeasureBox x={290} y={Y_TOP} />
          <MeasureBox x={290} y={Y_BOT} />

          <text
            x={155}
            y={H_SVG - 4}
            textAnchor="middle"
            fontSize={7}
            fill={showTrap ? "#f87171" : "#4b4860"}
            fontFamily="monospace"
          >
            {showTrap ? "skips all gates → |00⟩" : "α = " + degs + "°"}
          </text>
        </svg>
      </div>
    </div>
  );
}
