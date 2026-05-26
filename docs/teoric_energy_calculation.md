# Calculating the Energy Theoretically

We explored how to theoretically calculate the energy for the single-qubit circuit discussed in the paper: $C = U(\alpha) = \cos\alpha Z + \sin\alpha X$.  

We constructed the Hamiltonian step by step within the 2-qubit Hilbert space.

### Step 1: Defining the Hilbert Space and the Basis
We worked within the Hilbert space $\mathbb{C}^2 \otimes \mathbb{C}^2$. The standard computational basis for two qubits is $\{|00\rangle, |01\rangle, |10\rangle, |11\rangle\}$, where the first qubit represented the computational system ($q_1$) and the second acted as the clock ($q_2$).

### Step 2: Matrix Representation of the Operators

We started by recalling that the single-qubit Pauli operators are defined as:

$$ I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}, \quad X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix} $$

We needed to express these Pauli operators acting on their respective qubits. By applying the tensor product ($\otimes$), we obtained:

*   $Z_1 = Z \otimes \mathbb{I} = \text{diag}(1, 1, -1, -1)$
*   $Z_2 = \mathbb{I} \otimes Z = \text{diag}(1, -1, 1, -1)$
*   $Z_1 Z_2 = \text{diag}(1, -1, -1, 1)$
*   $X_1 = X \otimes \mathbb{I} = \begin{pmatrix} 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \\ 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{pmatrix}$
*   $X_2 = \mathbb{I} \otimes X = \begin{pmatrix} 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}$
*   $Z_1 X_2 = Z \otimes X = \begin{pmatrix} 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & -1 \\ 0 & 0 & -1 & 0 \end{pmatrix}$
*   $X_1 X_2 = X \otimes X = \begin{pmatrix} 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \end{pmatrix}$

### Step 3: Constructing the Hamiltonian Terms
The total Kitaev Hamiltonian penalizes states that violate the rules of quantum computation. We defined it as: 
$$H = H_{out} + 6 H_{in} + 3 H_{prop}$$

We calculated the matrix form of each term based on the equations from the paper (Eq. A1):

**1. Input Hamiltonian ($H_{in}$):**
This term applies a penalty if the system qubit is not in the initial state $|0\rangle$ at time $t=0$.
$$H_{in} = \frac{1}{4}(I - Z_1 + Z_2 - Z_1 Z_2)$$
By computing this diagonal matrix, we saw that it exclusively penalized the state $|10\rangle$ (meaning the clock was at $0$ and the system was at $1$):
$$H_{in} = \text{diag}(0, 0, 1, 0) = |10\rangle\langle10|$$

**2. Output Hamiltonian ($H_{out}$):**
This term introduces a penalty if, at the end of the computation (when the clock is at $t=1$), the system is not in the desired state (which depends on the specific decision problem).
$$H_{out} = \frac{1}{2}(I - Z_1 - Z_2 + Z_1 Z_2)$$
Calculating this diagonal matrix showed that it penalized the state $|11\rangle$:
$$H_{out} = \text{diag}(0, 0, 0, 2) = 2|11\rangle\langle11|$$

**3. Propagation Hamiltonian ($H_{prop}$):**
This ensures that the transition from the state at $t=0$ to $t=1$ corresponds to the correct application of the gate $U(\alpha)$.
$$H_{prop} = \frac{1}{2}(I - \cos\alpha Z_1 X_2 - \sin\alpha X_1 X_2)$$
By substituting the matrices we derived in Step 2, we obtained:
$$H_{prop} = \frac{1}{2} \begin{pmatrix} 1 & -\cos\alpha & 0 & -\sin\alpha \\ -\cos\alpha & 1 & -\sin\alpha & 0 \\ 0 & -\sin\alpha & 1 & \cos\alpha \\ -\sin\alpha & 0 & \cos\alpha & 1 \end{pmatrix}$$

### Step 4: Assembling the Total Hamiltonian ($H$)
We combined all the terms using the weights specified in the paper ($1$ for Out, $6$ for In, and $3$ for Prop):

