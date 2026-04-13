from __future__ import annotations

import logging
import math
from concurrent.futures import ThreadPoolExecutor

from backend import aer_executor, ibm_executor
from backend.circuit_builder import build_measurement_circuit
from backend.ibm_client import IBMClient
from backend.measurement_mapper import map_measurements, map_measurements_2q
from backend.jobs.job_store import job_store


logger = logging.getLogger(__name__)

_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="quantum-job")


def _compute_energy(alpha: float, observables: dict[str, float]) -> float:
    c2a = math.cos(2.0 * alpha)
    s2a = math.sin(2.0 * alpha)
    return 0.5 - 0.5 * c2a * observables["Z1Z2"] - 0.5 * s2a * observables["X1X2"]


def _compute_energy_2q(alpha: float, observables: dict[str, float]) -> float:
    c2a = math.cos(2.0 * alpha)
    s2a = math.sin(2.0 * alpha)
    primary = 0.5 - 0.5 * c2a * observables["Z1Z2"] - 0.5 * s2a * observables["X1X2"]
    cross = 0.5 - 0.5 * c2a * observables["Z1Z3"] - 0.5 * s2a * observables["X1X3"]
    return (primary + cross) / 2.0


def _run_aer(alpha: float, shots: int) -> tuple[dict[str, int], dict[str, int], str, float, dict]:
    z_circuit = build_measurement_circuit(alpha, basis="z")
    x_circuit = build_measurement_circuit(alpha, basis="x")

    z_result = aer_executor.run_circuit(z_circuit, shots)
    x_result = aer_executor.run_circuit(x_circuit, shots)

    execution_time = z_result.metadata.execution_time_ms + x_result.metadata.execution_time_ms
    meta = {
        "execution_backend": "aer",
        "backend_name": "aer",
    }
    return z_result.counts, x_result.counts, "aer", execution_time, meta


def _run_ibm(alpha: float, shots: int) -> tuple[dict[str, int], dict[str, int], str, float, dict]:
    z_circuit = build_measurement_circuit(alpha, basis="z")
    x_circuit = build_measurement_circuit(alpha, basis="x")
    client = IBMClient()

    z_submitted = ibm_executor.submit_circuit_job(z_circuit, shots, client)
    x_submitted = ibm_executor.submit_circuit_job(x_circuit, shots, client)

    z_result = ibm_executor.get_submitted_result(z_submitted, shots, z_circuit.num_qubits)
    x_result = ibm_executor.get_submitted_result(x_submitted, shots, x_circuit.num_qubits)

    execution_time = (
        float(z_result.metadata.get("execution_time_ms", 0.0))
        + float(x_result.metadata.get("execution_time_ms", 0.0))
    )
    meta = {
        "execution_backend": "ibm",
        "backend_name": str(z_result.metadata.get("backend_name", "ibm")),
        "ibm_job_id_z": str(z_result.metadata.get("job_id", "")),
        "ibm_job_id_x": str(x_result.metadata.get("job_id", "")),
    }
    return z_result.counts, x_result.counts, "ibm", execution_time, meta


def _run_aer_2q(
    alpha: float,
    shots: int,
) -> tuple[dict[str, int], dict[str, int], dict[str, int], dict[str, int], str, float, dict]:
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
    meta = {
        "execution_backend": "aer",
        "backend_name": "aer",
    }
    return (
        z_result.counts,
        x12_result.counts,
        x13_result.counts,
        x23_result.counts,
        "aer",
        execution_time,
        meta,
    )


