import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { BACKENDS, PROTOCOL_ALPHA, type BackendId } from "../utils/constants";
import { energyFromAlpha } from "../utils/physics";
import { formatEnergy } from "../utils/physics";
import { fetchJson } from "../services/apiClient";
import { useIbmCredentials } from "./useIbmCredentials";
import { runAlphaSweep, type AlphaSweepPoint } from "../services/sweepApi";

export function useDashboardState() {
  const [alpha, setAlpha] = useState<number>(PROTOCOL_ALPHA);
  const [selectedAlphas, setSelectedAlphas] = useState<number[]>([
    PROTOCOL_ALPHA,
  ]);
  const [shots, setShots] = useState<number>(1024);
  const [selectedBackend, setSelectedBackend] = useState<BackendId>("aer");
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
  const [showToken, setShowToken] = useState<boolean>(false);

  // ── Alpha sweep (Figure 2) — persisted so navigation doesn't reset results ─
  const [sweepPoints, setSweepPoints] = useState<AlphaSweepPoint[] | null>(
    null,
  );
  const [sweepLoading, setSweepLoading] = useState(false);
  const [sweepError, setSweepError] = useState<string | null>(null);

  const runSweep = useCallback(async () => {
    setSweepLoading(true);
    setSweepError(null);
    try {
      const result = await runAlphaSweep(shots, 30);
      setSweepPoints(result.points);
    } catch (err) {
      setSweepError(err instanceof Error ? err.message : "Sweep failed");
    } finally {
      setSweepLoading(false);
    }
  }, [shots]);

  const theoreticalEnergy = useMemo(() => energyFromAlpha(alpha), [alpha]);
  const formattedTheoreticalEnergy = formatEnergy(theoreticalEnergy);
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

  const toggleAlpha = useCallback((v: number) => {
    setSelectedAlphas((prev) =>
      prev.includes(v) ? prev.filter((a) => a !== v) : [...prev, v],
    );
  }, []);

  return {
    alpha,
    selectedAlphas,
    shots,
    selectedBackend,
    ibmToken,
    ibmTokenSet,
    ibmInstance,
    ibmBackendName,
    noiseLambda,
    alphaFake,
    showToken,
    energy: theoreticalEnergy,
    formattedTheoreticalEnergy,
    backend,
    sweepPoints,
    sweepLoading,
    sweepError,
    runSweep,
    setAlpha,
    setSelectedAlphas,
    toggleAlpha,
    setShots,
    setSelectedBackend,
    setIbmToken,
    setIbmTokenSet,
    setIbmInstance,
    setIbmBackendName,
    setNoiseLambda,
    setAlphaFake,
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
