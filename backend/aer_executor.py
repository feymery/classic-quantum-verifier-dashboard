from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator


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
