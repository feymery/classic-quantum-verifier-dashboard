# Protocol Alignment Analysis

Reference paper:

> **"Towards experimental classical verification of quantum computation"**
> Stricker et al., *Quantum Sci. Technol.* 9, 02LT01, 2024

This document covers:

1. What the paper specifies
2. How this implementation maps to it
3. The U(α) decomposition and why it is correct
4. Fix history (all correctness issues resolved)
5. Current alignment status

---

## What the paper specifies

### Circuit (Fig. 1b, Appendix B)

8-qubit circuit: `q_prover` (1), `q_clock` (1), `aux_prover` (3), `aux_clock` (3).

This implementation uses the 2-qubit reduced form (q_prover + q_clock) which is sufficient to compute all relevant observables.

### Clock state (Step 2, Eq. 2)

$$|\eta\rangle = \frac{1}{\sqrt{2}}\bigl[|0\rangle_{clk}|0\rangle_{prov} + |1\rangle_{clk} \cdot U(\alpha)|0\rangle_{prov}\bigr] = \frac{1}{\sqrt{2}}\bigl[|00\rangle + \cos(\alpha)|10\rangle + \sin(\alpha)|11\rangle\bigr]$$

where $U(\alpha) = \cos(\alpha)Z + \sin(\alpha)X$.

Prepared via: `H(q_clock)` → `CU(α)` on `q_prover`.

### Hamiltonian (Eq. C.1)

$$H = 3.5 \cdot I - 2Z_1 + Z_2 - Z_1Z_2 - 1.5\cos(\alpha)\,Z_1X_2 - 1.5\sin(\alpha)\,X_1X_2$$

### Three measurement bases — (k₁, k₂)

| Config | Observable | Basis change |
| --- | --- | --- |
| (0,0) | Z₁, Z₂, Z₁Z₂ | None — measure in Z on all qubits |
| (0,1) | **Z₁X₂** | H gate on q_clock only |
| (1,1) | X₁X₂ | H on both q_prover and q_clock |

(1,0) is deliberately excluded — X₁Z₂ does not appear in H.

### Energy formula

$$E_{est} = 3.5 - 2\langle Z_1\rangle + \langle Z_2\rangle - \langle Z_1Z_2\rangle - 1.5\cos(\alpha)\langle Z_1X_2\rangle - 1.5\sin(\alpha)\langle X_1X_2\rangle$$

### Acceptance criterion (Eq. D.7)

``` text
E + σ_E < 0.4   →  ACCEPTED   (honest quantum prover)
E − σ_E ≥ 0.5   →  REJECTED
otherwise        →  MARGINAL
```

Low energy = honest prover = ACCEPTED. High energy = REJECTED.

**Theoretical reference:** $\langle\eta|H|\eta\rangle = \sin^2(\alpha)$ — confirmed for all $\alpha \in [0, \pi/2]$.

---

## U(α) implementation

### What U(α) is — and what it is not

$U(\alpha) = \cos(\alpha)Z + \sin(\alpha)X$ is **not** a standard rotation gate. It is a linear combination of two Pauli operators, evaluating to the matrix:

$$U(\alpha) = \begin{bmatrix} \cos\alpha & \sin\alpha \\ \sin\alpha & -\cos\alpha \end{bmatrix}$$

- α = 0 → pure Z (phase flip only)
- α = π/2 → pure X (bit flip only)
- Intermediate → continuously interpolated mix

This is physically different from `RY(α)` = e^{-iαY/2}, which only rotates around the Y axis. Using `qc.cu(alpha, 0, 0, 0)` produces RY(α) and gives energy $\sin^2(\alpha/2)$ instead of the required $\sin^2(\alpha)$.

### Frontend — `src/modules/oneQubit/physics/hamiltonian.ts`

The matrix is computed analytically as a sum of Pauli matrices — no exponentials, no approximations:

```ts
export const buildU = (alpha: number): Mat2 => {
  const c = Math.cos(alpha);
  const s = Math.sin(alpha);
  // cos(α)·Z + sin(α)·X = [ [c, s], [s, -c] ]
  return [
    [[c, 0], [s, 0]],
    [[s, 0], [-c, 0]],
  ];
};
```

`buildClockState` then builds:

$$|\psi\rangle = \frac{1}{\sqrt{2}}\bigl(|00\rangle + \cos(\alpha)|10\rangle + \sin(\alpha)|11\rangle\bigr)$$

### Backend — `backend/circuit_builder.py`

