from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Query
from pydantic import BaseModel, ConfigDict, Field

from backend.errors import raise_api_error
from backend.jobs.job_runner import run_experiment_sync, submit_job
from backend.jobs.job_store import job_store

router = APIRouter()


def _verifier_decision(energy: float) -> str:
    """Classify an energy value using the same thresholds as the frontend.

    Returns 'accept', 'boundary', or 'reject' — matching VerifierDecision
    in src/physics/energy.ts.
    """
    if energy < 0.4:
        return "accept"
    if energy >= 0.5:
        return "reject"
    return "boundary"


class RunRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    alpha: float = Field(..., ge=0.0, le=1.5707963267948966)
    shots: int = Field(..., ge=1, le=1_000_000)
    backend: Literal["aer", "aer_qpu", "ibm"] = "aer"
    sweep_id: str | None = None


@router.post("/run")
def run_endpoint(payload: RunRequest) -> dict:
    backend = payload.backend
    if backend == "ibm":
        job_id = submit_job(
            alpha=payload.alpha,
            shots=payload.shots,
            backend="ibm",
            sweep_id=payload.sweep_id,
        )
        return {"job_id": job_id, "status": "queued"}

    return run_experiment_sync(
        alpha=payload.alpha,
        shots=payload.shots,
        backend=payload.backend,
        sweep_id=payload.sweep_id,
    )


@router.get("/job/{job_id}")
def get_job(job_id: str) -> dict:
    job = job_store.get_job(job_id)
    if job is None:
        raise_api_error(
            status_code=404,
            code="job-not-found",
            message="Requested job does not exist.",
            details={"job_id": job_id},
        )

    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "result": job.get("result"),
        "backend": job["backend"],
        "metadata": {
            "created_at": job["created_at"],
            "updated_at": job["updated_at"],
            "error": job.get("error"),
            **(job.get("metadata") or {}),
        },
    }


@router.get("/jobs")
def list_jobs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: Literal["pending", "running", "done", "failed"] | None = Query(default=None),
    backend: Literal["aer", "ibm"] | None = Query(default=None),
) -> dict:
    jobs, total = job_store.list_jobs(
        limit=limit,
        offset=offset,
        status=status,
        backend=backend,
    )

    def _enrich(j: dict) -> dict:
        result = j.get("result") or {}
        meta = j.get("metadata") or {}
        raw_energy: float | None = result.get("energy") if isinstance(result.get("energy"), (int, float)) else None
        return {
            "job_id": j["job_id"],
            "status": j["status"],
            "backend": j["backend"],
            "alpha": j["alpha"],
            "shots": j["shots"],
            "created_at": j["created_at"],
            "updated_at": j["updated_at"],
            "energy_estimate": raw_energy,
            "decision": _verifier_decision(raw_energy) if raw_energy is not None else None,
            "resolved_backend": meta.get("backend_name"),
            "execution_source": meta.get("execution_backend"),
            "sweep_id": meta.get("sweep_id"),
            "error": j.get("error"),
        }

    items = [_enrich(j) for j in jobs]

    next_offset = offset + len(items)
    return {
        "items": items,
        "pagination": {
            "limit": limit,
            "offset": offset,
            "returned": len(items),
            "total": total,
            "has_more": next_offset < total,
            "next_offset": next_offset if next_offset < total else None,
        },
        "filters": {
            "status": status,
            "backend": backend,
        },
    }


@router.delete("/jobs")
def delete_jobs() -> dict:
    """Delete all job records (user-triggered history clear).

    Returns the number of deleted rows.
    """
    deleted = job_store.delete_all_jobs()
    return {"deleted": deleted}
