from __future__ import annotations

from qiskit import ClassicalRegister, QuantumCircuit, QuantumRegister


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

    Circuit:
        1. H on q_clock (q1) → |+⟩ superposition
        2. CRY(2α) with q_clock as control, q_prover as target

    Why CRY(2α) is correct:
        q_prover always starts in |0⟩, so only the action on |0⟩ matters.
        RY(2α)|0⟩ = cos(α)|0⟩ + sin(α)|1⟩, which is exactly the required
        conditional rotation to build the clock state.  The previous
        three-gate decomposition (RY(+α)·CZ·RY(-α)) implements the full
        unitary U(α) = cos(α)Z + sin(α)X, which also maps |0⟩ →
        cos(α)|0⟩ + sin(α)|1⟩ — identical output from |0⟩, but at the
        cost of two extra single-qubit gates.
    """
    theta = _clamp_alpha(alpha)

    q_prover = QuantumRegister(1, 'q_prover')
    q_clock  = QuantumRegister(1, 'q_clock')
    qc = QuantumCircuit(q_prover, q_clock)

    # Step 1: put q_clock in superposition
    qc.h(q_clock[0])

    # Step 2: CRY(2α) — controlled on q_clock, acting on q_prover
    # When q_clock=1: RY(2α)|0⟩ = cos(α)|0⟩ + sin(α)|1⟩  ✓
    # When q_clock=0: identity on q_prover                  ✓
    qc.cry(2 * theta, q_clock[0], q_prover[0])

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

    # Retrieve named registers from the base circuit
    q_prover = qc.qregs[0]  # QuantumRegister('q_prover')
    q_clock  = qc.qregs[1]  # QuantumRegister('q_clock')
    c_meas   = ClassicalRegister(2, 'meas')
    qc.add_register(c_meas)

    basis_name = basis.lower()

    if basis_name == "z":
        # (k1,k2)=(0,0): measure both qubits in Z — no basis change needed
        pass
    elif basis_name in {"zx", "z1x2"}:
        # (k1,k2)=(0,1): H only on q_clock to measure X2; q_prover stays in Z
        qc.h(q_clock[0])
    elif basis_name in {"x", "x12"}:
        # (k1,k2)=(1,1): H on both qubits to measure X1X2
        qc.h(q_prover[0])
        qc.h(q_clock[0])
    elif basis_name in {"x1z2"}:
        # (k1,k2)=(1,0): H on q_prover only to measure X1; q_clock stays in Z
        qc.h(q_prover[0])
    else:
        raise ValueError(f"Unsupported measurement basis: {basis!r}. "
                         f"Valid options: 'z', 'zx'/'z1x2', 'x'/'x12', 'x1z2'.")

    # meas[0] ← q_prover (LSB / rightmost in bitstring)
    # meas[1] ← q_clock  (MSB / leftmost  in bitstring)
    qc.measure([q_prover[0], q_clock[0]], [c_meas[0], c_meas[1]])
    return qc
