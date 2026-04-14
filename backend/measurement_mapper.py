from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MeasurementMapping:
    observables: dict[str, float]
    probabilities: dict[str, float]


def _bit_to_eigen(bit: str) -> int:
    return 1 if bit == "0" else -1


def _decode_qiskit_bitstring(bitstring: str) -> tuple[str, str, str]:
    """Decode counts key into (q0, q1, q2).

    Qiskit count strings are returned in classical-register order c2c1c0.
    With measure([0,1,2],[0,1,2]), reversing yields q0,q1,q2.
    """
    s = bitstring.replace(" ", "")
    if len(s) < 3:
        s = s.rjust(3, "0")
    q0, q1, q2 = tuple(reversed(s[:3]))
    return q0, q1, q2


def counts_to_probabilities(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe_shots = max(1, int(shots))
    return {state: count / safe_shots for state, count in counts.items()}


def _expectations_from_z_counts(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe_shots = max(1, int(shots))
    z1_sum = 0.0
    z2_sum = 0.0
    z1z2_sum = 0.0

    for state, count in counts.items():
        q0, q1, _ = _decode_qiskit_bitstring(state)
        z1 = _bit_to_eigen(q0)
        z2 = _bit_to_eigen(q1)

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
        q0, q1, _ = _decode_qiskit_bitstring(state)
        x1 = _bit_to_eigen(q0)
        x2 = _bit_to_eigen(q1)
        x1x2_sum += (x1 * x2) * count

    return x1x2_sum / safe_shots


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
        q0, q1, _ = _decode_qiskit_bitstring(state)
        z1 = _bit_to_eigen(q0)
        x2 = _bit_to_eigen(q1)
        z1x2_sum += (z1 * x2) * count

    return z1x2_sum / safe_shots


def _expectation_pair_from_x_counts(
    counts: dict[str, int],
    shots: int,
    pair: tuple[int, int],
) -> float:
    safe_shots = max(1, int(shots))
    total = 0.0

    for state, count in counts.items():
        q0, q1, q2 = _decode_qiskit_bitstring(state)
        bits = [q0, q1, q2]
        a = _bit_to_eigen(bits[pair[0]])
        b = _bit_to_eigen(bits[pair[1]])
        total += (a * b) * count

    return total / safe_shots


def _expectations_2q_from_z_counts(counts: dict[str, int], shots: int) -> dict[str, float]:
    safe_shots = max(1, int(shots))

    sums = {
        "Z1": 0.0,
        "Z2": 0.0,
        "Z3": 0.0,
        "Z1Z2": 0.0,
        "Z1Z3": 0.0,
        "Z2Z3": 0.0,
        "Z1Z2Z3": 0.0,
    }

    for state, count in counts.items():
        q0, q1, q2 = _decode_qiskit_bitstring(state)
        z1 = _bit_to_eigen(q0)
        z2 = _bit_to_eigen(q1)
        z3 = _bit_to_eigen(q2)

        sums["Z1"] += z1 * count
        sums["Z2"] += z2 * count
        sums["Z3"] += z3 * count
        sums["Z1Z2"] += (z1 * z2) * count
        sums["Z1Z3"] += (z1 * z3) * count
        sums["Z2Z3"] += (z2 * z3) * count
        sums["Z1Z2Z3"] += (z1 * z2 * z3) * count

    return {k: v / safe_shots for k, v in sums.items()}


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


def map_measurements_2q(
    counts_z: dict[str, int],
    counts_x12: dict[str, int],
    counts_x13: dict[str, int],
    counts_x23: dict[str, int],
    shots: int,
) -> MeasurementMapping:
    obs_z = _expectations_2q_from_z_counts(counts_z, shots)

    observables = {
        **obs_z,
        "X1X2": _expectation_pair_from_x_counts(counts_x12, shots, (0, 1)),
        "X1X3": _expectation_pair_from_x_counts(counts_x13, shots, (0, 2)),
        "X2X3": _expectation_pair_from_x_counts(counts_x23, shots, (1, 2)),
    }

    return MeasurementMapping(
        observables=observables,
        probabilities=counts_to_probabilities(counts_z, shots),
    )
