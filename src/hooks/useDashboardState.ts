import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { BACKENDS, type BackendId } from "../utils/constants";
import { energyFromAlpha } from "../utils/physics";
import { formatEnergy } from "../utils/physics";

export function useDashboardState() {
  const [alpha, setAlpha] = useState<number>(Math.PI / 4);
  const [shots, setShots] = useState<number>(1024);
  const [selectedBackend, setSelectedBackend] = useState<BackendId>("mock");
  const [ibmToken, setIbmToken] = useState<string>("");
  const [ibmTokenSet, setIbmTokenSet] = useState<boolean>(false);
  const [noiseLambda, setNoiseLambda] = useState<number>(0.05);
  const [alphaFake, setAlphaFake] = useState<number>(1.1);
  const [comparisonAlphas, setComparisonAlphas] = useState<number[]>([]);
  const [showToken, setShowToken] = useState<boolean>(false);

  const energy = useMemo(() => energyFromAlpha(alpha), [alpha]);
  const formattedEnergy = formatEnergy(energy);
  const backend = useMemo(
    () =>
      BACKENDS.find((option) => option.id === selectedBackend) ?? BACKENDS[0],
    [selectedBackend],
  );

  const confirmToken = useCallback(() => {
    if (ibmToken) {
      setIbmTokenSet(true);
      setShowToken(false);
    }
  }, [ibmToken]);

  const toggleShowToken = useCallback(() => setShowToken((v) => !v), []);

  return {
    alpha,
    shots,
    selectedBackend,
    ibmToken,
    ibmTokenSet,
    noiseLambda,
    alphaFake,
    comparisonAlphas,
    showToken,
    energy,
    formattedEnergy,
    backend,
    setAlpha,
    setShots,
    setSelectedBackend,
    setIbmToken,
    setIbmTokenSet,
    setNoiseLambda,
    setAlphaFake,
    setComparisonAlphas,
    setShowToken,
    confirmToken,
    toggleShowToken,
    updateShotsFromEvent(event: ChangeEvent<HTMLInputElement>) {
      const parsed = Number(event.target.value);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setShots(parsed);
      }
    },
  };
}
