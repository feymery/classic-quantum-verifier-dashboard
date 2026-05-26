from __future__ import annotations

import logging
import math
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor

from backend.qiskit.circuit_builder import build_measurement_circuit
from backend.math.energy import compute_energy as _compute_energy
from backend.qiskit.executor import run_circuits, make_qpu_backend
from backend.routers.ibm_client import get_shared_client
from backend.math.measurement_mapper import map_measurements
from backend.jobs.job_store import job_store
from backend.math.verifier import compute_energy_error, verdict, compute_lambda_min


logger = logging.getLogger(__name__)

# Separate pools so slow IBM jobs (minutes) cannot starve fast Aer jobs (seconds).
_IBM_EXECUTOR = ThreadPoolExecutor(max_workers=8, thread_name_prefix="quantum-ibm")
_AER_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="quantum-aer")


def _get_backend_for_aer(backend_requested: str) -> object:
    """Return the best available Aer backend.

    aer_qpu: AerSimulator.from_backend(qpu) when IBM credentials are active.
    aer:     always None — executor falls back to the ideal simulator.
    """
    if backend_requested != "aer_qpu":
        return None
    client = get_shared_client()
    ibm_backend = client.get_backend() if client.connect().available else None
    return make_qpu_backend(ibm_backend) if ibm_backend is not None else None

def _run_three_basis(
    alpha: float, shots: int, backend: object,
    on_submitted: Callable[[str], None] | None = None,
) -> tuple[dict[str, int], dict[str, int], dict[str, int], str, float, dict]:
    z_circuit  = build_measurement_circuit(alpha, basis="z")
    zx_circuit = build_measurement_circuit(alpha, basis="zx")
    x_circuit  = build_measurement_circuit(alpha, basis="x")
    z_res, zx_res, x_res = run_circuits(
        [z_circuit, zx_circuit, x_circuit], shots, backend, on_submitted=on_submitted,
    )
    total_ms = sum(r.metadata["execution_time_ms"] for r in (z_res, zx_res, x_res))
    backend_name: str = z_res.metadata.get("backend_name", "aer")
    meta = {
        "execution_backend": backend_name,
        "backend_name": backend_name,
        "job_id": z_res.metadata.get("job_id", ""),
    }
    return z_res.counts, zx_res.counts, x_res.counts, backend_name, total_ms, meta


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
    energy_err = compute_energy_error(alpha, mapped.observables, shots)
    energy_theory = math.sin(float(alpha)) ** 2
    lmin = compute_lambda_min(float(alpha))
    verd = verdict(energy, energy_err)

    return {
        "alpha": float(alpha),
        "observables": mapped.observables,
        "noisyObservables": mapped.observables,
        "energy": energy,
        "energy_error": energy_err,
        "energy_theory": energy_theory,
        "lambda_min": lmin,
        "verdict": verd,
        "counts": counts_z,
        "counts_zx": counts_zx,
        "counts_x": counts_x,
        "probabilities": mapped.probabilities,
        "backendInfo": {
            "type": backend_used,
            "shots": int(shots),
            "executionTime": execution_time,
        },
    }


def run_experiment_sync(alpha: float, shots: int, backend: str = "aer", sweep_id: str | None = None) -> dict:
    """Synchronous execution for aer / aer_qpu — records the run in the job store."""
    backend_requested = (backend or "aer").strip().lower()

    job_id = job_store.create_job(
        float(alpha),
        int(shots),
        backend_requested,
        {"requested_backend": backend_requested, "sweep_id": sweep_id},
    )
    job_store.update_job(job_id, status="running")

    try:
        aer_backend = _get_backend_for_aer(backend_requested)
        counts_z, counts_zx, counts_x, backend_used, execution_time, _ = _run_three_basis(
            alpha, shots, aer_backend
        )
        result = _compose_result(alpha, shots, counts_z, counts_zx, counts_x, backend_used, execution_time)
        job_store.update_job(
            job_id,
            status="done",
            result=result,
            metadata={
                "backend_name": backend_used,
                "execution_backend": backend_requested,
                "requested_backend": backend_requested,
            },
        )
        return {"job_id": job_id, **result}

    except Exception as exc:
        job_store.update_job(job_id, status="failed", error=str(exc))
        raise


def run_job_async(job_id: str) -> None:
    job = job_store.get_job(job_id)
    if job is None:
        return

    alpha = float(job["alpha"])
    shots = int(job["shots"])
    requested_backend = str(job["backend"])

    job_store.update_job(job_id, status="running")

    try:
        if requested_backend == "ibm":
            client = get_shared_client()
            availability = client.connect()
            if not availability.available:
                raise RuntimeError(availability.reason or "IBM Runtime unavailable")
            backend = client.get_backend()
        else:
            backend = _get_backend_for_aer(requested_backend)

        def _on_ibm_submitted(ibm_job_id: str) -> None:
            job_store.update_job(job_id, metadata={"ibm_job_id": ibm_job_id})

        callback = _on_ibm_submitted if requested_backend == "ibm" else None
        counts_z, counts_zx, counts_x, backend_used, execution_time, metadata = _run_three_basis(
            alpha, shots, backend, on_submitted=callback
        )
        metadata["requested_backend"] = requested_backend
        metadata["execution_backend"] = requested_backend

        result = _compose_result(alpha, shots, counts_z, counts_zx, counts_x, backend_used, execution_time)

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


def submit_job(alpha: float, shots: int, backend: str = "ibm", sweep_id: str | None = None) -> str:
    backend_name = "ibm" if (backend or "ibm").strip().lower() == "ibm" else "aer"
    job_id = job_store.create_job(
        alpha=alpha,
        shots=shots,
        backend=backend_name,
        metadata={"sweep_id": sweep_id},
    )
    executor = _IBM_EXECUTOR if backend_name == "ibm" else _AER_EXECUTOR
    executor.submit(run_job_async, job_id)
    return job_id


def try_sync_ibm_job(local_job_id: str, ibm_job_id: str, job: dict) -> None:
    """Query IBM Runtime for the real status of a stuck pending/running IBM job.

    If IBM reports completion, the result is processed and the local store is
    updated to "done".  If IBM reports failure, the store is updated to "failed".
    If IBM is still running (or we cannot connect), nothing is changed.
    """
    from backend.routers.ibm_client import get_shared_client  # noqa: PLC0415

    client = get_shared_client()
    poll = client.poll_ibm_job(ibm_job_id)
    if poll is None:
        return

    status, counts_z, counts_zx, counts_x, backend_name = poll

    if status == "done":
        alpha = float(job["alpha"])
        shots = int(job["shots"])
        requested_backend = str(job.get("backend", "ibm"))
        result = _compose_result(
            alpha, shots, counts_z, counts_zx, counts_x, backend_name, 0.0
        )
        job_store.update_job(
            local_job_id,
            status="done",
            result=result,
            metadata={
                "backend_name": backend_name,
                "execution_backend": requested_backend,
                "requested_backend": requested_backend,
                "ibm_job_id": ibm_job_id,
            },
            error=None,
        )
    elif status == "failed":
        job_store.update_job(
            local_job_id,
            status="failed",
            error="IBM job failed or was cancelled",
            metadata={"ibm_job_id": ibm_job_id},
        )
