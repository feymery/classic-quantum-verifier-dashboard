/**
 * hamiltonian2Q.ts
 * 2-qubit extension of the verification protocol.
 *
 * System: 3 qubits in little-endian order
 *   q0 = clock qubit
 *   q1 = work qubit 1
 *   q2 = work qubit 2
 *
 * Circuit (state preparation):
 *   1. H on q0          → (1/√2)(|0⟩ + |1⟩) ⊗ |00⟩
 *   2. controlled-U(α) on q1, controlled by q0
 *   3. CNOT: q1 → q2
 *
 * Resulting clock state:
 *   |ψ⟩ = (1/√2)(|000⟩ + cos(α)|100⟩ + sin(α)|111⟩)
 *
 * Basis (index = binary value of q0q1q2):
 *   0 = |000⟩  1 = |001⟩  2 = |010⟩  3 = |011⟩
 *   4 = |100⟩  5 = |101⟩  6 = |110⟩  7 = |111⟩
 *
 * Why it's interesting:
 *   The CNOT entangles the two work qubits. The state is a 3-way
 *   superposition only for α ∈ (0, π/2). The entanglement in the
 *   work register is what makes the 2Q protocol harder to fake.
 */

export type StateVec8 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]; // real amplitudes only — our state has no imaginary parts

/**
 * Build the 2-qubit clock state.
 * All amplitudes are real for this circuit.
 *   ψ[0] = 1/√2
 *   ψ[4] = cos(α)/√2
 *   ψ[7] = sin(α)/√2
 *   all others = 0
 */
export const buildClockState2Q = (alpha: number): StateVec8 => {
  const inv = 1 / Math.SQRT2;
  return [
    inv, // |000⟩
    0, // |001⟩
    0, // |010⟩
    0, // |011⟩
    Math.cos(alpha) * inv, // |100⟩
    0, // |101⟩
    0, // |110⟩
    Math.sin(alpha) * inv, // |111⟩
  ];
};

/**
 * Probability distribution over the 8 basis states.
 * Used for shot sampling.
 */
export const stateProbs2Q = (psi: StateVec8): StateVec8 =>
  psi.map((a) => a * a) as StateVec8;

/**
 * Expectation value of a diagonal observable (eigenvalues ±1 per basis state).
 * `signs` is a length-8 array of +1 or -1.
 */
export const diagonalExpectation = (signs: number[], psi: StateVec8): number =>
  psi.reduce((acc, amp, i) => acc + signs[i] * amp * amp, 0);

// ── Sign patterns for each observable ────────────────────────────────────────
//
// For a tensor-product Pauli P₀⊗P₁⊗P₂ acting on |q0,q1,q2⟩:
//   eigenvalue = (-1)^(parity of bits where Pᵢ = Z or Y and qᵢ = 1)
//
// Bit layout: index i = (q0 << 2) | (q1 << 1) | q2
//   q0 = bit 2 (MSB), q1 = bit 1, q2 = bit 0 (LSB)

/** Z₁ = Z⊗I⊗I : eigenvalue = +1 if q0=0, -1 if q0=1 */
export const SIGNS_Z1: number[] = [1, 1, 1, 1, -1, -1, -1, -1];

/** Z₂ = I⊗Z⊗I : eigenvalue = +1 if q1=0, -1 if q1=1 */
export const SIGNS_Z2: number[] = [1, 1, -1, -1, 1, 1, -1, -1];

/** Z₃ = I⊗I⊗Z : eigenvalue = +1 if q2=0, -1 if q2=1 */
export const SIGNS_Z3: number[] = [1, -1, 1, -1, 1, -1, 1, -1];

/** Z₁Z₂ = Z⊗Z⊗I : product of Z1 and Z2 signs */
export const SIGNS_Z1Z2: number[] = SIGNS_Z1.map((s, i) => s * SIGNS_Z2[i]);

/** Z₁Z₃ = Z⊗I⊗Z */
export const SIGNS_Z1Z3: number[] = SIGNS_Z1.map((s, i) => s * SIGNS_Z3[i]);

/** Z₂Z₃ = I⊗Z⊗Z — should always equal 1 for our CNOT state */
export const SIGNS_Z2Z3: number[] = SIGNS_Z2.map((s, i) => s * SIGNS_Z3[i]);

/** Z₁Z₂Z₃ = Z⊗Z⊗Z */
export const SIGNS_Z1Z2Z3: number[] = SIGNS_Z1.map(
  (s, i) => s * SIGNS_Z2[i] * SIGNS_Z3[i],
);

// ── X-type observables ────────────────────────────────────────────────────────
//
// For real-amplitude states: ⟨X_A X_B⟩ = Σ_i ψ_i · ψ_{i XOR mask}
//
// Bit flip mapping (q0 = bit 2, q1 = bit 1, q2 = bit 0):
//   X₁X₂: flip q0 and q1 → XOR with 0b110 = 6
//   X₁X₃: flip q0 and q2 → XOR with 0b101 = 5
//   X₂X₃: flip q1 and q2 → XOR with 0b011 = 3

export const xExpectation = (mask: number, psi: StateVec8): number =>
  psi.reduce((acc, amp, i) => acc + amp * psi[i ^ mask], 0);

export const X1X2_MASK = 0b110; // flip q0 and q1
export const X1X3_MASK = 0b101; // flip q0 and q2
export const X2X3_MASK = 0b011; // flip q1 and q2
