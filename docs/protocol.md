# Protocol Reference — Stricker et al. 2024

Implementation of the one-qubit quantum verification protocol described in
*"Towards experimental classical verification of quantum computation"*
(Roman Stricker et al., *Quantum Sci. Technol.* 9, 02LT01, 2024).

---

## 1. Overview

The protocol lets a classical **verifier** confirm that a quantum device (the **prover**) is
genuinely producing quantum states — without the verifier needing to simulate the full quantum
computation. The prover prepares a parameterised two-qubit *clock state* and the verifier
measures its Hamiltonian energy. An honest quantum prover achieves an energy below the
acceptance threshold; a classical prover cannot replicate the required coherence and is detected.

---

## 2. Register Layout

| Qubit | Label | Role |
|---|---|---|
| q0 | `q_prover` | Work / system qubit — holds the evolving state |
| q1 | `q_clock` | Clock / history register — drives the superposition |

**Qiskit bitstring convention** (big-endian): for a 2-bit register `meas[1]meas[0]`, the string
`"ab"` has `a = meas[1]` (q_clock, MSB / leftmost) and `b = meas[0]` (q_prover, LSB / rightmost).

---

## 3. Clock State Preparation

The prover constructs the two-qubit *clock state* $|{\eta(\alpha)}\rangle$ (Eq. 2 of the paper)
using two gates applied to $|{00}\rangle$:

```
Step 1:   H  on q_clock            →  (|0⟩ + |1⟩)/√2  ⊗  |0⟩
Step 2:   CRY(2α)  ctrl=q_clock, tgt=q_prover
```

The resulting state is:

$$
|\eta(\alpha)\rangle = \frac{1}{\sqrt{2}}\bigl(|00\rangle + \cos\alpha\,|01\rangle + \sin\alpha\,|11\rangle\bigr)
$$

where $|q_{\text{prover}}\,q_{\text{clock}}\rangle$ ordering is used
(equivalently: `"00"` prob $\tfrac{1}{2}$, `"10"` prob $\tfrac{\cos^2\alpha}{2}$,
`"11"` prob $\tfrac{\sin^2\alpha}{2}$, `"01"` prob $0$ — Qiskit MSB=q_clock bitstrings).

**Why CRY(2α)?** `RY(2α)|0⟩ = cos(α)|0⟩ + sin(α)|1⟩`. When q_clock = 1 the gate maps
q_prover from $|0\rangle$ to $\cos\alpha|0\rangle + \sin\alpha|1\rangle$, exactly matching the
required conditional rotation. This replaces the older three-gate decomposition
(RY(+α) · CZ · RY(−α)) at lower gate cost.

**Parameter range:** $\alpha \in [0,\, \pi/2]$.

**Protocol baseline α★:** $\alpha_\star = 0.1 \times \frac{\pi}{2} \approx 0.157\,\text{rad}$,
giving $\sin^2(\alpha_\star) \approx 0.024$, well below the 0.4 acceptance threshold.

---

## 4. Hamiltonian

The clock Hamiltonian (Stricker et al. Eq. C.1) whose ground state is $|\eta(\alpha)\rangle$:

$$
H(\alpha) = 3.5\,I\!\otimes\!I
          - 2\,Z_1\!\otimes\!I
          + I\!\otimes\!Z_2
          - Z_1 Z_2
          - 1.5\cos\alpha\;Z_1 X_2
          - 1.5\sin\alpha\;X_1 X_2
$$

| Symbol | Meaning |
|---|---|
| $Z_1$ | $Z$ on q\_prover (coeff $-2$) |
| $Z_2$ | $Z$ on q\_clock  (coeff $+1$) |
| $Z_1 Z_2$ | $Z\!\otimes\!Z$ correlated term (coeff $-1$) |
| $Z_1 X_2$ | $Z_{\text{prover}}\!\otimes\!X_{\text{clock}}$, basis $(k_1,k_2)=(0,1)$ |
| $X_1 X_2$ | $X\!\otimes\!X$ correlated term, basis $(k_1,k_2)=(1,1)$ |

The **constant offset** 3.5 equals $\mathrm{Tr}(H)\!/4$, the energy of the maximally-mixed state.

### 4.1 Energy estimator

