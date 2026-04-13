from __future__ import annotations

import logging

from backend import aer_executor, ibm_executor
from backend.circuit_builder import build_measurement_circuit
from backend.ibm_client import IBMClient
from backend.jobs.job_executor import submit_job
from backend.measurement_mapper import map_measurements, map_measurements_2q


logger = logging.getLogger(__name__)


def _safe_empty_response(alpha: float, shots: int) -> dict:
    return {
        "alpha": float(alpha),
        "observables": {"Z1": 0.0, "Z2": 0.0, "Z1Z2": 0.0, "X1X2": 0.0},
        "noisyObservables": {"Z1": 0.0, "Z2": 0.0, "Z1Z2": 0.0, "X1X2": 0.0},
        "energy": 0.0,
        "counts": {"000": 0, "001": 0, "010": 0, "011": 0, "100": 0, "101": 0, "110": 0, "111": 0},
        "probabilities": {
            "000": 0.0,
            "001": 0.0,
            "010": 0.0,
            "011": 0.0,
            "100": 0.0,
            "101": 0.0,
            "110": 0.0,
            "111": 0.0,
        },
        "backendInfo": {
            "type": "aer",
            "shots": int(shots),
            "executionTime": 0.0,
        },
    }


def _compute_energy(alpha: float, observables: dict[str, float]) -> float:
    """Energy estimator consistent with existing frontend physics formula.

    E = 1/2 - 1/2*cos(2a)*<Z1Z2> - 1/2*sin(2a)*<X1X2>
    """
    import math

    c2a = math.cos(2.0 * alpha)
    s2a = math.sin(2.0 * alpha)
    return 0.5 - 0.5 * c2a * observables["Z1Z2"] - 0.5 * s2a * observables["X1X2"]


def _compute_energy_2q(alpha: float, observables: dict[str, float]) -> float:
    """2Q frontend-compatible estimate: average of primary and cross-check."""
    import math

    c2a = math.cos(2.0 * alpha)
    s2a = math.sin(2.0 * alpha)
    primary = 0.5 - 0.5 * c2a * observables["Z1Z2"] - 0.5 * s2a * observables["X1X2"]
    cross = 0.5 - 0.5 * c2a * observables["Z1Z3"] - 0.5 * s2a * observables["X1X3"]
    return (primary + cross) / 2.0


def _run_with_aer(alpha: float, shots: int) -> tuple[dict[str, int], dict[str, int], str, float]:
    z_circuit = build_measurement_circuit(alpha, basis="z")
    x_circuit = build_measurement_circuit(alpha, basis="x")

    z_result = aer_executor.run_circuit(z_circuit, shots)
    x_result = aer_executor.run_circuit(x_circuit, shots)
    execution_time = (
        z_result.metadata.execution_time_ms + x_result.metadata.execution_time_ms
    )
    return z_result.counts, x_result.counts, "aer", execution_time


def _run_with_aer_2q(
    alpha: float,
    shots: int,
) -> tuple[dict[str, int], dict[str, int], dict[str, int], dict[str, int], str, float]:
    z_circuit = build_measurement_circuit(alpha, basis="z")
    x12_circuit = build_measurement_circuit(alpha, basis="x12")
    x13_circuit = build_measurement_circuit(alpha, basis="x13")
    x23_circuit = build_measurement_circuit(alpha, basis="x23")

    z_result = aer_executor.run_circuit(z_circuit, shots)
    x12_result = aer_executor.run_circuit(x12_circuit, shots)
    x13_result = aer_executor.run_circuit(x13_circuit, shots)
    x23_result = aer_executor.run_circuit(x23_circuit, shots)

    execution_time = (
        z_result.metadata.execution_time_ms
        + x12_result.metadata.execution_time_ms
        + x13_result.metadata.execution_time_ms
        + x23_result.metadata.execution_time_ms
    )

    return (
        z_result.counts,
        x12_result.counts,
        x13_result.counts,
        x23_result.counts,
        "aer",
        execution_time,
    )