$$H = \begin{pmatrix} 0 \\ & 0 \\ & & 0 \\ & & & 2 \end{pmatrix} + \begin{pmatrix} 0 \\ & 0 \\ & & 6 \\ & & & 0 \end{pmatrix} + \begin{pmatrix} 1.5 & -1.5\cos\alpha & 0 & -1.5\sin\alpha \\ -1.5\cos\alpha & 1.5 & -1.5\sin\alpha & 0 \\ 0 & -1.5\sin\alpha & 1.5 & 1.5\cos\alpha \\ -1.5\sin\alpha & 0 & 1.5\cos\alpha & 1.5 \end{pmatrix}$$

**Final $4 \times 4$ Matrix for the Hamiltonian $H$:**
$$H = \begin{pmatrix} 1.5 & -1.5\cos\alpha & 0 & -1.5\sin\alpha \\ -1.5\cos\alpha & 1.5 & -1.5\sin\alpha & 0 \\ 0 & -1.5\sin\alpha & 7.5 & 1.5\cos\alpha \\ -1.5\sin\alpha & 0 & 1.5\cos\alpha & 3.5 \end{pmatrix}$$

### Step 5: Calculating the Minimum Energy (Diagonalization)

In quantum complexity theory, the ground state (the state with the lowest energy) represents the perfect computational history, known as the History State.

We defined the History State $|\eta\rangle$ as the superposition of the computational states at each time step:
$$|\eta\rangle = \frac{1}{\sqrt{2}} \Big( |0\rangle_1 \otimes |0\rangle_2 + U(\alpha)|0\rangle_1 \otimes |1\rangle_2 \Big)$$

By theoretically evaluating the expectation value of the energy for this state, $\langle \eta | H | \eta \rangle$, the matrix algebra yielded exactly **$\sin^2\alpha$**. This meant that the physical energy of our system was numerically equivalent to the probability of our original circuit outputting a "1".

However, to find the **exact** lowest eigenvalue, $\lambda_{min}$, we had to diagonalize the Hamiltonian $H$. Theoretically, this involved solving the characteristic equation (a 4th-degree polynomial):
$$\det(H - \lambda I) = 0$$

We found the 4 roots ($\lambda_1, \lambda_2, \lambda_3, \lambda_4$) and selected the smallest one:
$$\lambda_{min} = \min(\lambda_1, \lambda_2, \lambda_3, \lambda_4)$$

**An illustrative example (to check consistency):**
When we set $\alpha = 0$ (meaning $U = Z$), our theoretical matrix became block-diagonal:
$$H(\alpha=0) = \begin{pmatrix} 1.5 & -1.5 & 0 & 0 \\ -1.5 & 1.5 & 0 & 0 \\ 0 & 0 & 7.5 & 1.5 \\ 0 & 0 & 1.5 & 3.5 \end{pmatrix}$$

We diagonalized these blocks independently:
*   Block 1 (top-left): The eigenvalues were $\lambda_1 = 0$ and $\lambda_2 = 3$.
*   Block 2 (bottom-right): The eigenvalues were derived from $\lambda^2 - 11\lambda + 24 = 0$, giving us $\lambda_3 = 3$ and $\lambda_4 = 8$.

Our complete set of eigenvalues was $\{0, 3, 3, 8\}$. The absolute minimum value was **$\lambda_{min} = 0$**. 
When we cross-referenced this with the energy of the History State, we got $\sin^2(0) = 0$. The energy matched exactly, validating our computation!

For any other value where $\alpha \neq 0$, the matrix was not as easily reducible into simple blocks. However, whether we solved it numerically or by finding the roots of the quartic equation, we obtained a $\lambda_{min}$ bounded exactly as demonstrated in the paper: 
$$\sin^2\alpha - 0.4 < \lambda_{min} \le \sin^2\alpha$$

Through this brilliant approach, by measuring a local observable (the energy of the Hamiltonian), we could infer the result of the original computation. We achieved this without executing it in the conventional sense; instead, we compelled the quantum hardware to prepare the lowest energy state.