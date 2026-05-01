from __future__ import annotations

import math

import numpy as np


def compute_energy_error(alpha: float, observables: dict[str, float], shots: int) -> float:
    """Propagated σ_E using shot-noise variance on each observable.

    For a ±1 observable O estimated from N shots:
        σ_O² = (1 - ⟨O⟩²) / N

    Coefficients from the Hamiltonian:
        c_Z1   = -2.0
        c_Z2   =  1.0
        c_Z1Z2 = -1.0
        c_Z1X2 = -1.5·cos(α)
        c_X1X2 = -1.5·sin(α)

    σ_E = sqrt(Σ c_i² · σ_Oi²)
    """
    ca = math.cos(alpha)
    sa = math.sin(alpha)
    safe_shots = max(1, int(shots))

    coeffs = {
        "Z1":   -2.0,
        "Z2":    1.0,
        "Z1Z2": -1.0,
        "Z1X2": -1.5 * ca,
        "X1X2": -1.5 * sa,
    }

    variance_sum = 0.0
    for obs_name, coeff in coeffs.items():
        val = observables.get(obs_name, 0.0)
        obs_var = max(0.0, 1.0 - val * val) / safe_shots
        variance_sum += coeff * coeff * obs_var

    return math.sqrt(max(0.0, variance_sum))


def verdict(energy: float, energy_error: float) -> str:
    """Verifier verdict per Stricker et al. (Eq. D.7).

    E + σ_E < 0.4  → "accept"   (honest quantum prover)
    E - σ_E ≥ 0.5  → "reject"
    otherwise       → "marginal"
    """
    if energy + energy_error < 0.4:
        return "accept"
    if energy - energy_error >= 0.5:
        return "reject"
    return "marginal"


def compute_lambda_min(alpha: float) -> float:
    """Compute the minimum eigenvalue of H(α) numerically (Stricker et al. Eq. C.1).

    H = 3.5·I⊗I − 2·Z⊗I + I⊗Z − Z⊗Z − 1.5cos(α)·Z⊗X − 1.5sin(α)·X⊗X

    Qubit ordering: first factor = q_prover (index 0), second = q_clock (index 1).
    For the honest clock state ⟨η|H|η⟩ = sin²(α), which is also λ_min.
    """
    ca = math.cos(alpha)
    sa = math.sin(alpha)

    I2 = np.eye(2)
    X = np.array([[0.0, 1.0], [1.0, 0.0]])
    Z = np.array([[1.0, 0.0], [0.0, -1.0]])

    H = (
        3.5 * np.kron(I2, I2)
        - 2.0 * np.kron(Z, I2)
        + np.kron(I2, Z)
        - np.kron(Z, Z)
        - 1.5 * ca * np.kron(Z, X)
        - 1.5 * sa * np.kron(X, X)
    )
    return float(np.linalg.eigvalsh(H).min())
