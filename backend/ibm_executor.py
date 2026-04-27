from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any

from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager

from backend.ibm_client import IBMClient

logger = logging.getLogger(__name__)


def _log_isa_circuit(isa_circuit: QuantumCircuit, backend_name: str, label: str = "") -> None:
    """Log the transpiled ISA circuit that will be physically submitted to IBM."""
    tag = f" [{label}]" if label else ""
    separator = "\u2501" * 60
    circuit_text = isa_circuit.draw(output="text", fold=-1)
    logger.info(
        "\n%s\n  IBM CIRCUIT SUBMITTED TO %s%s\n  depth=%d  gates=%d  qubits=%d\n%s\n%s\n%s",
        separator,
        backend_name.upper(),
        tag,
        isa_circuit.depth(),
        sum(isa_circuit.count_ops().values()),
        isa_circuit.num_qubits,
        separator,
        circuit_text,
        separator,
    )


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

    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)
    isa_circuit = pm.run(circuit)

    _log_isa_circuit(isa_circuit, getattr(backend, "name", "ibm"))

    sampler = Sampler(mode=backend)
    start = time.perf_counter()
    job = sampler.run([isa_circuit], shots=max(1, int(shots)))
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    return IBMSubmittedJob(
        job=job,
        backend_name=getattr(backend, "name", "ibm"),
        submitted_at_ms=elapsed_ms,
    )


def get_submitted_result(
    submitted: IBMSubmittedJob,
    shots: int,
) -> IBMExecutionResult:
    """Fetch final result for a previously submitted IBM Runtime job."""
    start = time.perf_counter()
    result = submitted.job.result()

    pub_res = result[0]
    data = pub_res.data

    # Extract counts from the first classical register, regardless of its name.
    # QuantumCircuit(n, m) + qc.measure() → register named 'c'
    # QuantumCircuit.measure_all()        → register named 'meas'
    creg = next(
        (v for v in vars(data).values() if hasattr(v, "get_counts")),
        None,
    )
    if creg is None:
        raise RuntimeError("Unsupported IBM Runtime result format: no classical register found")
    counts: dict[str, int] = {str(k): int(v) for k, v in creg.get_counts().items()}

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
    return get_submitted_result(submitted, shots)


def run_circuits_batch(
    circuits: list[QuantumCircuit],
    shots: int,
    client: IBMClient,
) -> list[IBMExecutionResult]:
    """Submit all circuits as a single IBM Runtime Sampler job.

    Returns one IBMExecutionResult per circuit, in the same order.
    This avoids creating one IBM job per measurement basis.
    """
    from qiskit_ibm_runtime import SamplerV2 as Sampler

    availability = client.connect()
    if not availability.available:
        raise RuntimeError(availability.reason or "IBM Runtime unavailable")

    backend = client.get_backend()
    if backend is None or client.service is None:
        raise RuntimeError("IBM backend not initialized")

    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)
    isa_circuits = [pm.run(c) for c in circuits]

    backend_name: str = getattr(backend, "name", "ibm")
    for i, isa in enumerate(isa_circuits):
        _log_isa_circuit(isa, backend_name, label=f"circuit {i + 1}/{len(isa_circuits)}")

    sampler = Sampler(mode=backend)
    start = time.perf_counter()
    job = sampler.run([(isa,) for isa in isa_circuits], shots=max(1, int(shots)))
    submit_ms = (time.perf_counter() - start) * 1000.0

    result = job.result()
    fetch_ms = (time.perf_counter() - start) * 1000.0
    job_id: str = getattr(job, "job_id", lambda: "")()  # type: ignore[assignment]

    results: list[IBMExecutionResult] = []
    for i, pub_res in enumerate(result):
        data = pub_res.data
        creg = next(
            (v for v in vars(data).values() if hasattr(v, "get_counts")),
            None,
        )
        if creg is None:
            raise RuntimeError(
                f"Unsupported IBM Runtime result format: no classical register in PUB {i}"
            )
        counts: dict[str, int] = {str(k): int(v) for k, v in creg.get_counts().items()}
        results.append(
            IBMExecutionResult(
                counts=counts,
                probabilities=_normalize_counts(counts, shots),
                metadata={
                    "job_id": job_id,
                    "backend_name": backend_name,
                    "execution_time_ms": fetch_ms + submit_ms,
                },
            )
        )
    return results
