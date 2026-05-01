from __future__ import annotations

import math


def compute_energy(alpha: float, observables: dict[str, float]) -> float:
    """Full 5-term Hamiltonian energy estimator (Stricker et al. 2024, Eq. C.1).

    E = 3.5 - 2·Z1 + Z2 - Z1Z2 - 1.5·cos(α)·Z1X2 - 1.5·sin(α)·X1X2

    Theoretical minimum is sin²(α) (achieved by the honest clock state).
    """
    ca = math.cos(alpha)
    sa = math.sin(alpha)
    return (
        3.5
        - 2.0 * observables["Z1"]
        + observables["Z2"]
        - observables["Z1Z2"]
        - 1.5 * ca * observables["Z1X2"]
        - 1.5 * sa * observables["X1X2"]
    )
