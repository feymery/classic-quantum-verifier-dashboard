from __future__ import annotations

from typing import Literal

from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from backend.executor import runExperiment, submitExperimentJob, sweep_alpha, sweep_shots, sweep_noise, run_adversarial_circuit
from backend.ibm_client import IBMClient
from backend.jobs.job_store import job_store


app = FastAPI(title="Quantum Simulation Backend", version="1.0.0")


def _json_safe(value: object) -> object:
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    return value


class ApiError(BaseModel):
    code: str
    message: str
    details: dict | list | str | None = None


class ApiErrorResponse(BaseModel):
    error: ApiError


def error_payload(code: str, message: str, details: dict | list | str | None = None) -> dict:
    return ApiErrorResponse(
        error=ApiError(code=code, message=message, details=details)
    ).model_dump()


def raise_api_error(
    status_code: int,
    code: str,
    message: str,
    details: dict | list | str | None = None,
) -> None:
    raise HTTPException(
        status_code=status_code,
        detail=error_payload(code=code, message=message, details=details),
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    safe_details = _json_safe(exc.errors())
    return JSONResponse(
        status_code=422,
        content=error_payload(
            code="validation-error",
            message="Request validation failed.",
            details=safe_details,
        ),
    )


@app.exception_handler(HTTPException)
async def handle_http_error(_request: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)

    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload(
            code="http-error",
            message=str(exc.detail),
        ),
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error_payload(
            code="internal-error",
            message="Unexpected server error.",
        ),
    )


class SweepAlphaRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    shots: int = Field(default=1024, ge=1, le=1_000_000)
    n_points: int = Field(default=30, ge=2, le=100)
    backend: Literal["aer"] = "aer"


class SweepShotsRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    alpha: float = Field(..., ge=0.0, le=1.5707963267948966)
    shots_list: list[int] = Field(
        default_factory=lambda: [64, 128, 256, 512, 1024, 2048, 4096, 8192]
    )
    backend: Literal["aer"] = "aer"


@app.post("/sweep/alpha")
def sweep_alpha_endpoint(payload: SweepAlphaRequest) -> dict:
    """Run n_points experiments at evenly spaced α ∈ [0, π/2].

    Reproduces Figure 2(b) of Stricker et al.: E_est ± σ_E vs α.
    """
    points = sweep_alpha(
        shots=payload.shots,
        n_points=payload.n_points,
        backend=payload.backend,
    )
    return {
        "points": points,
        "shots": payload.shots,
        "n_points": payload.n_points,
    }


@app.post("/sweep/shots")
def sweep_shots_endpoint(payload: SweepShotsRequest) -> dict:
    """Run the same α at increasing shot counts to show convergence."""
    points = sweep_shots(
        alpha=payload.alpha,
        shots_list=payload.shots_list,
        backend=payload.backend,
    )
    return {
        "points": points,
        "alpha": payload.alpha,
    }


class SweepNoiseRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    alpha: float = Field(..., ge=0.0, le=1.5707963267948966)
    shots: int = Field(default=1024, ge=1, le=1_000_000)
    lambda_list: list[float] = Field(
        default_factory=lambda: [0.0, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
    )


@app.post("/sweep/noise")
def sweep_noise_endpoint(payload: SweepNoiseRequest) -> dict:
    """Sweep depolarizing noise λ at fixed α using AerSimulator + NoiseModel.

    Reproduces the noise-degradation curve: E_est rises as λ increases,
    eventually crossing the acceptance threshold and reaching 0.5 (maximally
    mixed). This implements the real Qiskit NoiseModel path (Phase 3).
    """
    points = sweep_noise(
        alpha=payload.alpha,
        shots=payload.shots,
        lambda_list=payload.lambda_list,
    )
    return {
        "points": points,
        "alpha": payload.alpha,
        "shots": payload.shots,
    }


class AdversarialCircuitRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    alpha: float = Field(..., ge=0.0, le=1.5707963267948966)
    alpha_fake: float = Field(..., ge=0.0, le=1.5707963267948966)
    shots: int = Field(default=1024, ge=1, le=1_000_000)


@app.post("/adversarial/circuit")
def adversarial_circuit_endpoint(payload: AdversarialCircuitRequest) -> dict:
    """Run honest (α) and adversarial (α_fake) circuits and compare distributions.

    Returns per-bitstring counts + probabilities for both circuits,
    plus summary metrics: TVD, KL divergence, and energy delta (Phase 3).
    """
    return run_adversarial_circuit(
        alpha=payload.alpha,
        alpha_fake=payload.alpha_fake,
        shots=payload.shots,
    )


class RunRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    alpha: float = Field(..., ge=0.0, le=1.5707963267948966)
    shots: int = Field(..., ge=1, le=1_000_000)
    backend: Literal["aer", "ibm"] = "aer"
    mode: Literal["1q", "2q"] = "1q"


@app.get("/status")
def get_status() -> dict:
    ibm_state = "connected" if IBMClient().connect().available else "disconnected"
    return {
        "status": "ok",
        "execution_mode": "sync + async",
        "backends": {
            "aer": "active",
            "ibm": ibm_state,
        },
        "job_system": "active",
    }


@app.get("/backends")
def get_backends() -> list[dict]:
    ibm_available = IBMClient().connect().available
    return [
        {"name": "aer", "available": True},
        {"name": "ibm", "available": ibm_available},
    ]


@app.post("/run")
def run_endpoint(payload: RunRequest) -> dict:
    backend = payload.backend
    if backend == "ibm":
        return submitExperimentJob(
            alpha=payload.alpha,
            shots=payload.shots,
            backend="ibm",
            mode=payload.mode,
        )

    return runExperiment(
        alpha=payload.alpha,
        shots=payload.shots,
        backend="aer",
        mode=payload.mode,
    )


@app.get("/job/{job_id}")
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


@app.get("/jobs")
def list_jobs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: Literal["pending", "running", "done", "failed"] | None = Query(default=None),
    backend: Literal["aer", "ibm"] | None = Query(default=None),
    mode: Literal["1q", "2q"] | None = Query(default=None),
) -> dict:
    jobs, total = job_store.list_jobs(
        limit=limit,
        offset=offset,
        status=status,
        backend=backend,
        mode=mode,
    )

    items = [
        {
            "job_id": j["job_id"],
            "status": j["status"],
            "backend": j["backend"],
            "mode": (j.get("metadata") or {}).get("mode", "1q"),
            "alpha": j["alpha"],
            "shots": j["shots"],
            "created_at": j["created_at"],
            "updated_at": j["updated_at"],
        }
        for j in jobs
    ]

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
            "mode": mode,
        },
    }