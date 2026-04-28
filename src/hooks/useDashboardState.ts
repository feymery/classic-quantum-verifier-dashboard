import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { BACKENDS, type BackendId } from "../utils/constants";
import { energyFromAlpha } from "../utils/physics";
import { formatEnergy } from "../utils/physics";
import { fetchJson } from "../services/apiClient";
import { useIbmCredentials } from "./useIbmCredentials";

export function useDashboardState() {
  const [alpha, setAlpha] = useState<number>(Math.PI / 4);
  const [shots, setShots] = useState<number>(1024);
  const [selectedBackend, setSelectedBackend] = useState<BackendId>("mock");
  const {
    ibmToken,
    ibmTokenSet,
    ibmInstance,
    ibmBackendName,
    setIbmToken,
    setIbmTokenSet,
    setIbmInstance,
    setIbmBackendName,
    clearIbmCredentials,
  } = useIbmCredentials();
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
      fetchJson<{ configured: boolean; connected: boolean; reason?: string }>(
        "http://localhost:8000/configure/ibm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: ibmToken,
            instance: ibmInstance,
            backend_name: ibmBackendName,
          }),
        },
      ).catch(() => {
        // Backend may not be running — still mark as set locally.
      });
      setIbmTokenSet(true);
      setShowToken(false);
    }
  }, [ibmToken, ibmInstance, ibmBackendName, setIbmTokenSet]);

  const toggleShowToken = useCallback(() => setShowToken((v) => !v), []);

  return {
    alpha,
    shots,
    selectedBackend,
    ibmToken,
    ibmTokenSet,
    ibmInstance,
    ibmBackendName,
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
    setIbmInstance,
    setIbmBackendName,
    setNoiseLambda,
    setAlphaFake,
    setComparisonAlphas,
    setShowToken,
    clearIbmCredentials,
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
