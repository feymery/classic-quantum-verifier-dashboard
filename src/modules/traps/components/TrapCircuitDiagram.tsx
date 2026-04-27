/**
 * TrapCircuitDiagram2Q.tsx — Side-by-side SVG diagrams comparing
 * the honest circuit with the Trap 1 classical shortcut.
 *
 * Honest:  H(q1) → RY(α/2) → CZ → RY(-α/2) → measure
 * Trap 1:  (nothing)                            → measure
 *
 * When highlightDiff=true the missing gates pulse red on the trap side.
 */

import {
  GateBox,
  CtrlDot,
  WireLine,
  QubitLabel,
  SimpleMeasBox,
  RedCross,
} from "../../../components/CircuitDiagram2Q/components";

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

export function TrapCircuitDiagram2Q({
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
          <WireLine x1={WIRE_START} y={Y_TOP} x2={WIRE_END} />
          <WireLine x1={WIRE_START} y={Y_BOT} x2={WIRE_END} />
          <QubitLabel y={Y_TOP} label="q_clk" />
          <QubitLabel y={Y_BOT} label="q_prv" />

          {/* H on q_clock */}
          <GateBox x={60} y={Y_TOP} label="H" color="#a78bfa" compact />

          {/* RY(α/2) */}
          <GateBox
            x={110}
            y={Y_BOT}
            label={`RY\n+α/2`}
            color="#60a5fa"
            compact
          />

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
          <GateBox x={155} y={Y_BOT} label="CZ" color="#60a5fa" compact />

          {/* RY(-α/2) */}
          <GateBox
            x={205}
            y={Y_BOT}
            label={`RY\n-α/2`}
            color="#60a5fa"
            compact
          />

          {/* Measure */}
          <SimpleMeasBox x={290} y={Y_TOP} size={GATE_R} />
          <SimpleMeasBox x={290} y={Y_BOT} size={GATE_R} />

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
          <WireLine x1={WIRE_START} y={Y_TOP} x2={WIRE_END} />
          <WireLine x1={WIRE_START} y={Y_BOT} x2={WIRE_END} />
          <QubitLabel y={Y_TOP} label="q_clk" />
          <QubitLabel y={Y_BOT} label="q_prv" />

          {/* Missing gates — faded red crosses */}
          <GateBox
            x={60}
            y={Y_TOP}
            label="H"
            color={missingColor}
            compact
            faded={!showTrap}
          />
          <GateBox
            x={110}
            y={Y_BOT}
            label="RY"
            color={missingColor}
            compact
            faded={!showTrap}
          />
          <GateBox
            x={155}
            y={Y_BOT}
            label="CZ"
            color={missingColor}
            compact
            faded={!showTrap}
          />
          <GateBox
            x={205}
            y={Y_BOT}
            label="RY"
            color={missingColor}
            compact
            faded={!showTrap}
          />
          {showTrap && highlightDiff && (
            <>
              <RedCross x={60} y={Y_TOP} size={GATE_R - 2} />
              <RedCross x={110} y={Y_BOT} size={GATE_R - 2} />
              <RedCross x={155} y={Y_BOT} size={GATE_R - 2} />
              <RedCross x={205} y={Y_BOT} size={GATE_R - 2} />
            </>
          )}

          {/* Measure */}
          <SimpleMeasBox x={290} y={Y_TOP} size={GATE_R} />
          <SimpleMeasBox x={290} y={Y_BOT} size={GATE_R} />

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
