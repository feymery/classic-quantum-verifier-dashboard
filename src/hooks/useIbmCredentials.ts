import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "../services/apiClient";

/**
 * IBM credentials are stored in localStorage so they survive page refreshes.
 *
 * Security note: localStorage is scoped to the origin and inaccessible from
 * other origins. For a locally-run developer tool this is an acceptable
 * trade-off. Do NOT deploy this dashboard on a public host with shared users.
 */

const KEYS = {
  token: "qvd.ibm.token",
  instance: "qvd.ibm.instance",
  backendName: "qvd.ibm.backendName",
  tokenSet: "qvd.ibm.tokenSet",
} as const;

function read(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function write(key: string, value: string): void {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // localStorage unavailable (private mode, quota exceeded) — silently degrade
  }
}

export function useIbmCredentials() {
  const [ibmToken, setIbmTokenState] = useState<string>(() => read(KEYS.token));
  const [ibmInstance, setIbmInstanceState] = useState<string>(() =>
    read(KEYS.instance),
  );
  const [ibmBackendName, setIbmBackendNameState] = useState<string>(() =>
    read(KEYS.backendName),
  );
  const [ibmTokenSet, setIbmTokenSetState] = useState<boolean>(
    () => read(KEYS.tokenSet) === "1",
  );

  const setIbmToken = useCallback((value: string) => {
    setIbmTokenState(value);
    write(KEYS.token, value);
  }, []);

  const setIbmInstance = useCallback((value: string) => {
    setIbmInstanceState(value);
    write(KEYS.instance, value);
  }, []);

  const setIbmBackendName = useCallback((value: string) => {
    setIbmBackendNameState(value);
    write(KEYS.backendName, value);
  }, []);

  const setIbmTokenSet = useCallback((value: boolean) => {
    setIbmTokenSetState(value);
    write(KEYS.tokenSet, value ? "1" : "");
  }, []);

  const clearIbmCredentials = useCallback(() => {
    setIbmTokenState("");
    setIbmInstanceState("");
    setIbmBackendNameState("");
    setIbmTokenSetState(false);
    Object.values(KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    });
  }, []);

  // Restore stored credentials to the Python backend on every mount.
  // The backend holds credentials in-memory only; a server restart or page
  // refresh clears them. verify=false avoids a network call to IBM on load.
  useEffect(() => {
    if (!ibmTokenSet || !ibmToken) return;

    fetchJson<{ configured: boolean; connected: boolean; reason?: string }>(
      "http://localhost:8000/configure/ibm",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: ibmToken,
          instance: ibmInstance,
          backend_name: ibmBackendName,
          verify: false,
        }),
      },
    ).catch(() => {
      // Backend may not be running yet — silently skip.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount — intentionally excludes credential values

  return {
    ibmToken,
    ibmTokenSet,
    ibmInstance,
    ibmBackendName,
    setIbmToken,
    setIbmTokenSet,
    setIbmInstance,
    setIbmBackendName,
    clearIbmCredentials,
  };
}
