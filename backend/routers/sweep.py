from __future__ import annotations

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from backend.math.sweeps import sweep_alpha, sweep_shots, sweep_noise

router = APIRouter()


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


class SweepNoiseRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    alpha: float = Field(..., ge=0.0, le=1.5707963267948966)
    shots: int = Field(default=1024, ge=1, le=1_000_000)
    lambda_list: list[float] = Field(
        default_factory=lambda: [0.0, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
    )


@router.post("/sweep/alpha")
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


@router.post("/sweep/shots")
def sweep_shots_endpoint(payload: SweepShotsRequest) -> dict:
    """Run the same α at increasing shot counts to show convergence."""
    points = sweep_shots(
        alpha=payload.alpha,
        shots_list=payload.shots_list,
    )
    return {
        "points": points,
        "alpha": payload.alpha,
    }


@router.post("/sweep/noise")
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
