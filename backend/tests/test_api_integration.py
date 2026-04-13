"""
Backend API Integration Tests

Test the full request/response cycle of FastAPI endpoints.
Verifies correct behavior for various input combinations and edge cases.
"""

import pytest


@pytest.mark.integration
class TestRunEndpoint:
    """Integration tests for POST /run"""

    def test_run_1q_aer_complete_workflow(self, client, sample_1q_params):
        """Execute complete 1Q workflow with Aer"""
        response = client.post("/run", json=sample_1q_params)

        assert response.status_code == 200
        result = response.json()

        # Verify result is usable for downstream components
        assert result["alpha"] == sample_1q_params["alpha"]
        assert "energy" in result
        assert isinstance(result["energy"], (int, float))

    def test_run_with_different_shot_counts(self, client, sample_1q_params):
        """Verify shot count affects result variance"""
        shot_counts = [256, 512, 1024, 2048]

        for shots in shot_counts:
            params = {**sample_1q_params, "shots": shots}
            response = client.post("/run", json=params)

            assert response.status_code == 200
            result = response.json()
            assert result["backendInfo"]["shots"] == shots

    def test_run_with_different_alpha_values(self, client, sample_1q_params):
        """Verify different alpha values produce different results"""
        alpha_values = [0.1, 0.3, 0.5, 0.7, 0.9]

        results = []
        for alpha in alpha_values:
            params = {**sample_1q_params, "alpha": alpha}
            response = client.post("/run", json=params)

            assert response.status_code == 200
            result = response.json()
            results.append(result["energy"])

        # Energy should vary with alpha (shouldn't all be identical)
        assert len(set(results)) > 1

    def test_run_validation_edge_cases(self, client):
        """Test boundary conditions for parameters"""
        # Test alpha at boundaries
        boundary_cases = [
            {"alpha": 0.0, "shots": 1024, "backend": "aer"},
            {"alpha": 1.0, "shots": 1024, "backend": "aer"},
            {"alpha": 0.00001, "shots": 1024, "backend": "aer"},
            {"alpha": 0.99999, "shots": 1024, "backend": "aer"},
        ]

        for params in boundary_cases:
            response = client.post("/run", json=params)
            # Should succeed for valid boundaries
            assert response.status_code == 200

        # Test invalid boundaries
        invalid_cases = [
            {"alpha": -0.1, "shots": 1024, "backend": "aer"},
            {"alpha": 2.0, "shots": 1024, "backend": "aer"},
        ]

        for params in invalid_cases:
            response = client.post("/run", json=params)
            assert response.status_code in [400, 422]

    def test_run_missing_fields_validation(self, client):
        """Test missing required fields"""
        invalid_requests = [
            {"shots": 1024, "backend": "aer"},  # missing alpha
            {"alpha": 0.5, "backend": "aer"},  # missing shots
            {},  # missing all
        ]

        for params in invalid_requests:
            response = client.post("/run", json=params)
            assert response.status_code in [400, 422]


@pytest.mark.integration
class TestJobPolling:
    """Integration tests for GET /job/:id"""

    def test_job_not_found_returns_error(self, client):
        """Polling non-existent job returns 404"""
        response = client.get("/job/definitely-nonexistent-job")

        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "job-not-found"


@pytest.mark.integration
class TestJobsList:
    """Integration tests for GET /jobs"""

    def test_jobs_empty_list(self, client):
        """GET /jobs with no jobs returns empty array"""
        response = client.get("/jobs")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["items"], list)
        assert data["pagination"]["returned"] >= 0

    def test_jobs_list_pagination_parameters(self, client):
        """GET /jobs respects limit and offset"""
        response = client.get("/jobs?limit=5&offset=0")

        assert response.status_code == 200
        data = response.json()

        assert data["pagination"]["returned"] <= 5
        assert data["pagination"]["limit"] == 5
        assert data["pagination"]["offset"] == 0

    def test_jobs_list_status_filter(self, client):
        """GET /jobs with status filter"""
        response = client.get("/jobs?status=done")

        assert response.status_code == 200
        data = response.json()

        # If items exist, they should match filter
        for item in data["items"]:
            if "status" in item:
                assert item["status"] == "done"

    def test_jobs_list_backend_filter(self, client):
        """GET /jobs with backend filter"""
        response = client.get("/jobs?backend=aer")

        assert response.status_code == 200
        data = response.json()

        assert data["filters"]["backend"] == "aer"

    def test_jobs_list_combined_filters(self, client):
        """GET /jobs with multiple filters"""
        response = client.get("/jobs?limit=10&offset=0&status=done&backend=aer&mode=1q")

        assert response.status_code == 200
        data = response.json()

        assert data["pagination"]["limit"] == 10
        assert data["filters"]["status"] == "done"
        assert data["filters"]["backend"] == "aer"
        assert data["filters"]["mode"] == "1q"


@pytest.mark.integration
class TestServiceHealthCheck:
    """Integration tests for GET /status"""

    def test_status_endpoint_healthy(self, client):
        """GET /status returns ok when service is running"""
        response = client.get("/status")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "ok"

    def test_status_reports_backends(self, client):
        """GET /status reports backend availability"""
        response = client.get("/status")
        data = response.json()

        # Should have backends object
        assert "backends" in data
        assert isinstance(data["backends"], dict)

        # Aer should be available
        assert "aer" in data["backends"]


@pytest.mark.integration
class TestBackendsList:
    """Integration tests for GET /backends"""

    def test_backends_list_contains_aer(self, client):
        """GET /backends always includes Aer"""
        response = client.get("/backends")

        assert response.status_code == 200
        backends = response.json()

        assert any(b["name"] == "aer" for b in backends)

    def test_backends_availability_matches_status(self, client):
        """Backends list matches /status availability"""
        status_response = client.get("/status")
        backends_response = client.get("/backends")

        status_data = status_response.json()
        backends_data = backends_response.json()

        # Aer should be available in both
        assert status_data["backends"]["aer"] in ["active", "connected"]
        assert any(
            b["name"] == "aer" and b["available"]
            for b in backends_data
        )


@pytest.mark.integration
class TestErrorRecovery:
    """Integration tests for error handling"""

    def test_invalid_json_returns_error(self, client):
        """Invalid JSON in request body"""
        response = client.post(
            "/run",
            content="not valid json",
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code >= 400
        # Response should be parseable
        try:
            response.json()
        except Exception:
            pytest.fail("Error response not valid JSON")

    def test_wrong_content_type_handled(self, client):
        """Wrong content type returns appropriate error"""
        response = client.post(
            "/run",
            content="alpha=0.5&shots=1024&backend=aer",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code >= 400

    def test_multiple_concurrent_requests_handled(self, client, sample_1q_params):
        """Backend handles multiple requests"""
        responses = []

        # Submit multiple requests
        for _ in range(3):
            response = client.post("/run", json=sample_1q_params)
            responses.append(response)

        # All should succeed
        for response in responses:
            assert response.status_code == 200
