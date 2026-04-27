from __future__ import annotations

import logging

from backend import aer_executor, ibm_executor
from backend.circuit_builder import build_measurement_circuit, build_measurement_circuit_2q
from backend.energy import compute_energy as _compute_energy
from backend.ibm_client import IBMClient, get_shared_client
from backend.jobs.job_runner import submit_job
from backend.measurement_mapper import map_measurements, map_measurements_2q, extract_x1z2


logger = logging.getLogger(__name__)


def _compute_energy_error(alpha: float, observables: dict[str, float], shots: int) -> float:
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
    import math

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


def _verdict(energy: float, energy_error: float) -> str:
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


def _compute_lambda_min(alpha: float) -> float:
    """Compute the minimum eigenvalue of H(α) numerically (Stricker et al. Eq. C.1).

    H = 3.5·I⊗I − 2·Z⊗I + I⊗Z − Z⊗Z − 1.5cos(α)·Z⊗X − 1.5sin(α)·X⊗X

    Qubit ordering: first factor = q_prover (index 0), second = q_clock (index 1).
    For the honest clock state ⟨η|H|η⟩ = sin²(α), which is also λ_min.
    """
    import math
    import numpy as np

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


def sweep_alpha(shots: int, n_points: int = 30, backend: str = "aer") -> list[dict]:
    """Run n_points experiments at evenly spaced α ∈ [0, π/2].

    Each point returns alpha, energy_est, energy_error, energy_theory,
    lambda_min, verdict — reproducing Figure 2(b) — plus observables and
    observables_theory for all 6 operators to reproduce Figure 2(a).
    """
    import math

    results = []
    for i in range(n_points):
        alpha = (i / max(1, n_points - 1)) * (math.pi / 2)
        ca = math.cos(alpha)
        sa = math.sin(alpha)
        energy_theory = sa ** 2
        obs_theory = {
            "Z1":   0.0,
            "Z2":   round(ca ** 2, 6),
            "Z1Z2": round(sa ** 2, 6),
            "Z1X2": round(-sa * ca, 6),
            "X1Z2": round(ca, 6),
            "X1X2": round(sa, 6),
        }
        try:
            counts_z, counts_zx, counts_x, _backend_used, _exec_time = _run_with_aer(alpha, shots)
            # Extra X1Z2 circuit (k1,k2)=(1,0) — shown in Figure 2(a) of the paper
            x1z2_circuit = build_measurement_circuit(alpha, basis="x1z2")
            x1z2_result = aer_executor.run_circuit(x1z2_circuit, shots)
            x1z2_val = extract_x1z2(x1z2_result.counts, shots)

            mapped = map_measurements(counts_z, counts_zx, counts_x, shots)
            energy = _compute_energy(alpha, mapped.observables)
            energy_error = _compute_energy_error(alpha, mapped.observables, shots)
            verdict = _verdict(energy, energy_error)
            lambda_min = _compute_lambda_min(alpha)
            obs_measured = {k: round(v, 6) for k, v in mapped.observables.items()}
            obs_measured["X1Z2"] = round(x1z2_val, 6)
        except Exception as exc:
            logger.warning("sweep_alpha failed at alpha=%.4f: %s", alpha, exc)
            energy = 0.0
            energy_error = 0.0
            lambda_min = energy_theory
            verdict = "marginal"
            obs_measured = {k: round(v, 6) for k, v in obs_theory.items()}

        results.append({
            "alpha": round(alpha, 6),
            "energy_est": round(energy, 6),
            "energy_error": round(energy_error, 6),
            "energy_theory": round(energy_theory, 6),
            "lambda_min": round(lambda_min, 6),
            "verdict": verdict,
            "observables": obs_measured,
            "observables_theory": obs_theory,
        })
    return results


