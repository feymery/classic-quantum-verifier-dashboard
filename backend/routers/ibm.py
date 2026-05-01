from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from backend.routers.ibm_client import configure_runtime, get_shared_client

router = APIRouter()


class ConfigureIbmRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    token: str = Field(..., min_length=1)
    instance: str = Field(default="")
    backend_name: str = Field(default="")
    verify: bool = Field(default=False)


@router.post("/configure/ibm")
def configure_ibm(payload: ConfigureIbmRequest) -> dict:
    """Store IBM Quantum credentials for the lifetime of this server process.

    The ``instance`` is an IBM Cloud CRN in the format:
    ``crn:v1:bluemix:public:quantum-computing:<region>:a/<account_id>:<service_id>::``.
    The ``backend_name`` is the QPU name (e.g. ``ibm_strasbourg``).
    All values are held only in memory — they are never logged or persisted.
    """
    configure_runtime(token=payload.token, instance=payload.instance, backend_name=payload.backend_name)
    # Only connect when the user explicitly requests verification (verify=True).
    # Callers that restore saved credentials on startup should pass verify=False
    # to avoid an IBM network call without explicit user action.
    if payload.verify:
        availability = get_shared_client().connect()
        connected = availability.available
        reason = availability.reason
    else:
        connected = False
        reason = "Credentials stored. Send verify=true to test the connection."
    return {
        "configured": True,
        "connected": connected,
        "reason": reason,
    }


@router.get("/status")
def get_status() -> dict:
    # Read cached availability — no new IBM network call on every poll.
    ibm_state = "connected" if get_shared_client().availability.available else "disconnected"
    return {
        "status": "ok",
        "execution_mode": "sync + async",
        "backends": {
            "aer": "active",
            "aer_qpu": ibm_state,
            "ibm": ibm_state,
        },
        "job_system": "active",
    }


@router.get("/backends")
def get_backends() -> list[dict]:
    # Read cached availability — no new IBM network call on every poll.
    ibm_available = get_shared_client().availability.available
    return [
        {"name": "aer", "available": True},
        {"name": "aer_qpu", "available": ibm_available},
        {"name": "ibm", "available": ibm_available},
    ]
