# Calcular la energía de forma teórica 

Vamos a ver como se calcula la energía de forma teórica para el caso del circuito del paper de un solo qubit $C = U(\alpha) = \cos\alpha Z + \sin\alpha X$.  

Vamos a construir el Hamiltoniano paso a paso en el espacio de Hilbert de 2 qubits.

### Paso 1: Definir el espacio de Hilbert y la base
Trabajaremos en un espacio de $\mathbb{C}^2 \otimes \mathbb{C}^2$. La base computacional estándar de 2 qubits es $\{|00\rangle, |01\rangle, |10\rangle, |11\rangle\}$, donde el primer qubit es el del circuito ($q_1$) y el segundo es el reloj ($q_2$).

### Paso 2: Representación matricial de los operadores

Tenemos que los operadores de Pauli para un qubit son:

$$ I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}, \quad X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix} $$

Necesitamos los operadores de Pauli actuando sobre los qubits correspondientes. Usando el producto tensorial ($\otimes$):

*   $Z_1 = Z \otimes \mathbb{I} = \text{diag}(1, 1, -1, -1)$
*   $Z_2 = \mathbb{I} \otimes Z = \text{diag}(1, -1, 1, -1)$
*   $Z_1 Z_2 = \text{diag}(1, -1, -1, 1)$
*   $X_1 = X \otimes \mathbb{I} = \begin{pmatrix} 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \\ 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{pmatrix}$
*   $X_2 = \mathbb{I} \otimes X = \begin{pmatrix} 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}$
*   $Z_1 X_2 = Z \otimes X = \begin{pmatrix} 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & -1 \\ 0 & 0 & -1 & 0 \end{pmatrix}$
*   $X_1 X_2 = X \otimes X = \begin{pmatrix} 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \end{pmatrix}$

### Paso 3: Construcción de los términos del Hamiltoniano
El Hamiltoniano total de Kitaev penaliza estados que no cumplen las reglas del cómputo cuántico. Se define como: 
$$H = H_{out} + 6 H_{in} + 3 H_{prop}$$

Calculemos matricialmente cada término según las ecuaciones del artículo (Ec. A1):

**1. Hamiltoniano de Entrada ($H_{in}$):**
Penaliza si en el tiempo $t=0$ el qubit del circuito no está en el estado inicial $|0\rangle$.
$$H_{in} = \frac{1}{4}(I - Z_1 + Z_2 - Z_1 Z_2)$$
Si operamos esta matriz diagonal, obtenemos que penaliza únicamente el estado $|10\rangle$ (es decir, reloj en 0 y sistema en 1):
$$H_{in} = \text{diag}(0, 0, 1, 0) = |10\rangle\langle10|$$

**2. Hamiltoniano de Salida ($H_{out}$):**
Penaliza si al final del cómputo (reloj en $t=1$) el estado del sistema no es el deseado (depende del problema de decisión).
$$H_{out} = \frac{1}{2}(I - Z_1 - Z_2 + Z_1 Z_2)$$
Si operamos esta matriz diagonal, penaliza el estado $|11\rangle$:
$$H_{out} = \text{diag}(0, 0, 0, 2) = 2|11\rangle\langle11|$$

**3. Hamiltoniano de Propagación ($H_{prop}$):**
Asegura que la transición del estado en $t=0$ al $t=1$ se hace aplicando correctamente $U(\alpha)$.
$$H_{prop} = \frac{1}{2}(I - \cos\alpha Z_1 X_2 - \sin\alpha X_1 X_2)$$
Sustituyendo las matrices del Paso 2:
$$H_{prop} = \frac{1}{2} \begin{pmatrix} 1 & -\cos\alpha & 0 & -\sin\alpha \\ -\cos\alpha & 1 & -\sin\alpha & 0 \\ 0 & -\sin\alpha & 1 & \cos\alpha \\ -\sin\alpha & 0 & \cos\alpha & 1 \end{pmatrix}$$

### Paso 4: Ensamblar el Hamiltoniano Total ($H$)
Sumamos todo con los pesos dados en el paper ($1$ para Out, $6$ para In, $3$ para Prop):