def sweep_shots(
    alpha: float,
    shots_list: list[int] | None = None,
    backend: str = "aer",
) -> list[dict]:
    """Run the same α at increasing shot counts to show convergence.

    Each point returns shots, energy_est, energy_error, verdict.
    """
    import math

    if shots_list is None:
        shots_list = [64, 128, 256, 512, 1024, 2048, 4096, 8192]

    energy_theory = math.sin(alpha) ** 2
    results = []
    for shots in shots_list:
        try:
            counts_z, counts_zx, counts_x, _backend_used, _exec_time = _run_with_aer(alpha, shots)
            mapped = map_measurements(counts_z, counts_zx, counts_x, shots)
            energy = _compute_energy(alpha, mapped.observables)
            energy_error = _compute_energy_error(alpha, mapped.observables, shots)
            verdict = _verdict(energy, energy_error)
        except Exception as exc:
            logger.warning("sweep_shots failed at shots=%d: %s", shots, exc)
            energy = energy_theory
            energy_error = 0.0
            verdict = "marginal"

        results.append({
            "shots": shots,
            "energy_est": round(energy, 6),
            "energy_error": round(energy_error, 6),
            "energy_theory": round(energy_theory, 6),
            "verdict": verdict,
        })
    return results


def sweep_noise(
    alpha: float,
    shots: int = 1024,
    lambda_list: list[float] | None = None,
) -> list[dict]:
    """Run the same α at increasing depolarizing noise levels using real AerSimulator + NoiseModel.

    Each point returns lambda, energy_est, energy_error, energy_theory,
    lambda_min, and verdict — showing how noise degrades the verifier signal.
    This directly models the depolarizing channel studied in the paper.
    """
    import math

    if lambda_list is None:
        lambda_list = [0.0, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]

    energy_theory = math.sin(alpha) ** 2
    lambda_min = _compute_lambda_min(alpha)
    results = []

    for noise_p in lambda_list:
        try:
            z_circuit  = build_measurement_circuit(alpha, basis="z")
            zx_circuit = build_measurement_circuit(alpha, basis="zx")
            x_circuit  = build_measurement_circuit(alpha, basis="x")

            z_res  = aer_executor.run_circuit_noisy(z_circuit,  shots, noise_p)
            zx_res = aer_executor.run_circuit_noisy(zx_circuit, shots, noise_p)
            x_res  = aer_executor.run_circuit_noisy(x_circuit,  shots, noise_p)

            mapped = map_measurements(z_res.counts, zx_res.counts, x_res.counts, shots)
            energy = _compute_energy(alpha, mapped.observables)
            energy_error = _compute_energy_error(alpha, mapped.observables, shots)
            verdict = _verdict(energy, energy_error)
        except Exception as exc:
            logger.warning("sweep_noise failed at noise_p=%.4f: %s", noise_p, exc)
            energy = 0.5 + (1.0 - noise_p) * (energy_theory - 0.5)
            energy_error = 0.0
            verdict = "marginal"

        results.append({
            "noise_p": round(noise_p, 6),
            "energy_est": round(energy, 6),
            "energy_error": round(energy_error, 6),
            "energy_theory": round(energy_theory, 6),
            "lambda_min": round(lambda_min, 6),
            "verdict": verdict,
        })
    return results


