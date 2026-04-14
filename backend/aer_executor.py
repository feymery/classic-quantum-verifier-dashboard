from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error


DEFAULT_SEED = 137


@dataclass(frozen=True)
class ExecutionMetadata:
    backend_name: str
    shots: int
    execution_time_ms: float


@dataclass(frozen=True)
class ExecutionResult:
    counts: dict[str, int]
    probabilities: dict[str, float]
    metadata: ExecutionMetadata


_SIMULATOR = AerSimulator(seed_simulator=DEFAULT_SEED)


def _normalize_counts(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe_shots = max(1, int(shots))
    return {state: count / safe_shots for state, count in counts.items()}


def run_circuit(circuit: QuantumCircuit, shots: int) -> ExecutionResult:
    """Execute a circuit on a reused AerSimulator instance.

    Determinism is enforced by fixed transpiler and simulator seeds.
    """
    shot_count = max(1, int(shots))

    start = time.perf_counter()
    compiled = transpile(
        circuit,
        _SIMULATOR,
        optimization_level=1,
        seed_transpiler=DEFAULT_SEED,
    )
    result = _SIMULATOR.run(
        compiled,
        shots=shot_count,
        seed_simulator=DEFAULT_SEED,
    ).result()
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    raw_counts: Any = result.get_counts(compiled)
    counts: dict[str, int] = {str(k): int(v) for k, v in dict(raw_counts).items()}

    return ExecutionResult(
        counts=counts,
        probabilities=_normalize_counts(counts, shot_count),
        metadata=ExecutionMetadata(
            backend_name="aer",
            shots=shot_count,
            execution_time_ms=elapsed_ms,
        ),
    )


def run_circuit_noisy(
    circuit: QuantumCircuit, shots: int, noise_p: float
) -> ExecutionResult:
    """Execute a circuit with a single-parameter depolarizing noise model.

    A depolarizing channel with error probability ``noise_p`` is applied to
    every 1-qubit and 2-qubit gate.  When ``noise_p <= 0`` the noiseless
    :func:`run_circuit` path is taken.

    The 2-qubit depolarizing rate is set to ``min(noise_p * 10, 1.0)`` so
    that two-qubit gates experience stronger noise, consistent with the
    standard gate-error hierarchy on real devices.
    """
    if noise_p <= 0.0:
        return run_circuit(circuit, shots)

    shot_count = max(1, int(shots))
    p_1q = float(min(noise_p, 1.0))
    p_2q = float(min(noise_p * 10.0, 1.0))

    noise_model = NoiseModel()
    noise_model.add_all_qubit_quantum_error(
        depolarizing_error(p_1q, 1),
        ["h", "ry", "rz", "x", "y", "z", "u", "u1", "u2", "u3"],
    )
    noise_model.add_all_qubit_quantum_error(
        depolarizing_error(p_2q, 2),
        ["cx", "cz"],
    )

    noisy_simulator = AerSimulator(
        noise_model=noise_model,
        seed_simulator=DEFAULT_SEED,
    )

    start = time.perf_counter()
    compiled = transpile(
        circuit,
        noisy_simulator,
        optimization_level=1,
        seed_transpiler=DEFAULT_SEED,
    )
    result = noisy_simulator.run(
        compiled,
        shots=shot_count,
        seed_simulator=DEFAULT_SEED,
    ).result()
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    raw_counts: Any = result.get_counts(compiled)
    counts: dict[str, int] = {str(k): int(v) for k, v in dict(raw_counts).items()}

    return ExecutionResult(
        counts=counts,
        probabilities=_normalize_counts(counts, shot_count),
        metadata=ExecutionMetadata(
            backend_name="aer-noisy",
            shots=shot_count,
            execution_time_ms=elapsed_ms,
        ),
    )
