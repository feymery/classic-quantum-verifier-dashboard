from __future__ import annotations

from qiskit import QuantumCircuit


ALPHA_MIN = 0.0
ALPHA_MAX = 3.141592653589793 / 2


def _clamp_alpha(alpha: float) -> float:
    return max(ALPHA_MIN, min(ALPHA_MAX, float(alpha)))


def build_circuit(alpha: float) -> QuantumCircuit:
    """Build the 2-qubit clock state circuit matching Stricker et al. 2024.

    Register layout:
        q0 = q_prover  (system qubit)
        q1 = q_clock   (clock / history register qubit)

    Produces the clock state (Eq. 2 of the paper):
        |η⟩ = (1/√2)(|00⟩ + cos(α)|10⟩ + sin(α)|11⟩)

    Circuit (Figure 1b, Appendix B):
        1. H on q_clock (q1) → superposition
        2. CU(α) with q_clock as control, q_prover as target

    CU(α) decomposition for U(α) = cos(α)Z + sin(α)X (Appendix B):
        CU(α) = RY(α/2) · CZ · RY(-α/2)  on q_prover
    This gives CU(α)|0⟩ = cos(α)|0⟩ + sin(α)|1⟩ when the control is |1⟩,
    matching the clock state exactly.

    Note on the previous implementation: qc.cu(alpha, 0, 0, 0) produces
    U3(alpha,0,0) = RY(alpha), which is a rotation by angle alpha — not
    U(α) = cos(α)Z + sin(α)X. These are physically different operators.
    The energy of the state produced by RY(alpha) would be sin²(alpha/2),
    not sin²(alpha) as required by the paper.
    """
    theta = _clamp_alpha(alpha)

    # q0 = q_prover, q1 = q_clock — 2 qubits, 2 classical bits
    qc = QuantumCircuit(2, 2)

    # Step 1: put q_clock in superposition
    qc.h(1)

    # Step 2: CU(α) — explicit decomposition of U(α) = cos(α)Z + sin(α)X
    # Controlled on q1 (clock), acting on q0 (prover)
    qc.ry(theta / 2, 0)   # RY(α/2) on q_prover
    qc.cz(1, 0)            # CZ with control=q_clock, target=q_prover
    qc.ry(-theta / 2, 0)  # RY(-α/2) on q_prover

    return qc


def build_measurement_circuit(alpha: float, basis: str = "z") -> QuantumCircuit:
    """Return a measured copy of the base circuit for the selected basis.

    Supported bases (matching the three measurement configurations of the paper):
    - "z"           : (k1,k2)=(0,0) — Z-basis on both qubits → extracts Z1, Z2, Z1Z2
    - "zx" / "z1x2": (k1,k2)=(0,1) — H on q_clock only → extracts Z1X2
    - "x" / "x12"  : (k1,k2)=(1,1) — H on both qubits → extracts X1X2

    Note: (k1,k2)=(1,0) / X1Z2 basis is not used in the energy Hamiltonian
    (Eq. C.1 of Stricker et al.), but is included here for the expectation-value
    sweep visualisation (Figure 2a of the paper).
    """
    qc = build_circuit(alpha)

    basis_name = basis.lower()

    if basis_name == "z":
        # (k1,k2)=(0,0): measure both qubits in Z — no basis change needed
        pass
    elif basis_name in {"zx", "z1x2"}:
        # (k1,k2)=(0,1): H only on q_clock (q1) to measure X2; q_prover stays in Z
        qc.h(1)
    elif basis_name in {"x", "x12"}:
        # (k1,k2)=(1,1): H on both qubits to measure X1X2
        qc.h(0)
        qc.h(1)
    elif basis_name in {"x1z2"}:
        # (k1,k2)=(1,0): H on q_prover (q0) only to measure X1; q_clock stays in Z
        qc.h(0)
    else:
        raise ValueError(f"Unsupported measurement basis: {basis!r}. "
                         f"Valid options: 'z', 'zx'/'z1x2', 'x'/'x12', 'x1z2'.")

    qc.measure([0, 1], [0, 1])
    return qc
