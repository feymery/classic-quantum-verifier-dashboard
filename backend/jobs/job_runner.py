from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor

from backend.qiskit.circuit_builder import build_measurement_circuit
from backend.energy import compute_energy as _compute_energy
from backend.qiskit.executor import run_circuits, make_qpu_backend
from backend.qiskit.ibm.ibm_client import get_shared_client
from backend.qiskit.measurement_mapper import map_measurements
from backend.jobs.job_store import job_store


logger = logging.getLogger(__name__)

# Separate pools so slow IBM jobs (minutes) cannot starve fast Aer jobs (seconds).
_IBM_EXECUTOR = ThreadPoolExecutor(max_workers=8, thread_name_prefix="quantum-ibm")
_AER_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="quantum-aer")


def _run_three_basis(
    alpha: float, shots: int, backend: object
) -> tuple[dict[str, int], dict[str, int], dict[str, int], str, float, dict]:
    z_circuit  = build_measurement_circuit(alpha, basis="z")
    zx_circuit = build_measurement_circuit(alpha, basis="zx")
    x_circuit  = build_measurement_circuit(alpha, basis="x")
    z_res, zx_res, x_res = run_circuits([z_circuit, zx_circuit, x_circuit], shots, backend)
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

    job_store.update_job(job_id, status="running")

    try:
        if requested_backend == "ibm":
            client = get_shared_client()
            if not client.connect().available:
                raise RuntimeError(client.connect().reason or "IBM Runtime unavailable")
            backend = client.get_backend()
        else:
            # Use QPU-calibrated Aer when credentials available, ideal otherwise
            client = get_shared_client()
            ibm_backend = client.get_backend() if client.connect().available else None
            backend = make_qpu_backend(ibm_backend) if ibm_backend is not None else None

        counts_z, counts_zx, counts_x, backend_used, execution_time, metadata = _run_three_basis(
            alpha, shots, backend
        )
        metadata["requested_backend"] = requested_backend

        result = _compose_result(alpha, shots, counts_z, counts_zx, counts_x, backend_used, execution_time)

        metadata["mode"] = "1q"
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
    job_id = job_store.create_job(
        alpha=alpha,
        shots=shots,
        backend=backend_name,
        metadata={"mode": "1q"},
    )
    executor = _IBM_EXECUTOR if backend_name == "ibm" else _AER_EXECUTOR
    executor.submit(run_job_async, job_id)
    return job_id
