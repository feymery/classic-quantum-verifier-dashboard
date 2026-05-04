/**
 * BiasedAmplitudesContent.tsx — Trap 3 presentational layer.
 * All 8 display sections. Receives computed state from BiasedAmplitudesTrap.
 */

import { EnergyGauge } from "../EnergyGauge";
import { ConceptBox } from "../../../../components/ProtocolExplainer/ConceptBox";
import { ClockDistributionBars } from "./ClockDistributionBars";
import { ShotsPanel } from "./ShotsPanel";
import {
  DELTA_MAX,
  SHOT_OPTIONS,
  TRAP_COLOR,
  HONEST_COLOR,
  BIAS_COLOR,
  type Trap3ContentProps,
} from "./BiasedAmplitudesTrap.types";

const SL = ({ c }: { c: React.ReactNode }) => (
  <p
    className="mb-2 text-[10px] uppercase tracking-widest"
    style={{ color: "#6b6780" }}
  >
    {c}
  </p>
);

export function BiasedAmplitudesContent({
  delta,
  shots,
  isTrap,
  setDelta,
  setShots,
  energy,
  weights,
  noisyWeights,
  detected,
}: Trap3ContentProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isTrap && (
          <div>
            <SL c={`δ (bias) = ${delta.toFixed(2)}`} />
            <input
              type="range"
              min={0}
              max={DELTA_MAX}
              step={0.01}
              value={delta}
              onChange={(e) => setDelta(+e.target.value)}
              className="w-full"
            />
          </div>
        )}
        <div>
          <SL c="shots" />
          <div className="flex flex-wrap gap-1">
            {SHOT_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setShots(s)}
                className="rounded px-2 py-0.5 text-[10px] font-medium transition-colors"
                style={{
                  background: shots === s ? "#2a2338" : "#1e1c2a",
                  color: shots === s ? "#a78bfa" : "#6b6780",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isTrap && (
        <div
          className="rounded-lg border px-4 py-3 text-[12px] leading-relaxed"
          style={{
            borderColor: "#3d3b4a",
            background: "#1e1c2a",
            color: "#fbbf24",
          }}
        >
          <span className="mr-2 font-semibold">
            Why is this the hardest trap?
          </span>
          All three gates are present and the state is genuinely quantum —
          Z-basis distribution nearly indistinguishable from an honest prover.
          Only H_prop detects the broken coherence, and only with enough shots.
          Need ≥ 1/δ² shots.
        </div>
      )}

      {isTrap && (
        <div>
          <SL c="clock step distribution" />
          <ClockDistributionBars trapWeights={noisyWeights} shots={shots} />
        </div>
      )}

      <div>
        <SL c="hamiltonian energy" />
        <EnergyGauge energy={energy.total} energyTheory={0} />
        {isTrap && (
          <>
            <div
              className="mt-2 flex gap-4 text-[10px]"
              style={{ color: "#6b6780" }}
            >
              <span>H_out = {energy.H_out.toFixed(3)}</span>
              <span>H_in = {energy.H_in.toFixed(3)}</span>
              <span style={{ color: BIAS_COLOR, fontWeight: 600 }}>
                H_prop = {energy.H_prop.toFixed(3)} ← coherence penalty
              </span>
            </div>
            <p
              className="mt-1.5 text-[11px] italic"
              style={{ color: detected ? TRAP_COLOR : "#f59e0b" }}
            >
              {detected
                ? "✗ DETECTED — H_prop energy exceeds threshold 0.4"
                : "⚠ UNDETECTED — increase δ or shots"}
            </p>
          </>
        )}
      </div>

      {isTrap && (
        <div>
          <SL c="shots vs detectability" />
          <ShotsPanel shots={shots} delta={delta} />
        </div>
      )}

      {isTrap && (
        <div>
          <SL c="clock step amplitudes" />
          <table
            className="w-full text-[11px]"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                {["Step", "Honest P", "Trap P", "Noisy count"].map((h) => (
                  <th
                    key={h}
                    className="pb-1.5 pl-2 text-left text-[10px] uppercase tracking-widest"
                    style={{
                      color: "#6b6780",
                      borderBottom: "1px solid #2d2b3a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([0, 1, 2] as const).map((i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1e1c2a" }}>
                  <td
                    className="py-1 pl-2 font-mono"
                    style={{ color: "#9490a8" }}
                  >
                    t={i}
                  </td>
                  <td
                    className="py-1 pl-2 font-mono"
                    style={{ color: HONEST_COLOR }}
                  >
                    {(1 / 3).toFixed(3)}
                  </td>
                  <td
                    className="py-1 pl-2 font-mono"
                    style={{
                      color:
                        weights[i] > 1 / 3 + 0.01
                          ? TRAP_COLOR
                          : weights[i] < 1 / 3 - 0.01
                            ? "#9490a8"
                            : "#ddd9ee",
                    }}
                  >
                    {weights[i].toFixed(3)}
                  </td>
                  <td
                    className="py-1 pl-2 font-mono"
                    style={{ color: "#ddd9ee" }}
                  >
                    {Math.round(noisyWeights[i] * shots)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConceptBox
        title="Key concept: coherence requires equal amplitudes"
        accentColor={BIAS_COLOR}
      >
        <p
          className="px-3 pb-3 text-[12px] leading-relaxed"
          style={{ color: "#9490a8" }}
        >
          H_prop measures coherence via √(P_t·P_{"{t+1}"}). Equal amplitudes
          yield E = 0. Any bias breaks symmetry: the geometric mean drops below
          1/3 and H_prop rises. The prover can make δ arbitrarily small, but
          then needs 1/δ² more shots to stay undetected.
        </p>
      </ConceptBox>
    </>
  );
}