$$
E = 3.5 - 2\langle Z_1\rangle + \langle Z_2\rangle - \langle Z_1 Z_2\rangle
    - 1.5\cos\alpha\;\langle Z_1 X_2\rangle - 1.5\sin\alpha\;\langle X_1 X_2\rangle
$$

### 4.2 Minimum eigenvalue

The minimum eigenvalue equals $\sin^2\alpha$ for all $\alpha$, achieved by the honest clock state:

$$
\lambda_{\min}(H(\alpha)) = \sin^2\alpha
$$

This is the theoretical ground truth energy $E_\text{theory}(\alpha) = \sin^2\alpha$.

### 4.3 Theoretical observable values for $|\eta(\alpha)\rangle$

| Observable | Exact value |
|---|---|
| $\langle Z_1\rangle$ | $0$ |
| $\langle Z_2\rangle$ | $\cos^2\alpha$ |
| $\langle Z_1 Z_2\rangle$ | $\sin^2\alpha$ |
| $\langle Z_1 X_2\rangle$ | $-\sin\alpha\cos\alpha$ |
| $\langle X_1 Z_2\rangle$ | $\cos\alpha$ (visualisation only — not in Hamiltonian) |
| $\langle X_1 X_2\rangle$ | $\sin\alpha$ |

---

## 5. Measurement Strategy

The five observables are estimated from **three independent measurement circuits** (plus one
optional visualisation circuit). Each circuit appends a basis-change layer to the same clock
state preparation.

| Circuit | Basis config $(k_1, k_2)$ | Layer added | Observables extracted |
|---|---|---|---|
| `"z"` | (0, 0) | none | $Z_1$, $Z_2$, $Z_1 Z_2$ |
| `"zx"` | (0, 1) | H on q_clock | $Z_1 X_2$ |
| `"x"` | (1, 1) | H on q_prover and q_clock | $X_1 X_2$ |
| `"x1z2"` | (1, 0) | H on q_prover only | $X_1 Z_2$ (visualisation) |

The three circuits `z`, `zx`, `x` are run in parallel per shot budget. The `x1z2` circuit is
executed additionally for the observable sweep plot (Figure 2a of the paper) but does not
contribute to the energy estimate.

### 5.1 Bitstring decoding

For each bitstring `s` (zero-padded to 2 characters):

```
q_prover = s[1]   (meas[0] — rightmost / LSB)
q_clock  = s[0]   (meas[1] — leftmost  / MSB)
Z eigenvalue: bit "0" → +1,  bit "1" → −1
```

---

## 6. Shot-Noise Error Propagation

For a $\pm 1$ observable $O$ estimated from $N$ shots, the shot-noise variance is:

$$
\sigma_O^2 = \frac{1 - \langle O\rangle^2}{N}
$$

The propagated energy uncertainty is (Stricker et al. Eq. D.7):

$$
\sigma_E = \sqrt{\sum_i c_i^2\,\sigma_{O_i}^2}
$$

with coefficients $c_{Z_1} = -2$, $c_{Z_2} = +1$, $c_{Z_1 Z_2} = -1$,
$c_{Z_1 X_2} = -1.5\cos\alpha$, $c_{X_1 X_2} = -1.5\sin\alpha$.

---

## 7. Verifier Decision Rule

The verifier classifies each experiment as:

| Condition | Verdict |
|---|---|
| $E + \sigma_E < 0.4$ | **accept** — consistent with honest quantum prover |
| $E - \sigma_E \geq 0.5$ | **reject** — inconsistent with quantum device |
| otherwise | **marginal** — inconclusive |

The thresholds 0.4 and 0.5 create a separation band around the maximum classical energy (≈ 0.5),
exploiting the fact that the honest clock state achieves $E = \sin^2\alpha \leq 1$.

For the frontend display (no shot-noise bands), the simplified rule is:
`E < 0.4 → accept`, `E ≥ 0.5 → reject`, otherwise `boundary`.

---

## 8. Depolarizing Noise Model

A single-parameter depolarizing channel with strength $\lambda$ attenuates every Pauli
observable uniformly:

$$
\langle O\rangle_\text{noisy} = (1 - \lambda)\,\langle O\rangle_\text{exact}
$$

Substituting into the energy estimator (the constant 3.5 is unaffected because it comes from the
identity term):

