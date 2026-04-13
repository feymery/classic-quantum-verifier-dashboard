from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class IBMAvailability:
    available: bool
    reason: str | None = None


class IBMClient:
    """Safe IBM Runtime client wrapper.

    This wrapper never raises on connection failures; callers can query
    availability and fallback to Aer.
    """

    def __init__(self, token: str | None = None, instance: str | None = None):
        self._token = token or os.getenv("IBM_QUANTUM_TOKEN", "").strip()
        self._instance = instance or os.getenv("IBM_QUANTUM_INSTANCE", "").strip()

        self._service: Any | None = None
        self._backend: Any | None = None
        self._availability = IBMAvailability(available=False, reason="not-connected")

    def connect(self) -> IBMAvailability:
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
                    channel="ibm_quantum",
                    token=self._token,
                    instance=self._instance,
                )
            else:
                self._service = QiskitRuntimeService(
                    channel="ibm_quantum",
                    token=self._token,
                )

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
