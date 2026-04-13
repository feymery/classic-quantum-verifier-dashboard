/**
 * hamiltonian.ts
 * Pure math — no React, no side effects.
 *
 * Model:
 *   U(α) = cos(α)·Z + sin(α)·X
 *   Clock state |ψ⟩ = (1/√2)(|0⟩|↑⟩ + |1⟩U(α)|↑⟩)
 *   where |↑⟩ = |0⟩ is the "up" eigenstate of Z
 */

// ── Complex number helpers ────────────────────────────────────────────────────

export type Complex = [number, number]; // [real, imag]

export const add = ([ar, ai]: Complex, [br, bi]: Complex): Complex => [
  ar + br,
  ai + bi,
];
export const mul = ([ar, ai]: Complex, [br, bi]: Complex): Complex => [
  ar * br - ai * bi,
  ar * bi + ai * br,
];
export const scale = (s: number, [r, i]: Complex): Complex => [s * r, s * i];
export const conj = ([r, i]: Complex): Complex => [r, -i];
export const norm2 = ([r, i]: Complex): number => r * r + i * i;

// ── 2×2 complex matrix type ──────────────────────────────────────────────────

/** Row-major: M[row][col] */
export type Mat2 = [[Complex, Complex], [Complex, Complex]];

export const matMul = (A: Mat2, B: Mat2): Mat2 => {
  const el = (r: number, c: number): Complex =>
    add(mul(A[r][0], B[0][c]), mul(A[r][1], B[1][c]));
  return [
    [el(0, 0), el(0, 1)],
    [el(1, 0), el(1, 1)],
  ];
};

export const matVec = (M: Mat2, v: [Complex, Complex]): [Complex, Complex] => [
  add(mul(M[0][0], v[0]), mul(M[0][1], v[1])),
  add(mul(M[1][0], v[0]), mul(M[1][1], v[1])),
];

// ── Pauli matrices ────────────────────────────────────────────────────────────

const O: Complex = [0, 0];
const I: Complex = [1, 0];
const Ni: Complex = [0, -1];
const Pi: Complex = [0, 1];

export const PauliI: Mat2 = [
  [I, O],
  [O, I],
];
export const PauliX: Mat2 = [
  [O, I],
  [I, O],
];
export const PauliY: Mat2 = [
  [O, Ni],
  [Pi, O],
];
export const PauliZ: Mat2 = [
  [I, O],
  [O, [-1, 0]],
];

// ── U(α) = cos(α)·Z + sin(α)·X ───────────────────────────────────────────────

export const buildU = (alpha: number): Mat2 => {
  const c = Math.cos(alpha);
  const s = Math.sin(alpha);
  // cos(α)·Z + sin(α)·X
  // = [ [c, 0], [0, -c] ] + [ [0, s], [s, 0] ]
  // = [ [c, s], [s, -c] ]
  return [
    [
      [c, 0],
      [s, 0],
    ],
    [
      [s, 0],
      [-c, 0],
    ],
  ] as Mat2;
};

// ── Clock state ───────────────────────────────────────────────────────────────
//
// 2-qubit system: qubit 0 = clock, qubit 1 = work
// Basis order (little-endian): |00⟩, |01⟩, |10⟩, |11⟩
//   index 0 = |clock=0, work=0⟩
//   index 1 = |clock=0, work=1⟩
//   index 2 = |clock=1, work=0⟩
//   index 3 = |clock=1, work=1⟩
//
// |ψ⟩ = (1/√2)(|0⟩⊗|0⟩ + |1⟩⊗U(α)|0⟩)
//       = (1/√2)(|00⟩ + U(α)[0,0]|10⟩ + U(α)[1,0]|11⟩)
//
// So amplitudes:
//   ψ[0] = 1/√2           (|clock=0, work=0⟩)
//   ψ[1] = 0              (|clock=0, work=1⟩)
//   ψ[2] = U[0,0] / √2    (|clock=1, work=0⟩)
//   ψ[3] = U[1,0] / √2    (|clock=1, work=1⟩)

export type StateVec4 = [Complex, Complex, Complex, Complex];

export const buildClockState = (alpha: number): StateVec4 => {
  const U = buildU(alpha);
  const inv_sqrt2 = 1 / Math.SQRT2;
  return [
    scale(inv_sqrt2, I), // |00⟩
    scale(inv_sqrt2, O), // |01⟩
    scale(inv_sqrt2, U[0][0]), // |10⟩  ← U|0⟩ first component
    scale(inv_sqrt2, U[1][0]), // |11⟩  ← U|0⟩ second component
  ];
};

// ── Tensor product of two 2×2 matrices → 4×4 ─────────────────────────────────

export type Mat4 = Complex[][];

export const tensorProduct = (A: Mat2, B: Mat2): Mat4 => {
  const result: Mat4 = Array.from(
    { length: 4 },
    () => Array(4).fill([0, 0]) as Complex[],
  );
  for (let ar = 0; ar < 2; ar++) {
    for (let ac = 0; ac < 2; ac++) {
      for (let br = 0; br < 2; br++) {
        for (let bc = 0; bc < 2; bc++) {
          result[ar * 2 + br][ac * 2 + bc] = mul(A[ar][ac], B[br][bc]);
        }
      }
    }
  }
  return result;
};

/** Apply a 4×4 matrix to a 4-component statevector */
export const applyMat4 = (M: Mat4, psi: StateVec4): StateVec4 => {
  return psi.map((_, r) =>
    psi.reduce((acc, psi_c, c) => add(acc, mul(M[r][c], psi_c)), O as Complex),
  ) as StateVec4;
};

/** ⟨ψ|O|ψ⟩ — expectation value of a 4×4 observable, must be real */
export const expectation4 = (M: Mat4, psi: StateVec4): number => {
  const Mpsi = applyMat4(M, psi);
  return psi.reduce((acc, amp, i) => acc + mul(conj(amp), Mpsi[i])[0], 0);
};
