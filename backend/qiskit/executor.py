"""Unified quantum circuit executor.

All three execution targets share exactly the same code path:

    ideal   = AerSimulator()                      # noiseless Aer
    aersim  = AerSimulator.from_backend(qpu)      # Aer with QPU noise model
    hardware = qpu                                 # real IBM QPU

The only difference is the backend object passed to run_circuits().
Transpilation (generate_preset_pass_manager), primitive (SamplerV2) and
result extraction (_extract_counts) are identical in all three cases.

For the IBM QPU path, SamplerV2 is imported from qiskit_ibm_runtime so it
submits via the IBM Runtime service.  For Aer paths, SamplerV2 from
qiskit_aer.primitives is used.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any

from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error
from qiskit_aer.primitives import SamplerV2 as AerSampler

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ExecutionResult:
    counts: dict[str, int]
    probabilities: dict[str, float]
    metadata: dict[str, Any]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _normalize(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe = max(1, int(shots))
    return {k: v / safe for k, v in counts.items()}


def _extract_counts(pub_data: Any, creg_name: str) -> dict[str, int]:
    """Access result counts by named classical register."""
    creg = getattr(pub_data, creg_name, None)
    if creg is None or not hasattr(creg, "get_counts"):
        raise RuntimeError(f"Classical register '{creg_name}' not found in result.")
    return {str(k): int(v) for k, v in creg.get_counts().items()}


def _is_ibm_backend(backend: Any) -> bool:
    """True when backend is a real IBM QPU (not an AerSimulator)."""
    return not isinstance(backend, AerSimulator)


def _sampler_for(backend: Any) -> Any:
    """Return the correct SamplerV2 for the given backend."""
    if _is_ibm_backend(backend):
        from qiskit_ibm_runtime import SamplerV2 as IBMSampler  # noqa: PLC0415
        return IBMSampler(mode=backend)
    return AerSampler()


def _log_circuits(isa_circuits: list[QuantumCircuit], backend_name: str) -> None:
    sep = "\u2501" * 60
    for i, isa in enumerate(isa_circuits):
        label = f"circuit {i + 1}/{len(isa_circuits)}"
        logger.info(
            "\n%s\n  CIRCUIT TO %s [%s]  depth=%d gates=%d qubits=%d\n%s\n%s\n%s",
            sep, backend_name.upper(), label,
            isa.depth(), sum(isa.count_ops().values()), isa.num_qubits,
            sep, isa.draw(output="text", fold=-1), sep,
        )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_circuits(
    circuits: list[QuantumCircuit],
    shots: int,
    backend: Any | None = None,
) -> list[ExecutionResult]:
    """Transpile and execute a list of circuits on any backend, return one
    ExecutionResult per circuit.

    Parameters
    ----------
    circuits:
        Circuits to execute.  All must have the same number of classical bits
        (but can have different basis rotations).
    shots:
        Number of shots per circuit.
    backend:
        - None or AerSimulator()    → ideal simulation (no noise)
        - AerSimulator.from_backend(qpu) → noise-calibrated Aer simulation
        - IBM QPU object            → real hardware via IBM Runtime Sampler
    """
    if backend is None:
        backend = AerSimulator()

    shot_count = max(1, int(shots))
    raw_name: str = getattr(backend, "name", type(backend).__name__)
    backend_name: str = "aer" if isinstance(backend, AerSimulator) else raw_name

    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)
    isa_circuits = [pm.run(c) for c in circuits]

    if logger.isEnabledFor(logging.INFO) and _is_ibm_backend(backend):
        _log_circuits(isa_circuits, backend_name)

    sampler = _sampler_for(backend)

    start = time.perf_counter()
    # IBM SamplerV2 accepts a list of PUBs; Aer SamplerV2 also accepts the same format.
    job = sampler.run([isa for isa in isa_circuits], shots=shot_count)
    submit_ms = (time.perf_counter() - start) * 1000.0

    result = job.result()
    total_ms = (time.perf_counter() - start) * 1000.0

    job_id: str = getattr(job, "job_id", lambda: "")()  # type: ignore[assignment]

    results: list[ExecutionResult] = []
    for pub_res, circuit in zip(result, circuits):
        creg_name = circuit.cregs[0].name if circuit.cregs else "meas"
        counts = _extract_counts(pub_res.data, creg_name)
        results.append(ExecutionResult(
            counts=counts,
            probabilities=_normalize(counts, shot_count),
            metadata={
                "backend_name": backend_name,
                "shots": shot_count,
                "job_id": job_id,
                "execution_time_ms": total_ms,
                "submit_time_ms": submit_ms,
            },
        ))
    return results


def run_circuit(
    circuit: QuantumCircuit,
    shots: int,
    backend: Any | None = None,
) -> ExecutionResult:
    """Convenience wrapper for a single circuit."""
    return run_circuits([circuit], shots, backend)[0]


# ---------------------------------------------------------------------------
# Noise-model helpers
# ---------------------------------------------------------------------------

def make_depolarizing_backend(noise_p: float) -> AerSimulator:
    """Return an AerSimulator with a single-parameter depolarizing noise model.

    1-qubit gates: noise_p
    2-qubit gates: min(noise_p * 10, 1.0)
    """
    p_1q = float(min(noise_p, 1.0))
    p_2q = float(min(noise_p * 10.0, 1.0))
    nm = NoiseModel()
    nm.add_all_qubit_quantum_error(
        depolarizing_error(p_1q, 1),
        ["h", "ry", "rz", "x", "y", "z", "u", "u1", "u2", "u3"],
    )
    nm.add_all_qubit_quantum_error(
        depolarizing_error(p_2q, 2),
        ["cx", "cz"],
    )
    return AerSimulator(noise_model=nm)


def make_qpu_backend(qpu_backend: Any) -> AerSimulator:
    """Return AerSimulator seeded from a real IBM QPU's calibration data."""
    return AerSimulator.from_backend(qpu_backend)