def run_adversarial_circuit(
    alpha: float,
    alpha_fake: float,
    shots: int = 1024,
) -> dict:
    """Run honest and adversarial circuits and compare bitstring distributions.

    The adversarial prover uses ``alpha_fake`` instead of the true ``alpha``.
    Returns per-bitstring counts/probabilities for both, plus summary metrics:
    - tvd: total variation distance  ½ Σ |p_honest - p_fake|
    - kl_honest_to_fake: KL(honest || fake) in nats
    - energy_honest / energy_fake: Hamiltonian energy for both
    - verdict_honest / verdict_fake: verifier decision for both
    """
    import math

    def _run_all(a: float) -> tuple[dict[str, float], float, float, str]:
        counts_z, counts_zx, counts_x, _backend, _t = _run_with_aer(a, shots)
        mapped = map_measurements(counts_z, counts_zx, counts_x, shots)
        energy = _compute_energy(a, mapped.observables)
        energy_error = _compute_energy_error(a, mapped.observables, shots)
        return mapped.probabilities, counts_z, energy, energy_error

    probs_honest, counts_honest, e_honest, e_err_honest = _run_all(alpha)
    probs_fake,   counts_fake,   e_fake,   e_err_fake   = _run_all(alpha_fake)

    # Gather union of all bitstrings
    all_states = sorted(set(probs_honest) | set(probs_fake))

    # Total variation distance
    tvd = 0.5 * sum(
        abs(probs_honest.get(s, 0.0) - probs_fake.get(s, 0.0))
        for s in all_states
    )

    # KL divergence KL(p_honest || p_fake) in nats, with eps guard
    eps = 1e-9
    kl = sum(
        ph * math.log((ph + eps) / (probs_fake.get(s, 0.0) + eps))
        for s, ph in probs_honest.items()
        if ph > 0
    )

    return {
        "alpha": round(float(alpha), 6),
        "alpha_fake": round(float(alpha_fake), 6),
        "shots": int(shots),
        "honest": {
            "counts": {str(k): int(v) for k, v in counts_honest.items()},
            "probabilities": {str(k): round(float(v), 6) for k, v in probs_honest.items()},
            "energy": round(e_honest, 6),
            "energy_error": round(e_err_honest, 6),
            "verdict": _verdict(e_honest, e_err_honest),
        },
        "adversarial": {
            "counts": {str(k): int(v) for k, v in counts_fake.items()},
            "probabilities": {str(k): round(float(v), 6) for k, v in probs_fake.items()},
            "energy": round(e_fake, 6),
            "energy_error": round(e_err_fake, 6),
            "verdict": _verdict(e_fake, e_err_fake),
        },
        "metrics": {
            "tvd": round(tvd, 6),
            "kl_honest_to_fake": round(kl, 6),
            "delta_energy": round(abs(e_fake - e_honest), 6),
        },
    }


def _compute_energy_2q(alpha: float, observables: dict[str, float]) -> float:
    """2Q frontend-compatible estimate: average of primary and cross-check."""
    import math

    c2a = math.cos(2.0 * alpha)
    s2a = math.sin(2.0 * alpha)
    primary = 0.5 - 0.5 * c2a * observables["Z1Z2"] - 0.5 * s2a * observables["X1X2"]
    cross = 0.5 - 0.5 * c2a * observables["Z1Z3"] - 0.5 * s2a * observables["X1X3"]
    return (primary + cross) / 2.0


def _run_with_aer(
    alpha: float, shots: int
) -> tuple[dict[str, int], dict[str, int], dict[str, int], str, float]:
    z_circuit  = build_measurement_circuit(alpha, basis="z")
    zx_circuit = build_measurement_circuit(alpha, basis="zx")
    x_circuit  = build_measurement_circuit(alpha, basis="x")

    z_result  = aer_executor.run_circuit(z_circuit, shots)
    zx_result = aer_executor.run_circuit(zx_circuit, shots)
    x_result  = aer_executor.run_circuit(x_circuit, shots)
    execution_time = (
        z_result.metadata.execution_time_ms
        + zx_result.metadata.execution_time_ms
        + x_result.metadata.execution_time_ms
    )
    return z_result.counts, zx_result.counts, x_result.counts, "aer", execution_time


def _run_with_aer_2q(
    alpha: float,
    shots: int,
) -> tuple[dict[str, int], dict[str, int], dict[str, int], dict[str, int], str, float]:
    z_circuit   = build_measurement_circuit_2q(alpha, basis="z")
    x12_circuit = build_measurement_circuit_2q(alpha, basis="x12")
    x13_circuit = build_measurement_circuit_2q(alpha, basis="x13")
    x23_circuit = build_measurement_circuit_2q(alpha, basis="x23")

    z_result = aer_executor.run_circuit(z_circuit, shots)
    x12_result = aer_executor.run_circuit(x12_circuit, shots)
    x13_result = aer_executor.run_circuit(x13_circuit, shots)
    x23_result = aer_executor.run_circuit(x23_circuit, shots)

    execution_time = (
        z_result.metadata.execution_time_ms
        + x12_result.metadata.execution_time_ms
        + x13_result.metadata.execution_time_ms
        + x23_result.metadata.execution_time_ms
    )

    return (
        z_result.counts,
        x12_result.counts,
        x13_result.counts,
        x23_result.counts,
        "aer",
        execution_time,
    )


