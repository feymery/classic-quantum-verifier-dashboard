from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MeasurementMapping:
    observables: dict[str, float]
    probabilities: dict[str, float]


def _bit_to_eigen(bit: str) -> int:
    return 1 if bit == "0" else -1


def _decode_qiskit_bitstring(bitstring: str) -> tuple[str, str]:
    """Decode a 2-bit counts key into (q_prover_bit, q_clock_bit).

    Qiskit bitstrings are big-endian: for register meas[1]meas[0] the
    string 'ab' has a=meas[1] (q_clock) and b=meas[0] (q_prover).
    zfill(2) handles keys with leading zeros stripped by Qiskit.
    """
    s = bitstring.replace(" ", "").zfill(2)
    q_prover = s[1]   # meas[0] — rightmost / LSB
    q_clock  = s[0]   # meas[1] — leftmost  / MSB
    return q_prover, q_clock


def counts_to_probabilities(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe_shots = max(1, int(shots))
    return {state: count / safe_shots for state, count in counts.items()}


def _expectations_from_z_counts(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe_shots = max(1, int(shots))
    z1_sum = 0.0
    z2_sum = 0.0
    z1z2_sum = 0.0

    for state, count in counts.items():
        q0, q1 = _decode_qiskit_bitstring(state)
        z1 = _bit_to_eigen(q0)  # Z1 = Z_prover = Z_{q0}
        z2 = _bit_to_eigen(q1)  # Z2 = Z_clock  = Z_{q1}

        z1_sum += z1 * count
        z2_sum += z2 * count
        z1z2_sum += (z1 * z2) * count

    return {
        "Z1": z1_sum / safe_shots,
        "Z2": z2_sum / safe_shots,
        "Z1Z2": z1z2_sum / safe_shots,
    }


def _expectation_x1x2_from_x_counts(counts: dict[str, int], shots: int) -> float:
    safe_shots = max(1, int(shots))
    x1x2_sum = 0.0

    for state, count in counts.items():
        q0, q1 = _decode_qiskit_bitstring(state)
        x1 = _bit_to_eigen(q0)  # X1 = X_prover = X_{q0}
        x2 = _bit_to_eigen(q1)  # X2 = X_clock  = X_{q1}
        x1x2_sum += (x1 * x2) * count

    return x1x2_sum / safe_shots


def extract_x1z2(counts: dict[str, int], shots: int) -> float:
    """Extract ⟨X₁Z₂⟩ from the (k1,k2)=(1,0) measurement circuit.

    The circuit applies H to q_prover (q0) only before measurement.
    After the basis rotation: measuring q0 in Z gives the X₁ eigenvalue;
    measuring q1 directly in Z gives the Z₂ eigenvalue.
    Product = X₁Z₂ eigenvalue.

    Theoretical value for the honest clock state:
        ⟨X₁Z₂⟩ = cos(α)
    """
    safe_shots = max(1, int(shots))
    x1z2_sum = 0.0

    for state, count in counts.items():
        q0, q1 = _decode_qiskit_bitstring(state)
        x1 = _bit_to_eigen(q0)   # H was applied to q_prover (q0) → Z measurement = X eigenvalue
        z2 = _bit_to_eigen(q1)   # direct Z measurement on q_clock (q1)
        x1z2_sum += (x1 * z2) * count

    return x1z2_sum / safe_shots


def _expectation_z1x2_from_zx_counts(counts: dict[str, int], shots: int) -> float:
    """Extract Z1X2 expectation from the ZX-basis measurement counts.

    Circuit (k1,k2)=(0,1): H applied to q_clock (q1) only before measurement.
    After basis rotation: measuring q0 in Z gives eigenvalue of Z1;
    measuring q1 in Z gives eigenvalue of X2.
    Product Z1X2 = eigenvalue(q0) * eigenvalue(q1).
    """
    safe_shots = max(1, int(shots))
    z1x2_sum = 0.0

    for state, count in counts.items():
        q0, q1 = _decode_qiskit_bitstring(state)
        z1 = _bit_to_eigen(q0)   # direct Z measurement on q_prover (q0)
        x2 = _bit_to_eigen(q1)   # H was applied to q_clock (q1) → Z measurement = X eigenvalue
        z1x2_sum += (z1 * x2) * count

    return z1x2_sum / safe_shots


def map_measurements(
    counts_z: dict[str, int],
    counts_zx: dict[str, int],
    counts_x: dict[str, int],
    shots: int,
) -> MeasurementMapping:
    """Map the three measurement circuits to observable expectation values.

    counts_z   : (k1,k2)=(0,0) — Z-basis on both qubits → Z1, Z2, Z1Z2
    counts_zx  : (k1,k2)=(0,1) — H on q_clock only → Z1X2
    counts_x   : (k1,k2)=(1,1) — H on both qubits → X1X2
    """
    obs_z = _expectations_from_z_counts(counts_z, shots)
    z1x2 = _expectation_z1x2_from_zx_counts(counts_zx, shots)
    x1x2 = _expectation_x1x2_from_x_counts(counts_x, shots)

    observables = {
        "Z1": obs_z["Z1"],
        "Z2": obs_z["Z2"],
        "Z1Z2": obs_z["Z1Z2"],
        "Z1X2": z1x2,
        "X1X2": x1x2,
    }

    return MeasurementMapping(
        observables=observables,
        probabilities=counts_to_probabilities(counts_z, shots),
    )
