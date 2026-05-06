import { KEY_ALPHAS } from "../../../utils/constants";
import { nearestKeyIndex } from "../../../utils/alphaUtils";
import { AlphaPresetButton } from "./AlphaPresetButton";

interface AlphaPresetsProps {
  alpha: number;
  onSelect: (v: number) => void;
}

export function AlphaPresets({ alpha, onSelect }: AlphaPresetsProps) {
  const keyValues = KEY_ALPHAS.map((k) => k.value);
  const snappedIdx = nearestKeyIndex(alpha, keyValues);

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {KEY_ALPHAS.map((ka, i) => (
        <div
          key={ka.label}
          className={
            /* 5th item (index 4) spans both columns, centred */
            i === 4 ? "col-span-2 mx-auto w-[calc(50%-3px)]" : ""
          }
        >
          <AlphaPresetButton
            ka={ka}
            isActive={snappedIdx === i}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
