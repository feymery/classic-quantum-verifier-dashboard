from __future__ import annotations

import logging
import math

from backend.qiskit.circuit_builder import build_measurement_circuit
from backend.energy import compute_energy as _compute_energy
from backend.qiskit.executor import make_depolarizing_backend, make_qpu_backend, run_circuit, run_circuits
from backend.qiskit.ibm.ibm_client import get_shared_client
from backend.jobs.job_runner import submit_job
from backend.jobs.job_store import job_store as _job_store
from backend.qiskit.measurement_mapper import map_measurements, extract_x1z2
from backend.verifier import compute_energy_error, verdict, compute_lambda_min


logger = logging.getLogger(__name__)


def _get_backend_for_aer() -> object:
    """Return the best available Aer backend.

    When IBM credentials are active, use AerSimulator.from_backend(qpu)
    so the simulation reflects the real device's noise model.
    Falls back to the generic ideal simulator otherwise.
    """
    client = get_shared_client()
    ibm_backend = client.get_backend() if client.connect().available else None
    if ibm_backend is not None:
        return make_qpu_backend(ibm_backend)
    return None  # executor.run_circuits will use _IDEAL_SIMULATOR


def _run_circuits_three_basis(
    alpha: float, shots: int, backend: object
) -> tuple[dict[str, int], dict[str, int], dict[str, int], str, float]:
    """Build and execute the three measurement-basis circuits on the given backend."""
    z_circuit  = build_measurement_circuit(alpha, basis="z")
    zx_circuit = build_measurement_circuit(alpha, basis="zx")
    x_circuit  = build_measurement_circuit(alpha, basis="x")
    z_res, zx_res, x_res = run_circuits([z_circuit, zx_circuit, x_circuit], shots, backend)
    total_ms = sum(r.metadata["execution_time_ms"] for r in (z_res, zx_res, x_res))
    backend_name: str = z_res.metadata.get("backend_name", "aer")
    return z_res.counts, zx_res.counts, x_res.counts, backend_name, total_ms


def runExperimentSync(alpha: float, shots: int, backend: str = "aer") -> dict:
    """Synchronous execution path — persists the run to the job store for history."""
    backend_requested = (backend or "aer").strip().lower()

    job_id = _job_store.create_job(
        float(alpha),
        int(shots),
        "aer",
        {"requested_backend": backend_requested},
    )
    _job_store.update_job(job_id, status="running")

    try:
        if backend_requested == "aer_qpu":
            client = get_shared_client()
            if not client.connect().available:
                raise RuntimeError(client.connect().reason or "IBM credentials required for aer_qpu")
            ibm_backend = client.get_backend()
            qpu_backend = make_qpu_backend(ibm_backend)
            counts_z, counts_zx, counts_x, backend_used, execution_time = _run_circuits_three_basis(
                alpha, shots, qpu_backend
            )
        else:
            aer_backend = _get_backend_for_aer()
            counts_z, counts_zx, counts_x, backend_used, execution_time = _run_circuits_three_basis(
                alpha, shots, aer_backend
            )

        mapped = map_measurements(counts_z, counts_zx, counts_x, shots)
        energy = _compute_energy(alpha, mapped.observables)
        energy_err = compute_energy_error(alpha, mapped.observables, shots)
        verd = verdict(energy, energy_err)
        energy_theory = math.sin(float(alpha)) ** 2
        lmin = compute_lambda_min(float(alpha))

        result_payload = {
            "alpha": float(alpha),
            "observables": mapped.observables,
            "noisyObservables": mapped.observables,
            "energy": energy,
            "energy_error": energy_err,
            "energy_theory": energy_theory,
            "lambda_min": lmin,
            "verdict": verd,
            "counts": counts_z,
            "probabilities": mapped.probabilities,
            "backendInfo": {
                "type": backend_used,
                "shots": int(shots),
                "executionTime": execution_time,
            },
        }

        _job_store.update_job(
            job_id,
            status="done",
            result=result_payload,
            metadata={
                "backend_name": backend_used,
                "execution_backend": backend_used,
                "requested_backend": backend_requested,
            },
        )

        return {"job_id": job_id, **result_payload}

    except Exception as exc:
        _job_store.update_job(job_id, status="failed", error=str(exc))
        raise


def submitExperimentJob(
    alpha: float,
    shots: int,
    backend: str = "ibm",
) -> dict:
    """Submit asynchronous experiment job and return queue metadata."""
    job_id = submit_job(alpha, shots, backend)
    return {
        "job_id": job_id,
        "status": "queued",
    }

