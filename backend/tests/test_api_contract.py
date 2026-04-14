"""
Backend API Contract Tests

Verify that the FastAPI backend returns responses with the correct shape,
types, and required fields that the frontend expects.
"""

import pytest


@pytest.mark.contract
class TestSyncExecutionResponse:
    """Verify responses for synchronous (Aer) execution"""

    def test_run_aer_returns_all_required_fields(self, client, sample_1q_params, expected_result_keys):
        """POST /run with backend=aer returns complete result"""
        response = client.post("/run", json=sample_1q_params)

        assert response.status_code == 200
        data = response.json()

        # Contract: All required fields present
        assert all(key in data for key in expected_result_keys)

    def test_run_result_types_are_correct(self, client, sample_1q_params):
        """Verify data types in result"""
        response = client.post("/run", json=sample_1q_params)
        data = response.json()

        # Contract: Numeric fields
        assert isinstance(data["alpha"], (int, float))
        assert isinstance(data["energy"], (int, float))

        # Contract: Object fields
        assert isinstance(data["observables"], dict)
        assert isinstance(data["counts"], dict)
        assert isinstance(data["probabilities"], dict)

    def test_run_observables_keys_present(self, client, sample_1q_params):
        """Verify observable keys match expected circuit"""
        response = client.post("/run", json=sample_1q_params)
        data = response.json()

        expected_obs_keys = {"Z1", "Z2", "Z1Z2", "Z1X2", "X1X2"}
        assert set(data["observables"].keys()) == expected_obs_keys
        assert set(data["noisyObservables"].keys()) == expected_obs_keys

    def test_run_counts_format_matches_shots(self, client, sample_1q_params):
        """Verify counts dict structure"""
        response = client.post("/run", json=sample_1q_params)
        data = response.json()

        # Contract: Counts keys are bitstrings
        for bitstring in data["counts"].keys():
            assert len(bitstring) >= 1
            assert all(bit in ["0", "1"] for bit in bitstring)

        # Contract: Sum of counts matches shots
        total_shots = sum(data["counts"].values())
        assert total_shots == sample_1q_params["shots"]

    def test_run_probabilities_sum_to_one(self, client, sample_1q_params):
        """Verify probabilities sum to 1.0"""
        response = client.post("/run", json=sample_1q_params)
        data = response.json()

        total_prob = sum(data["probabilities"].values())
        assert abs(total_prob - 1.0) < 1e-6

    def test_run_backend_info(self, client, sample_1q_params, expected_backend_info_keys):
        """Verify backend info has required fields"""
        response = client.post("/run", json=sample_1q_params)
        data = response.json()

        assert all(key in data["backendInfo"] for key in expected_backend_info_keys)
        assert data["backendInfo"]["type"] == "aer"
        assert data["backendInfo"]["shots"] == sample_1q_params["shots"]
        assert isinstance(data["backendInfo"]["executionTime"], (int, float))


@pytest.mark.contract
class TestAsyncJobResponse:
    """Verify responses for asynchronous (IBM) submission"""

    def test_run_ibm_returns_job_metadata(self, client):
        """POST /run with backend=ibm returns job_id and status"""
        response = client.post("/run", json={"alpha": 0.5, "shots": 1024, "backend": "ibm"})

        # IBM backend may not be configured, so check for either job or error
        if response.status_code == 200:
            assert "job_id" in response.json()
            assert "status" in response.json()
        else:
            # If IBM unavailable, should return normalized error
            assert "error" in response.json()
            assert "code" in response.json()["error"]

    def test_run_invalid_backend_returns_error(self, client):
        """POST /run with invalid backend returns error"""
        response = client.post("/run", json={"alpha": 0.5, "shots": 1024, "backend": "invalid"})

        assert response.status_code == 422
        data = response.json()
        assert "error" in data
        assert "code" in data["error"]


@pytest.mark.contract
class TestErrorEnvelope:
    """Verify error responses use normalized envelope"""

    def test_validation_error_envelope(self, client):
        """Invalid parameters return normalized error"""
        response = client.post("/run", json={"alpha": 2.0, "shots": 1024, "backend": "aer"})

        assert response.status_code in [400, 422]
        data = response.json()

        # Contract: Error envelope shape
        assert "error" in data
        assert "code" in data["error"]
        assert "message" in data["error"]
        assert "details" in data["error"]

    def test_missing_required_field_returns_error(self, client):
        """Missing required field returns error"""
        response = client.post("/run", json={"alpha": 0.5})  # missing shots and backend

        assert response.status_code in [400, 422]
        data = response.json()
        assert data["error"]["code"] is not None
        assert data["error"]["message"] is not None


@pytest.mark.contract
class TestJobPollResponse:
    """Verify job status polling responses"""

    def test_job_status_response_shape(self, client):
        """GET /job/:id returns correctly shaped response"""
        # Note: This tests the endpoint structure even if job may not exist
        response = client.get("/job/nonexistent-job-id")

        # Should return 404 but with error envelope
        if response.status_code == 404:
            data = response.json()
            assert "error" in data
            assert data["error"]["code"] == "job-not-found"


@pytest.mark.contract
class TestJobListResponse:
    """Verify job list endpoint responses"""

    def test_jobs_list_structure(self, client):
        """GET /jobs returns list with pagination"""
        response = client.get("/jobs")

        assert response.status_code == 200
        data = response.json()

        # Contract: List shape
        assert "items" in data
        assert "pagination" in data
        assert "filters" in data

        # Contract: Items is array
        assert isinstance(data["items"], list)

        # Contract: Pagination structure
        assert "returned" in data["pagination"]
        assert "total" in data["pagination"]
        assert "has_more" in data["pagination"]
        assert "next_offset" in data["pagination"]

    def test_jobs_list_filtering(self, client):
        """GET /jobs with filters includes filter echo"""
        response = client.get("/jobs?limit=5&offset=0&status=done&backend=aer")

        assert response.status_code == 200
        data = response.json()

        # Contract: Pagination echoes limit/offset
        assert data["pagination"]["limit"] == 5
        assert data["pagination"]["offset"] == 0
        assert data["filters"]["status"] == "done"
        assert data["filters"]["backend"] == "aer"


@pytest.mark.contract
class TestStatusEndpoint:
    """Verify service status endpoint"""

    def test_status_response_shape(self, client):
        """GET /status returns service status"""
        response = client.get("/status")

        assert response.status_code == 200
        data = response.json()

        # Contract: Status shape
        assert "status" in data
        assert "execution_mode" in data
        assert "backends" in data
        assert "job_system" in data

        # Contract: Backends object
        assert isinstance(data["backends"], dict)


@pytest.mark.contract
class TestBackendsEndpoint:
    """Verify backends list endpoint"""

    def test_backends_response_is_list(self, client):
        """GET /backends returns array of backend objects"""
        response = client.get("/backends")

        assert response.status_code == 200
        data = response.json()

        # Contract: Array of objects
        assert isinstance(data, list)

        # Contract: Each has required fields
        for backend in data:
            assert "name" in backend
            assert "available" in backend
            assert isinstance(backend["name"], str)
            assert isinstance(backend["available"], bool)

        # Contract: Aer should be available
        aer = next((b for b in data if b["name"] == "aer"), None)
        assert aer is not None
        assert aer["available"] is True
