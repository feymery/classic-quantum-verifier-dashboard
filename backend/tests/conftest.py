import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend module to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from backend.main import app

@pytest.fixture
def client():
    """Provides FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def sample_1q_params():
    """Standard 1Q experiment parameters"""
    return {
        "alpha": 0.5,
        "shots": 1024,
        "backend": "aer",
    }


@pytest.fixture
def sample_2q_params():
    """Standard 2Q experiment parameters"""
    return {
        "alpha": 0.45,
        "shots": 2048,
        "backend": "aer",
    }


@pytest.fixture
def expected_result_keys():
    """Expected keys in sync execution result"""
    return {
        "alpha",
        "observables",
        "noisyObservables",
        "energy",
        "counts",
        "probabilities",
        "backendInfo",
    }


@pytest.fixture
def expected_backend_info_keys():
    """Expected keys in backend info metadata"""
    return {"type", "shots", "executionTime"}


@pytest.fixture
def expected_job_keys():
    """Expected keys in job submission response"""
    return {"job_id", "status"}


@pytest.fixture
def expected_job_status_keys():
    """Expected keys in job status response"""
    return {"job_id", "status", "result", "backend", "metadata"}


@pytest.fixture
def expected_error_keys():
    """Expected keys in error response"""
    return {"error"}


@pytest.fixture
def expected_error_envelope_keys():
    """Expected keys in error envelope"""
    return {"code", "message", "details"}