Qiskit has no native gate for $U(\alpha) = \cos(\alpha)Z + \sin(\alpha)X$.
The circuit uses the decomposition from Appendix B:

$$CU(\alpha) = RY(+\alpha/2) \cdot CZ \cdot RY(-\alpha/2) \quad\text{(on q_prover, controlled by q_clock)}$$

```python
qc.ry(theta / 2, 0)    # RY(+α/2) on q_prover
qc.cz(1, 0)             # CZ: control=q_clock, target=q_prover
qc.ry(-theta / 2, 0)   # RY(-α/2) on q_prover
```

**Why this is correct:**

- When q_clock = |0⟩: CZ is identity → RY gates cancel → q_prover stays in |0⟩
- When q_clock = |1⟩: CZ applies Z to q_prover → sequence becomes:

$$RY(+\alpha/2) \cdot Z \cdot RY(-\alpha/2) = \cos(\alpha)Z + \sin(\alpha)X = U(\alpha)$$

This follows from the Lie algebra identity $e^{+i\theta Y} Z e^{-i\theta Y}$ at $\theta = \alpha/2$, which rotates Z toward X by $2\theta = \alpha$ in the ZX plane.

### Frontend ↔ Backend consistency

| Layer | Method | State on q_prover when clock = \|1⟩ |
| --- | --- | --- |
| TypeScript `buildU` | Direct matrix sum `c·Z + s·X` | `cos(α)\|0⟩ + sin(α)\|1⟩` |
| Python `build_circuit` | `RY(α/2) · CZ · RY(-α/2)` | `cos(α)\|0⟩ + sin(α)\|1⟩` |

Both produce the same quantum state. Ideal energy: $\langle H\rangle = \sin^2(\alpha)$, confirmed analytically and verified by Aer.

---

## Fix history

All six correctness bugs identified in the initial gap analysis were resolved in Phase 1 (April 2026).

| # | Fix | File(s) |
| --- | --- | --- |
| B1 | CU(α) gate: replaced `qc.cu(alpha,0,0,0)` with `RY(α/2)·CZ·RY(-α/2)` | `backend/circuit_builder.py` |
| B2 | Added Z₁X₂ observable and `zx` basis circuit end-to-end | `circuit_builder.py`, `measurement_mapper.py`, `executor.py`, `measurements.ts`, `backendExperiment1Q.ts` |
| B3 | Corrected Hamiltonian to 5-term formula | `backend/executor.py`, `src/physics/energy.ts` |
| B4 | Corrected acceptance criterion (was inverted) | `src/physics/energy.ts` |
| B5 | Corrected α★ from 0.9273 to `0.1·π/2` ≈ 0.1571 rad | `src/utils/constants.ts` |
| B6 | Added statistical error propagation (quadrature sum, Eq. D.7) | `backend/executor.py` |

---

## Alignment status

| Paper concept | Backend | Frontend |
| --- | --- | --- |
| U(α) = cos(α)Z + sin(α)X via `RY(α/2)·CZ·RY(-α/2)` | ✅ | — |
| Clock state \|η⟩ = (1/√2)(\|00⟩ + cos(α)\|10⟩ + sin(α)\|11⟩) | ✅ | ✅ `buildClockState` |
| 3 measurement circuits (zz, zx, xx) | ✅ | — |
| Observable Z₁X₂ | ✅ `Z1X2` in response | ✅ `OBS_Z1X2`, `Z1X2` field |
| Full 5-term Hamiltonian | ✅ | ✅ |
| σ_E error propagation | ✅ `energy_error` field | ⚠️ Computed but not displayed in EnergyPanel yet |
| E < 0.4 → ACCEPTED criterion | ✅ `verdict` field | ✅ `verifierDecision` |
| α★ = 0.1·π/2 reference preset | — | ✅ |
| λ_min(H) | ❌ Not in `/run` response | ❌ Not displayed |
| Alpha sweep Figure 2(b) | ✅ `POST /sweep/alpha` | ✅ AlphaSweepChart |
| Shot convergence sweep | ✅ `POST /sweep/shots` | ✅ |
| Depolarizing noise sweep | ✅ `POST /sweep/noise` (Phase 3) | ✅ NoiseSweepBackendPanel |
| Adversarial circuit comparison | ✅ `POST /adversarial/circuit` (Phase 3) | ✅ AdversarialCircuitPanel |

### Open items

- `λ_min(H)` — not yet included in the `/run` response or displayed in the UI.
- `energy_error` is returned by the backend and stored in state but not yet rendered in `EnergyPanel`.
