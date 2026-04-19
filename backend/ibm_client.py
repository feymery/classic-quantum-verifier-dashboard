from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class IBMAvailability:
    available: bool
    reason: str | None = None


# ---------------------------------------------------------------------------
# Runtime configuration (set at runtime via /configure/ibm, takes precedence
# over environment variables).
# ---------------------------------------------------------------------------
_runtime_token: str = ""
_runtime_instance: str = ""
_runtime_backend_name: str = ""

# ---------------------------------------------------------------------------
# Module-level singleton.  Created lazily; invalidated on every
# configure_runtime() call so stale credentials are never reused.
# ---------------------------------------------------------------------------
_shared_client: "IBMClient | None" = None


def configure_runtime(token: str, instance: str, backend_name: str = "") -> None:
    """Store IBM credentials supplied at runtime by the user."""
    global _runtime_token, _runtime_instance, _runtime_backend_name, _shared_client
    _runtime_token = token.strip()
    _runtime_instance = instance.strip()
    _runtime_backend_name = backend_name.strip()
    _shared_client = None  # invalidate singleton so next call uses new credentials


def get_shared_client() -> "IBMClient":
    """Return the process-wide IBMClient singleton.

    The singleton is created once and reused for the lifetime of the process
    (or until credentials change via configure_runtime).  Callers that need
    a real IBM connection must call ``.connect()`` on the returned instance;
    callers that only need the last-known availability state can read
    ``.availability`` without triggering a new network round-trip.
    """
    global _shared_client
    if _shared_client is None:
        _shared_client = IBMClient()
    return _shared_client


class IBMClient:
    """Safe IBM Runtime client wrapper.

    This wrapper never raises on connection failures; callers can query
    availability and fallback to Aer.
    """

    def __init__(self, token: str | None = None, instance: str | None = None, backend_name: str | None = None):
        self._token = (
            token
            or _runtime_token
            or os.getenv("IBM_QUANTUM_TOKEN", "")
        ).strip()
        self._instance = (
            instance
            or _runtime_instance
            or os.getenv("IBM_QUANTUM_INSTANCE", "")
        ).strip()
        self._backend_name = (
            backend_name
            or _runtime_backend_name
            or os.getenv("IBM_QUANTUM_BACKEND", "")
        ).strip()

        self._service: Any | None = None
        self._backend: Any | None = None
        self._availability = IBMAvailability(available=False, reason="not-connected")

    def connect(self) -> IBMAvailability:
        # Idempotent: skip the network round-trip if already connected.
        if self._availability.available and self._service is not None:
            return self._availability

        if not self._token:
            self._availability = IBMAvailability(
                available=False,
                reason="missing IBM_QUANTUM_TOKEN",
            )
            return self._availability

        try:
            from qiskit_ibm_runtime import QiskitRuntimeService
        except Exception:
            self._availability = IBMAvailability(
                available=False,
                reason="qiskit-ibm-runtime not installed",
            )
            return self._availability

        try:
            if self._instance:
                self._service = QiskitRuntimeService(
                    channel="ibm_cloud",
                    token=self._token,
                    instance=self._instance,
                )
            else:
                self._service = QiskitRuntimeService(
                    channel="ibm_cloud",
                    token=self._token,
                )

            if self._backend_name:
                self._backend = self._service.backend(self._backend_name)
            else:
                self._backend = self._service.least_busy(simulator=False, operational=True)
            self._availability = IBMAvailability(available=True)
            return self._availability
        except Exception as exc:
            self._service = None
            self._backend = None
            self._availability = IBMAvailability(available=False, reason=str(exc))
            return self._availability

    def is_available(self) -> bool:
        return bool(self._availability.available)

    def get_backend(self) -> Any | None:
        return self._backend

    @property
    def service(self) -> Any | None:
        return self._service

    @property
    def availability(self) -> IBMAvailability:
        return self._availability
