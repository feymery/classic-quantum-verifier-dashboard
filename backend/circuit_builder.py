from __future__ import annotations

from qiskit import QuantumCircuit


ALPHA_MIN = 0.0
ALPHA_MAX = 3.141592653589793 / 2


def _clamp_alpha(alpha: float) -> float:
    return max(ALPHA_MIN, min(ALPHA_MAX, float(alpha)))


def build_circuit(alpha: float) -> QuantumCircuit:
    """Build the base 3-qubit parameterized circuit.

    Structure:
    - H on q0
    - controlled-U(alpha) with control q0 and target q1
    - CNOT(q1 -> q2)

    The circuit is backend-agnostic and has no measurements by design.
    """
    theta = _clamp_alpha(alpha)

    qc = QuantumCircuit(3, 3)
    qc.h(0)
    qc.cu(theta, 0.0, 0.0, 0.0, 0, 1)
    qc.cx(1, 2)
    return qc


def build_measurement_circuit(alpha: float, basis: str = "z") -> QuantumCircuit:
    """Return a measured copy of the base circuit for the selected basis.

    Supported bases:
    - "z": direct computational-basis measurement
    - "x" or "x12": apply H on q0 and q1 (X1X2)
    - "x13": apply H on q0 and q2 (X1X3)
    - "x23": apply H on q1 and q2 (X2X3)
    """
    qc = build_circuit(alpha)

    basis_name = basis.lower()

    if basis_name in {"x", "x12"}:
        qc.h(0)
        qc.h(1)
    elif basis_name == "x13":
        qc.h(0)
        qc.h(2)
    elif basis_name == "x23":
        qc.h(1)
        qc.h(2)
    elif basis_name != "z":
        raise ValueError(f"Unsupported measurement basis: {basis}")

    qc.measure([0, 1, 2], [0, 1, 2])
    return qc
