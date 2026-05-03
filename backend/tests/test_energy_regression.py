"""
Energy Regression Tests — NaN Investigation (Step 2)

Verifies that for multiple α values, POST /run with backend=aer returns
an energy that is close to the theoretical minimum sin²(α).

Theoretical expectation for the honest clock state:
  E_ideal = sin²(α)

With finite shots there is statistical variance; we allow ±δ = 0.15.
"""

import math
import pytest


SHOTS = 4096   # High shot count → small variance
DELTA = 0.15   # Allowed deviation from sin²(α)

# α values: covers the full [0, π/2] range at representative angles
ALPHA_VALUES = [
    0.0,
    math.pi / 6,   # 30°
    math.pi / 4,   # 45°
    math.pi / 3,   # 60°
    math.pi / 2,   # 90°
]


@pytest.mark.regression
class TestEnergyPhysics:
    """Regression tests for energy calculation correctness."""

    @pytest.mark.parametrize("alpha", ALPHA_VALUES)
    def test_energy_is_not_nan(self, client, alpha):
        """Energy must never be NaN (Bug 1 guard)."""
        response = client.post("/run", json={"alpha": alpha, "shots": SHOTS, "backend": "aer"})
        assert response.status_code == 200
        energy = response.json()["energy"]
        assert isinstance(energy, (int, float)), f"energy is not numeric for α={alpha}"
        assert not math.isnan(energy), f"energy is NaN for α={alpha}"

    @pytest.mark.parametrize("alpha", ALPHA_VALUES)
    def test_energy_close_to_theoretical_minimum(self, client, alpha):
        """Energy ≈ sin²(α) within ±DELTA (Bug 2 guard — Z1/Z2 swap)."""
        response = client.post("/run", json={"alpha": alpha, "shots": SHOTS, "backend": "aer"})
        assert response.status_code == 200
        energy = response.json()["energy"]

        expected = math.sin(alpha) ** 2
        assert abs(energy - expected) < DELTA, (
            f"α={alpha:.4f}: energy={energy:.4f}, expected≈{expected:.4f}, "
            f"diff={abs(energy - expected):.4f} > δ={DELTA}"
        )

    @pytest.mark.parametrize("alpha", ALPHA_VALUES)
    def test_observables_z1_z2_physical_range(self, client, alpha):
        """Z1 (clock) and Z2 (prover) must be in [−1, 1]."""
        response = client.post("/run", json={"alpha": alpha, "shots": SHOTS, "backend": "aer"})
        assert response.status_code == 200
        obs = response.json()["observables"]

        for key in ("Z1", "Z2", "Z1Z2", "Z1X2", "X1X2"):
            val = obs[key]
            assert -1.0 <= val <= 1.0, (
                f"Observable {key}={val:.4f} out of range [−1, 1] for α={alpha:.4f}"
            )

    def test_z2_prover_near_zero_at_pi_over_4(self, client):
        """Z2 (second term in energy formula) ≈ 0 for the honest clock state.

        In the circuit convention: Z2 corresponds to ⟨Z_prover⟩ = 0.
        """
        alpha = math.pi / 4
        response = client.post("/run", json={"alpha": alpha, "shots": SHOTS, "backend": "aer"})
        assert response.status_code == 200
        obs = response.json()["observables"]

        # Z2 should be ≈ 0 (prover qubit expectation)
        assert abs(obs["Z2"]) < DELTA, (
            f"Z2 = {obs['Z2']:.4f}, expected ≈ 0"
        )

    def test_z1_clock_near_half_at_pi_over_4(self, client):
        """Z1 (first term in energy formula) ≈ cos²(π/4) = 0.5 for the honest clock state.

        In the circuit convention: Z1 corresponds to ⟨Z_clock⟩ = cos²(α).
        """
        alpha = math.pi / 4
        response = client.post("/run", json={"alpha": alpha, "shots": SHOTS, "backend": "aer"})
        assert response.status_code == 200
        obs = response.json()["observables"]

        # Z1 should be ≈ cos²(α) = 0.5 (clock qubit expectation)
        assert abs(obs["Z1"] - 0.5) < DELTA, (
            f"Z1 = {obs['Z1']:.4f}, expected ≈ 0.5"
        )
