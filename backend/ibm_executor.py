from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

from qiskit import QuantumCircuit

from backend.ibm_client import IBMClient


@dataclass(frozen=True)
class IBMExecutionResult:
    counts: dict[str, int]
    probabilities: dict[str, float]
    metadata: dict[str, Any]


@dataclass(frozen=True)
class IBMSubmittedJob:
    job: Any
    backend_name: str
    submitted_at_ms: float


def _quasi_to_counts(quasi: dict[int, float], shots: int, bits: int) -> dict[str, int]:
    safe_shots = max(1, int(shots))
    counts: dict[str, int] = {}

    for idx, prob in quasi.items():
        p = max(0.0, float(prob))
        state = format(int(idx), f"0{bits}b")
        counts[state] = int(round(p * safe_shots))

    total = sum(counts.values())
    if total != safe_shots:
        delta = safe_shots - total
        key = max(counts, key=counts.get) if counts else ("0" * bits)
        counts[key] = counts.get(key, 0) + delta

    return counts


def _normalize_counts(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe_shots = max(1, int(shots))
    return {k: v / safe_shots for k, v in counts.items()}


def submit_circuit_job(
    circuit: QuantumCircuit,
    shots: int,
    client: IBMClient,
) -> IBMSubmittedJob:
    """Submit circuit to IBM Runtime Sampler and return job handle immediately."""
    availability = client.connect()
    if not availability.available:
        raise RuntimeError(availability.reason or "IBM Runtime unavailable")

    backend = client.get_backend()
    service = client.service
    if backend is None or service is None:
        raise RuntimeError("IBM backend not initialized")

    from qiskit_ibm_runtime import SamplerV2 as Sampler

    sampler = Sampler(mode=backend)
    start = time.perf_counter()
    job = sampler.run([circuit], shots=max(1, int(shots)))
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    return IBMSubmittedJob(
        job=job,
        backend_name=getattr(backend, "name", "ibm"),
        submitted_at_ms=elapsed_ms,
    )


def get_submitted_result(
    submitted: IBMSubmittedJob,
    shots: int,
    circuit_bits: int,
) -> IBMExecutionResult:
    """Fetch final result for a previously submitted IBM Runtime job."""
    start = time.perf_counter()
    result = submitted.job.result()

    pub_res = result[0]
    data = pub_res.data

    counts: dict[str, int]
    if hasattr(data, "c"):
        meas = data.c
        counts = {str(k): int(v) for k, v in meas.get_counts().items()}
    elif hasattr(data, "quasi_dists"):
        quasi_dist = data.quasi_dists[0]
        quasi_map = {int(k): float(v) for k, v in quasi_dist.items()}
        counts = _quasi_to_counts(quasi_map, shots, bits=circuit_bits)
    else:
        raise RuntimeError("Unsupported IBM Runtime result format")

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    return IBMExecutionResult(
        counts=counts,
        probabilities=_normalize_counts(counts, shots),
        metadata={
            "job_id": getattr(submitted.job, "job_id", lambda: "")(),
            "backend_name": submitted.backend_name,
            "execution_time_ms": elapsed_ms + submitted.submitted_at_ms,
        },
    )


def run_circuit(circuit: QuantumCircuit, shots: int, client: IBMClient) -> IBMExecutionResult:
    """Execute using IBM Runtime Sampler primitive.

    Raises RuntimeError when IBM Runtime is unavailable; caller must fallback.
    """
    availability = client.connect()
    if not availability.available:
        raise RuntimeError(availability.reason or "IBM Runtime unavailable")

    backend = client.get_backend()
    service = client.service
    if backend is None or service is None:
        raise RuntimeError("IBM backend not initialized")

    submitted = submit_circuit_job(circuit, shots, client)
    return get_submitted_result(submitted, shots, circuit_bits=circuit.num_qubits)