$$H = \begin{pmatrix} 0 \\ & 0 \\ & & 0 \\ & & & 2 \end{pmatrix} + \begin{pmatrix} 0 \\ & 0 \\ & & 6 \\ & & & 0 \end{pmatrix} + \begin{pmatrix} 1.5 & -1.5\cos\alpha & 0 & -1.5\sin\alpha \\ -1.5\cos\alpha & 1.5 & -1.5\sin\alpha & 0 \\ 0 & -1.5\sin\alpha & 1.5 & 1.5\cos\alpha \\ -1.5\sin\alpha & 0 & 1.5\cos\alpha & 1.5 \end{pmatrix}$$

**Matriz final del Hamiltoniano $H$ (Tamaño 4x4):**
$$H = \begin{pmatrix} 1.5 & -1.5\cos\alpha & 0 & -1.5\sin\alpha \\ -1.5\cos\alpha & 1.5 & -1.5\sin\alpha & 0 \\ 0 & -1.5\sin\alpha & 7.5 & 1.5\cos\alpha \\ -1.5\sin\alpha & 0 & 1.5\cos\alpha & 3.5 \end{pmatrix}$$

### Paso 5: Cálculo de la Energía Mínima (Diagonalización)

En la teoría de complejidad cuántica, el estado base, el de menor energía, es la historia computacional perfecta: el Estado Historia.

El Estado Historia $|\eta\rangle$ es la superposición del estado en cada instante de tiempo:
$$|\eta\rangle = \frac{1}{\sqrt{2}} \Big( |0\rangle_1 \otimes |0\rangle_2 + U(\alpha)|0\rangle_1 \otimes |1\rangle_2 \Big)$$

Si evaluamos teóricamente el valor esperado de la energía de este estado, $\langle \eta | H | \eta \rangle$, el álgebra matricial nos arrojará exactamente **$\sin^2\alpha$**. Significa que la energía de este sistema físico es numéricamente igual a la probabilidad de que tu circuito original responda "1".

Sin embargo, para hallar el valor propio más pequeño **exacto**, $\lambda_{min}$, debes diagonalizar el Hamiltoniano $H$. Teóricamente, esto significa resolver la ecuación característica (polinomio de grado 4):
$$\det(H - \lambda I) = 0$$

Sacamos las 4 raíces ($\lambda_1, \lambda_2, \lambda_3, \lambda_4$) y tomamos la menor:
$$\lambda_{min} = \min(\lambda_1, \lambda_2, \lambda_3, \lambda_4)$$

**Un ejemplo ilustrativo (para comprobar la consistencia):**
Si $\alpha = 0$ (es decir, $U = Z$), la matriz teórica queda bloque-diagonal:
$$H(\alpha=0) = \begin{pmatrix} 1.5 & -1.5 & 0 & 0 \\ -1.5 & 1.5 & 0 & 0 \\ 0 & 0 & 7.5 & 1.5 \\ 0 & 0 & 1.5 & 3.5 \end{pmatrix}$$

Podemos diagonalizar los bloques por separado:
*   Bloque 1 (arriba a la izq): Los valores propios son $\lambda_1 = 0$ y $\lambda_2 = 3$.
*   Bloque 2 (abajo a la der): Los valores propios resultan de $\lambda^2 - 11\lambda + 24 = 0$, que son $\lambda_3 = 3$ y $\lambda_4 = 8$.

El conjunto de valores propios es $\{0, 3, 3, 8\}$. El valor mínimo absoluto es **$\lambda_{min} = 0$**. 
Y si revisamos la energía del Estado Historia, $\sin^2(0) = 0$. ¡La energía coincide exactamente, el cómputo es válido!

Para cualquier otro valor de $\alpha \neq 0$, la matriz no es completamente reducible a bloques tan simples, pero numéricamente (o resolviendo la cuártica) sacarás un $\lambda_{min}$ que está acotado tal como demuestra el paper: 
$$\sin^2\alpha - 0.4 < \lambda_{min} \le \sin^2\alpha$$

De esta forma brillante, midiendo un observable local (la energía del Hamiltoniano), puedes inferir el resultado de la computación original sin haber tenido que ejecutarla de manera convencional, sino obligando al hardware cuántico a preparar el estado de menor energía.

