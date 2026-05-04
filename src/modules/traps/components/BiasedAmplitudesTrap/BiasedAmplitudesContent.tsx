/**
 * BiasedAmplitudesContent.tsx — Trap 3 presentational layer.
 * All 8 display sections. Receives computed state from BiasedAmplitudesTrap.
 */

import { Slider, Button } from "../../../../ui";
import { EnergyGauge } from "../EnergyGauge";
import { ConceptBox } from "../../../../components/ProtocolExplainer/ConceptBox";
import { ClockDistributionBars } from "./ClockDistributionBars";
import { ShotsPanel } from "./ShotsPanel";
import { SectionLabel } from "../../shared/SectionLabel";
import {
  DELTA_MAX,
  SHOT_OPTIONS,
  TRAP_COLOR,
  HONEST_COLOR,
  BIAS_COLOR,
  type Trap3ContentProps,
} from "./BiasedAmplitudesTrap.types";

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
          <Slider
            label="δ (bias)"
            valueDisplay={delta.toFixed(2)}
            min={0}
            max={DELTA_MAX}
            step={0.01}
            value={delta}
            onChange={(e) => setDelta(+e.target.value)}
          />
        )}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-widest text-subtle">
            shots
          </span>
          <div className="flex flex-wrap gap-1">
            {SHOT_OPTIONS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={shots === s ? "primary" : "ghost"}
                onClick={() => setShots(s)}
                className="px-2 py-0.5 text-[10px]"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isTrap && (
        <div className="rounded-lg border border-border bg-elevated px-4 py-3 text-[12px] leading-relaxed text-warning">
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
          <SectionLabel>clock step distribution</SectionLabel>
          <ClockDistributionBars trapWeights={noisyWeights} shots={shots} />
        </div>
      )}

      <div>
        <SectionLabel>hamiltonian energy</SectionLabel>
        <EnergyGauge energy={energy.total} energyTheory={0} />
        {isTrap && (
          <>
            <div className="mt-2 flex gap-4 text-[10px] text-subtle">
              <span>H_out = {energy.H_out.toFixed(3)}</span>
              <span>H_in = {energy.H_in.toFixed(3)}</span>
              <span style={{ color: BIAS_COLOR, fontWeight: 600 }}>
                H_prop = {energy.H_prop.toFixed(3)} ← coherence penalty
              </span>
            </div>
            <p
              className="mt-1.5 text-[11px] italic"
              style={{ color: detected ? TRAP_COLOR : BIAS_COLOR }}
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
          <SectionLabel>shots vs detectability</SectionLabel>
          <ShotsPanel shots={shots} delta={delta} />
        </div>
      )}

      {isTrap && (
        <div>
          <SectionLabel>clock step amplitudes</SectionLabel>
          <table
            className="w-full text-[11px]"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                {["Step", "Honest P", "Trap P", "Noisy count"].map((h) => (
                  <th
                    key={h}
                    className="pb-1.5 pl-2 text-left text-[10px] uppercase tracking-widest text-subtle border-b border-border"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([0, 1, 2] as const).map((i) => (
                <tr key={i} className="border-b border-elevated">
                  <td className="py-1 pl-2 font-mono text-muted">t={i}</td>
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
                  <td className="py-1 pl-2 font-mono text-foreground">
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
        <p className="px-3 pb-3 text-[12px] leading-relaxed text-muted">
          H_prop measures coherence via √(P_t·P_{"{t+1}"}). Equal amplitudes
          yield E = 0. Any bias breaks symmetry: the geometric mean drops below
          1/3 and H_prop rises. The prover can make δ arbitrarily small, but
          then needs 1/δ² more shots to stay undetected.
        </p>
      </ConceptBox>
    </>
  );
}