def _run_ibm_2q(
    alpha: float,
    shots: int,
) -> tuple[dict[str, int], dict[str, int], dict[str, int], dict[str, int], str, float, dict]:
    z_circuit = build_measurement_circuit(alpha, basis="z")
    x12_circuit = build_measurement_circuit(alpha, basis="x12")
    x13_circuit = build_measurement_circuit(alpha, basis="x13")
    x23_circuit = build_measurement_circuit(alpha, basis="x23")
    client = IBMClient()

    z_submitted = ibm_executor.submit_circuit_job(z_circuit, shots, client)
    x12_submitted = ibm_executor.submit_circuit_job(x12_circuit, shots, client)
    x13_submitted = ibm_executor.submit_circuit_job(x13_circuit, shots, client)
    x23_submitted = ibm_executor.submit_circuit_job(x23_circuit, shots, client)

    z_result = ibm_executor.get_submitted_result(z_submitted, shots, z_circuit.num_qubits)
    x12_result = ibm_executor.get_submitted_result(x12_submitted, shots, x12_circuit.num_qubits)
    x13_result = ibm_executor.get_submitted_result(x13_submitted, shots, x13_circuit.num_qubits)
    x23_result = ibm_executor.get_submitted_result(x23_submitted, shots, x23_circuit.num_qubits)

    execution_time = (
        float(z_result.metadata.get("execution_time_ms", 0.0))
        + float(x12_result.metadata.get("execution_time_ms", 0.0))
        + float(x13_result.metadata.get("execution_time_ms", 0.0))
        + float(x23_result.metadata.get("execution_time_ms", 0.0))
    )
    meta = {
        "execution_backend": "ibm",
        "backend_name": str(z_result.metadata.get("backend_name", "ibm")),
        "ibm_job_id_z": str(z_result.metadata.get("job_id", "")),
        "ibm_job_id_x12": str(x12_result.metadata.get("job_id", "")),
        "ibm_job_id_x13": str(x13_result.metadata.get("job_id", "")),
        "ibm_job_id_x23": str(x23_result.metadata.get("job_id", "")),
    }
    return (
        z_result.counts,
        x12_result.counts,
        x13_result.counts,
        x23_result.counts,
        "ibm",
        execution_time,
        meta,
    )


def _compose_result_2q(
    alpha: float,
    shots: int,
    counts_z: dict[str, int],
    counts_x12: dict[str, int],
    counts_x13: dict[str, int],
    counts_x23: dict[str, int],
    backend_used: str,
    execution_time: float,
) -> dict:
    mapped = map_measurements_2q(counts_z, counts_x12, counts_x13, counts_x23, shots)
    energy = _compute_energy_2q(alpha, mapped.observables)

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


def _compose_result(
    alpha: float,
    shots: int,
    counts_z: dict[str, int],
    counts_x: dict[str, int],
    backend_used: str,
    execution_time: float,
) -> dict:
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


def run_job_async(job_id: str) -> None:
    job = job_store.get_job(job_id)
    if job is None:
        return

    alpha = float(job["alpha"])
    shots = int(job["shots"])
    requested_backend = str(job["backend"])
    run_mode = str((job.get("metadata") or {}).get("mode", "1q")).lower()

    job_store.update_job(job_id, status="running")

    try:
        if run_mode == "2q":
            if requested_backend == "ibm":
                try:
                    counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time, metadata = _run_ibm_2q(alpha, shots)
                except Exception as exc:
                    logger.warning("IBM async 2Q execution failed for job %s, falling back to Aer: %s", job_id, exc)
                    counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time, metadata = _run_aer_2q(alpha, shots)
                    metadata["fallback_reason"] = str(exc)
                    metadata["requested_backend"] = "ibm"
            else:
                counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time, metadata = _run_aer_2q(alpha, shots)
                metadata["requested_backend"] = requested_backend

            result = _compose_result_2q(
                alpha,
                shots,
                counts_z,
                counts_x12,
                counts_x13,
                counts_x23,
                backend_used,
                execution_time,
            )
        else:
            if requested_backend == "ibm":
                try:
                    counts_z, counts_x, backend_used, execution_time, metadata = _run_ibm(alpha, shots)
                except Exception as exc:
                    logger.warning("IBM async execution failed for job %s, falling back to Aer: %s", job_id, exc)
                    counts_z, counts_x, backend_used, execution_time, metadata = _run_aer(alpha, shots)
                    metadata["fallback_reason"] = str(exc)
                    metadata["requested_backend"] = "ibm"
            else:
                counts_z, counts_x, backend_used, execution_time, metadata = _run_aer(alpha, shots)
                metadata["requested_backend"] = requested_backend

            result = _compose_result(alpha, shots, counts_z, counts_x, backend_used, execution_time)

        metadata["mode"] = run_mode
        job_store.update_job(
            job_id,
            status="done",
            result=result,
            metadata=metadata,
            error=None,
        )
    except Exception as exc:
        logger.exception("Job %s failed", job_id)
        job_store.update_job(
            job_id,
            status="failed",
            error=str(exc),
            metadata={"requested_backend": requested_backend},
        )


def submit_job(alpha: float, shots: int, backend: str = "ibm", mode: str = "1q") -> str:
    backend_name = "ibm" if (backend or "ibm").strip().lower() == "ibm" else "aer"
    run_mode = "2q" if (mode or "1q").strip().lower() == "2q" else "1q"
    job_id = job_store.create_job(
        alpha=alpha,
        shots=shots,
        backend=backend_name,
        metadata={"mode": run_mode},
    )
    _EXECUTOR.submit(run_job_async, job_id)
    return job_id
