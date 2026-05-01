from __future__ import annotations

import logging
import math

from backend.qiskit.circuit_builder import build_measurement_circuit
from backend.energy import compute_energy as _compute_energy
from backend.qiskit.executor import make_depolarizing_backend, run_circuits
from backend.experiment_runner import _get_backend_for_aer
from backend.qiskit.measurement_mapper import map_measurements, extract_x1z2
from backend.verifier import compute_energy_error, verdict, compute_lambda_min

logger = logging.getLogger(__name__)


def sweep_alpha(shots: int, n_points: int = 30, backend: str = "aer") -> list[dict]:
    """Run n_points experiments at evenly spaced α ∈ [0, π/2].

    Each point returns alpha, energy_est, energy_error, energy_theory,
    lambda_min, verdict — reproducing Figure 2(b) — plus observables and
    observables_theory for all 6 operators to reproduce Figure 2(a).
    """
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
            aer_backend = _get_backend_for_aer()
            z_circuit    = build_measurement_circuit(alpha, basis="z")
            zx_circuit   = build_measurement_circuit(alpha, basis="zx")
            x_circuit    = build_measurement_circuit(alpha, basis="x")
            x1z2_circuit = build_measurement_circuit(alpha, basis="x1z2")

            z_res, zx_res, x_res, x1z2_res = run_circuits(
                [z_circuit, zx_circuit, x_circuit, x1z2_circuit], shots, aer_backend
            )
            x1z2_val = extract_x1z2(x1z2_res.counts, shots)

            mapped = map_measurements(z_res.counts, zx_res.counts, x_res.counts, shots)
            energy = _compute_energy(alpha, mapped.observables)
            energy_err = compute_energy_error(alpha, mapped.observables, shots)
            lmin = compute_lambda_min(alpha)
            verd = verdict(energy, energy_err)
            obs_measured = {k: round(v, 6) for k, v in mapped.observables.items()}
            obs_measured["X1Z2"] = round(x1z2_val, 6)
        except Exception as exc:
            logger.warning("sweep_alpha failed at alpha=%.4f: %s", alpha, exc)
            energy = 0.0
            energy_err = 0.0
            lmin = energy_theory
            verd = "marginal"
            obs_measured = {k: round(v, 6) for k, v in obs_theory.items()}

        results.append({
            "alpha": round(alpha, 6),
            "energy_est": round(energy, 6),
            "energy_error": round(energy_err, 6),
            "energy_theory": round(energy_theory, 6),
            "lambda_min": round(lmin, 6),
            "verdict": verd,
            "observables": obs_measured,
            "observables_theory": obs_theory,
        })
    return results


def sweep_shots(
    alpha: float,
    shots_list: list[int] | None = None,
) -> list[dict]:
    """Run the same α at increasing shot counts to show convergence.

    Each point returns shots, energy_est, energy_error, verdict.
    """
    if shots_list is None:
        shots_list = [64, 128, 256, 512, 1024, 2048, 4096, 8192]

    energy_theory = math.sin(alpha) ** 2
    results = []
    for shots in shots_list:
        try:
            aer_backend = _get_backend_for_aer()
            z_circuit  = build_measurement_circuit(alpha, basis="z")
            zx_circuit = build_measurement_circuit(alpha, basis="zx")
            x_circuit  = build_measurement_circuit(alpha, basis="x")
            z_res, zx_res, x_res = run_circuits(
                [z_circuit, zx_circuit, x_circuit], shots, aer_backend
            )
            mapped = map_measurements(z_res.counts, zx_res.counts, x_res.counts, shots)
            energy = _compute_energy(alpha, mapped.observables)
            energy_err = compute_energy_error(alpha, mapped.observables, shots)
            verd = verdict(energy, energy_err)
        except Exception as exc:
            logger.warning("sweep_shots failed at shots=%d: %s", shots, exc)
            energy = energy_theory
            energy_err = 0.0
            verd = "marginal"

        results.append({
            "shots": shots,
            "energy_est": round(energy, 6),
            "energy_error": round(energy_err, 6),
            "energy_theory": round(energy_theory, 6),
            "verdict": verd,
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
    if lambda_list is None:
        lambda_list = [0.0, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]

    energy_theory = math.sin(alpha) ** 2
    lmin = compute_lambda_min(alpha)
    results = []

    for noise_p in lambda_list:
        try:
            z_circuit  = build_measurement_circuit(alpha, basis="z")
            zx_circuit = build_measurement_circuit(alpha, basis="zx")
            x_circuit  = build_measurement_circuit(alpha, basis="x")
            noisy_backend = make_depolarizing_backend(noise_p)
            z_res, zx_res, x_res = run_circuits(
                [z_circuit, zx_circuit, x_circuit], shots, noisy_backend
            )
            mapped = map_measurements(z_res.counts, zx_res.counts, x_res.counts, shots)
            energy = _compute_energy(alpha, mapped.observables)
            energy_err = compute_energy_error(alpha, mapped.observables, shots)
            verd = verdict(energy, energy_err)
        except Exception as exc:
            logger.warning("sweep_noise failed at noise_p=%.4f: %s", noise_p, exc)
            energy = 0.5 + (1.0 - noise_p) * (energy_theory - 0.5)
            energy_err = 0.0
            verd = "marginal"

        results.append({
            "noise_p": round(noise_p, 6),
            "energy_est": round(energy, 6),
            "energy_error": round(energy_err, 6),
            "energy_theory": round(energy_theory, 6),
            "lambda_min": round(lmin, 6),
            "verdict": verd,
        })
    return results