def _run_with_ibm(
    alpha: float, shots: int
) -> tuple[dict[str, int], dict[str, int], dict[str, int], str, float]:
    z_circuit  = build_measurement_circuit(alpha, basis="z")
    zx_circuit = build_measurement_circuit(alpha, basis="zx")
    x_circuit  = build_measurement_circuit(alpha, basis="x")
    client = get_shared_client()

    results = ibm_executor.run_circuits_batch([z_circuit, zx_circuit, x_circuit], shots, client)
    z_result, zx_result, x_result = results
    execution_time = float(z_result.metadata.get("execution_time_ms", 0.0))
    return z_result.counts, zx_result.counts, x_result.counts, "ibm", execution_time


def _run_with_ibm_2q(
    alpha: float,
    shots: int,
) -> tuple[dict[str, int], dict[str, int], dict[str, int], dict[str, int], str, float]:
    z_circuit   = build_measurement_circuit_2q(alpha, basis="z")
    x12_circuit = build_measurement_circuit_2q(alpha, basis="x12")
    x13_circuit = build_measurement_circuit_2q(alpha, basis="x13")
    x23_circuit = build_measurement_circuit_2q(alpha, basis="x23")
    client = get_shared_client()

    results = ibm_executor.run_circuits_batch(
        [z_circuit, x12_circuit, x13_circuit, x23_circuit], shots, client
    )
    z_result, x12_result, x13_result, x23_result = results
    execution_time = float(z_result.metadata.get("execution_time_ms", 0.0))
    return (
        z_result.counts,
        x12_result.counts,
        x13_result.counts,
        x23_result.counts,
        "ibm",
        execution_time,
    )


def runExperimentSync(alpha: float, shots: int, backend: str = "aer", mode: str = "1q") -> dict:
    """Synchronous execution path."""
    backend_requested = (backend or "aer").strip().lower()
    run_mode = (mode or "1q").strip().lower()

    energy_error: float | None = None
    energy_theory: float | None = None
    lambda_min: float | None = None
    verdict: str | None = None

    if run_mode == "2q":
        if backend_requested == "ibm":
                counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time = _run_with_ibm_2q(alpha, shots)
        else:
            counts_z, counts_x12, counts_x13, counts_x23, backend_used, execution_time = _run_with_aer_2q(alpha, shots)

        mapped = map_measurements_2q(counts_z, counts_x12, counts_x13, counts_x23, shots)
        energy = _compute_energy_2q(alpha, mapped.observables)
    else:
        import math

        if backend_requested == "ibm":
                counts_z, counts_zx, counts_x, backend_used, execution_time = _run_with_ibm(
                    alpha,
                    shots,
                )
        else:
            counts_z, counts_zx, counts_x, backend_used, execution_time = _run_with_aer(alpha, shots)

        mapped = map_measurements(counts_z, counts_zx, counts_x, shots)
        energy = _compute_energy(alpha, mapped.observables)
        energy_error = _compute_energy_error(alpha, mapped.observables, shots)
        verdict = _verdict(energy, energy_error)
        energy_theory = math.sin(float(alpha)) ** 2
        lambda_min = _compute_lambda_min(float(alpha))

    return {
        "alpha": float(alpha),
        "observables": mapped.observables,
        "noisyObservables": mapped.observables,
        "energy": energy,
        "energy_error": energy_error if run_mode != "2q" else None,
        "energy_theory": energy_theory if run_mode != "2q" else None,
        "lambda_min": lambda_min if run_mode != "2q" else None,
        "verdict": verdict if run_mode != "2q" else None,
        "counts": counts_z,
        "probabilities": mapped.probabilities,
        "backendInfo": {
            "type": backend_used,
            "shots": int(shots),
            "executionTime": execution_time,
        },
    }


def submitExperimentJob(
    alpha: float,
    shots: int,
    backend: str = "ibm",
    mode: str = "1q",
) -> dict:
    """Submit asynchronous experiment job and return queue metadata."""
    job_id = submit_job(alpha, shots, backend, mode)
    return {
        "job_id": job_id,
        "status": "queued",
    }
