from __future__ import annotations

import logging
import math
from concurrent.futures import ThreadPoolExecutor

from backend import aer_executor, ibm_executor
from backend.circuit_builder import build_measurement_circuit
from backend.energy import compute_energy as _compute_energy
from backend.ibm_client import IBMClient, get_shared_client
from backend.measurement_mapper import map_measurements, map_measurements_2q
from backend.jobs.job_store import job_store


logger = logging.getLogger(__name__)

# Separate pools so slow IBM jobs (minutes) cannot starve fast Aer jobs (seconds).
_IBM_EXECUTOR = ThreadPoolExecutor(max_workers=8, thread_name_prefix="quantum-ibm")
_AER_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="quantum-aer")


def _compute_energy_2q(alpha: float, observables: dict[str, float]) -> float:
    c2a = math.cos(2.0 * alpha)
    s2a = math.sin(2.0 * alpha)
    primary = 0.5 - 0.5 * c2a * observables["Z1Z2"] - 0.5 * s2a * observables["X1X2"]
    cross = 0.5 - 0.5 * c2a * observables["Z1Z3"] - 0.5 * s2a * observables["X1X3"]
    return (primary + cross) / 2.0


def _run_aer(alpha: float, shots: int) -> tuple[dict[str, int], dict[str, int], dict[str, int], str, float, dict]:
    z_circuit  = build_measurement_circuit(alpha, basis="z")
    zx_circuit = build_measurement_circuit(alpha, basis="zx")
    x_circuit  = build_measurement_circuit(alpha, basis="x")

    z_result  = aer_executor.run_circuit(z_circuit, shots)
    zx_result = aer_executor.run_circuit(zx_circuit, shots)
    x_result  = aer_executor.run_circuit(x_circuit, shots)

    execution_time = (
        z_result.metadata.execution_time_ms
        + zx_result.metadata.execution_time_ms
        + x_result.metadata.execution_time_ms
    )
    meta = {
        "execution_backend": "aer",
        "backend_name": "aer",
    }
    return z_result.counts, zx_result.counts, x_result.counts, "aer", execution_time, meta


def _run_ibm(alpha: float, shots: int) -> tuple[dict[str, int], dict[str, int], dict[str, int], str, float, dict]:
    z_circuit  = build_measurement_circuit(alpha, basis="z")
    zx_circuit = build_measurement_circuit(alpha, basis="zx")
    x_circuit  = build_measurement_circuit(alpha, basis="x")
    client = get_shared_client()

    # Single IBM job for all 3 basis circuits — avoids 3 separate queue waits.
    z_result, zx_result, x_result = ibm_executor.run_circuits_batch(
        [z_circuit, zx_circuit, x_circuit], shots, client
    )

    execution_time = float(z_result.metadata.get("execution_time_ms", 0.0))
    meta = {
        "execution_backend": "ibm",
        "backend_name": str(z_result.metadata.get("backend_name", "ibm")),
        "ibm_job_id": str(z_result.metadata.get("job_id", "")),
    }
    return z_result.counts, zx_result.counts, x_result.counts, "ibm", execution_time, meta


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
    z_circuit   = build_measurement_circuit(alpha, basis="z")
    x12_circuit = build_measurement_circuit(alpha, basis="x12")
    x13_circuit = build_measurement_circuit(alpha, basis="x13")
    x23_circuit = build_measurement_circuit(alpha, basis="x23")
    client = get_shared_client()

    # Single IBM job for all 4 basis circuits — avoids 4 separate queue waits.
    z_result, x12_result, x13_result, x23_result = ibm_executor.run_circuits_batch(
        [z_circuit, x12_circuit, x13_circuit, x23_circuit], shots, client
    )

    execution_time = float(z_result.metadata.get("execution_time_ms", 0.0))
    meta = {
        "execution_backend": "ibm",
        "backend_name": str(z_result.metadata.get("backend_name", "ibm")),
        "ibm_job_id": str(z_result.metadata.get("job_id", "")),
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
    counts_zx: dict[str, int],
    counts_x: dict[str, int],
    backend_used: str,
    execution_time: float,
) -> dict:
    mapped = map_measurements(counts_z, counts_zx, counts_x, shots)
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
                    counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time, metadata = _run_ibm_2q(alpha, shots)
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
                    counts_z, counts_zx, counts_x, backend_used, execution_time, metadata = _run_ibm(alpha, shots)
            else:
                counts_z, counts_zx, counts_x, backend_used, execution_time, metadata = _run_aer(alpha, shots)
                metadata["requested_backend"] = requested_backend

            result = _compose_result(alpha, shots, counts_z, counts_zx, counts_x, backend_used, execution_time)

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
    executor = _IBM_EXECUTOR if backend_name == "ibm" else _AER_EXECUTOR
    executor.submit(run_job_async, job_id)
    return job_id