$$
E_\text{noisy}(\alpha,\lambda) = \lambda \cdot 3.5 + (1-\lambda)\,\sin^2\alpha
$$

**Limits:** $\lambda = 0 \Rightarrow E = \sin^2\alpha$ (ideal); $\lambda = 1 \Rightarrow E = 3.5$
(maximally mixed state).

### 8.1 Critical noise threshold

The noise level at which the energy crosses a threshold $T$:

$$
\lambda_c = \frac{T - \sin^2\alpha}{3.5 - \sin^2\alpha}
$$

Dashboard uses $T_\text{high} = 0.5$ (reject boundary) and $T_\text{low} = 0.4$ (accept boundary).

---

## 9. Sweeps

### 9.1 α sweep (`POST /sweep/alpha`)

Runs $n$ experiments at evenly spaced $\alpha \in [0, \pi/2]$. Each point returns
`alpha`, `energy_est`, `energy_error`, `energy_theory`, `lambda_min`, `verdict`,
`observables` (measured), and `observables_theory`. Reproduces Figure 2(b) of the paper.

Default: 30 points, 1024 shots, Aer backend.

### 9.2 Shot-count sweep (`POST /sweep/shots`)

Runs the same fixed $\alpha$ at increasing shot counts
$[64, 128, 256, 512, 1024, 2048, 4096, 8192]$ to show statistical convergence.

### 9.3 Noise sweep (`POST /sweep/noise`)

Runs fixed $\alpha$ and shot count at increasing depolarizing noise levels
$\lambda \in [0.00, 0.01, 0.02, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30]$ using
`AerSimulator + NoiseModel`. Shows how noise degrades the verifier signal.

---

## 10. Prover Traps

The Traps page demonstrates strategies a dishonest prover might attempt and how the
Hamiltonian energy detects them.

### Trap 1 — Classical product state $|00\rangle$

The prover skips all quantum operations and sends the $|00\rangle$ ground state.
Every measurement shot yields `"00"` — no superposition, no entanglement.

Expectation values:

| Observable | Value |
|---|---|
| $\langle Z_1\rangle$ | $+1$ |
| $\langle Z_2\rangle$ | $+1$ |
| $\langle Z_1 Z_2\rangle$ | $+1$ |
| $\langle X_1 X_2\rangle$ | $0$ |
| $\langle Z_1 X_2\rangle$ | $0$ |

Energy: $E = 3.5 - 2(1) + 1 - 1 = 1.5$. The verifier **rejects** ($E \geq 0.5$).

### Trap 2 — Final state only

The prover prepares only the terminal state of the computation, without the full
temporal superposition. The energy deviation from the clock state reveals the missing
history register coherence.

### 3-qubit extension

An optional 3-qubit variant extends the clock by adding a CNOT ancilla qubit:

$$
|\psi\rangle = \frac{1}{\sqrt{2}}\bigl(|000\rangle + \cos\alpha\,|100\rangle + \sin\alpha\,|111\rangle\bigr)
$$

The verifier uses total-variation distance $E = \sum_s |P_\text{meas}(s) - P_\text{honest}(s)|$.
Honest prover: $E = 0$; classical prover ($|000\rangle$): $E = 1.0$.

---

## 11. Key Numeric Constants

| Constant | Value | Meaning |
|---|---|---|
| $T_\text{low}$ | 0.4 | Lower energy threshold — accept boundary |
| $T_\text{high}$ | 0.5 | Upper energy threshold — reject boundary |
| $H_\infty$ | 3.5 | Energy of maximally-mixed state $\mathrm{Tr}(H)/4$ |
| $\alpha_\star$ | $0.1 \times \pi/2 \approx 0.157$ | Protocol baseline (Stricker et al.) |
| $E(\alpha_\star)$ | $\approx 0.024$ | Baseline energy — reliably accepted |
| $\alpha_\text{max}$ | $\pi/2 \approx 1.571$ | Maximum protocol angle |

---

## 12. Reference

Roman Stricker et al., *"Towards experimental classical verification of quantum computation"*,
*Quantum Sci. Technol.* 9, 02LT01, 2024.
Equations referenced: C.1 (Hamiltonian), D.7 (error propagation / verdict thresholds).