def _run_with_ibm(alpha: float, shots: int) -> tuple[dict[str, int], dict[str, int], str, float]:
    z_circuit = build_measurement_circuit(alpha, basis="z")
    x_circuit = build_measurement_circuit(alpha, basis="x")
    client = IBMClient()

    z_result = ibm_executor.run_circuit(z_circuit, shots, client)
    x_result = ibm_executor.run_circuit(x_circuit, shots, client)
    execution_time = (
        float(z_result.metadata.get("execution_time_ms", 0.0))
        + float(x_result.metadata.get("execution_time_ms", 0.0))
    )
    return z_result.counts, x_result.counts, "ibm", execution_time


def _run_with_ibm_2q(
    alpha: float,
    shots: int,
) -> tuple[dict[str, int], dict[str, int], dict[str, int], dict[str, int], str, float]:
    z_circuit = build_measurement_circuit(alpha, basis="z")
    x12_circuit = build_measurement_circuit(alpha, basis="x12")
    x13_circuit = build_measurement_circuit(alpha, basis="x13")
    x23_circuit = build_measurement_circuit(alpha, basis="x23")
    client = IBMClient()

    z_result = ibm_executor.run_circuit(z_circuit, shots, client)
    x12_result = ibm_executor.run_circuit(x12_circuit, shots, client)
    x13_result = ibm_executor.run_circuit(x13_circuit, shots, client)
    x23_result = ibm_executor.run_circuit(x23_circuit, shots, client)
    execution_time = (
        float(z_result.metadata.get("execution_time_ms", 0.0))
        + float(x12_result.metadata.get("execution_time_ms", 0.0))
        + float(x13_result.metadata.get("execution_time_ms", 0.0))
        + float(x23_result.metadata.get("execution_time_ms", 0.0))
    )
    return (
        z_result.counts,
        x12_result.counts,
        x13_result.counts,
        x23_result.counts,
        "ibm",
        execution_time,
    )


def runExperiment(alpha: float, shots: int, backend: str = "aer", mode: str = "1q") -> dict:
    """Main orchestration entry point used by the API layer."""
    return runExperimentSync(alpha=alpha, shots=shots, backend=backend, mode=mode)


def runExperimentSync(alpha: float, shots: int, backend: str = "aer", mode: str = "1q") -> dict:
    """Synchronous execution path.

    Keeps current contract for immediate results, with IBM->Aer fallback.
    """
    backend_requested = (backend or "aer").strip().lower()
    run_mode = (mode or "1q").strip().lower()

    try:
        if run_mode == "2q":
            if backend_requested == "ibm":
                try:
                    counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time = _run_with_ibm_2q(alpha, shots)
                except Exception as exc:
                    logger.warning("IBM 2Q execution failed, falling back to Aer: %s", exc)
                    counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time = _run_with_aer_2q(alpha, shots)
            else:
                counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time = _run_with_aer_2q(alpha, shots)

            mapped = map_measurements_2q(counts_z, counts_x12, counts_x13, counts_x23, shots)
            energy = _compute_energy_2q(alpha, mapped.observables)
        else:
            if backend_requested == "ibm":
                try:
                    counts_z, counts_x, backend_used, execution_time = _run_with_ibm(
                        alpha,
                        shots,
                    )
                except Exception as exc:
                    logger.warning("IBM execution failed, falling back to Aer: %s", exc)
                    counts_z, counts_x, backend_used, execution_time = _run_with_aer(
                        alpha,
                        shots,
                    )
            else:
                counts_z, counts_x, backend_used, execution_time = _run_with_aer(alpha, shots)

            mapped = map_measurements(counts_z, counts_x, shots)
            energy = _compute_energy(alpha, mapped.observables)

        return {
            "alpha": float(alpha),
            "observables": mapped.observables,
            "noisyObservables": mapped.observables,
            "energy": energy,
            "counts": counts_z,
            "probabilities": mapped.probabilities,
            "backendInfo": {
                "type": backend_used,
                "shots": int(shots),
                "executionTime": execution_time,
            },
        }
    except Exception as exc:
        logger.exception("runExperiment failed, returning safe empty response: %s", exc)
        return _safe_empty_response(alpha, shots)


def submitExperimentJob(
    alpha: float,
    shots: int,
    backend: str = "ibm",
    mode: str = "1q",
) -> dict:
    """Submit asynchronous experiment job and return queue metadata."""
    job_id = submit_job(alpha, shots, backend, mode)
    return {
        "job_id": job_id,
        "status": "queued",
    }
