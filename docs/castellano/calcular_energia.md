# Calcular la energía total del Hamiltoniano $\langle H \rangle$

Para calcular la energía total del Hamiltoniano $\langle H \rangle$, aplicamos un principio fundamental de la mecánica cuántica: **la linealidad del valor esperado**. Esto significa que no calculamos la energía de golpe, sino que la dividimos en sus piezas (los operadores de Pauli), calculamos el promedio de cada pieza en el laboratorio y luego sumamos todo en una ecuación matemática.


### Paso 1: Traducir los "bits" a "física" (+1 y -1)
Cuando mides los qubits en el laboratorio (ya sea en la base $Z$ o añadiendo compuertas Hadamard para medir en la base $X$), la máquina cuántica te devuelve resultados clásicos: `0` o `1`. 

En la física de los operadores de Pauli, el estado $|0\rangle$ corresponde al valor propio (eigenvalue) **+1**, y el estado $|1\rangle$ corresponde a **-1**.
Así que lo primero que haces en tu código clásico es esta sencilla conversión para cada qubit:
*   Si mides `0` $\rightarrow$ el valor es $m = +1$
*   Si mides `1` $\rightarrow$ el valor es $m = -1$


### Paso 2: Ejecutar los tres "setups" de medida
Si miras las ecuaciones del paper (Ecuación A1), nuestro Hamiltoniano completo depende de **cinco observables**. No puedes medirlos todos a la vez, así que divides tu experimento en tres rondas (repitiendo cada ronda, por ejemplo, 2000 veces, como hicieron ellos):

**Ronda A: Medir Qubit 1 en Z y Qubit 2 en Z**
En cada ejecución obtienes dos valores: $m_1$ y $m_2$ (ej. +1 y -1).
Con estos datos, puedes calcular los promedios estadísticos de tres términos enteros:
*   $\langle Z_1 \rangle$: Es simplemente la media de todos los $m_1$.
*   $\langle Z_2 \rangle$: Es la media de todos los $m_2$.
*   $\langle Z_1 Z_2 \rangle$: Para cada disparo, multiplicas $m_1 \times m_2$. Luego haces la media de todas esas multiplicaciones.

**Ronda B: Medir Qubit 1 en X y Qubit 2 en X**
Aplicas compuertas Hadamard a ambos qubits justo antes de medir.
Obtienes dos valores: $m_1$ y $m_2$.
*   $\langle X_1 X_2 \rangle$: Multiplicas $m_1 \times m_2$ en cada disparo y calculas la media.

**Ronda C: Medir Qubit 1 en Z y Qubit 2 en X**
Mides el Qubit 1 normal, y al Qubit 2 le aplicas una Hadamard antes de medir.
*   $\langle Z_1 X_2 \rangle$: Multiplicas $m_1 \times m_2$ en cada disparo y calculas la media.


*(Nota: En física experimental, a estos promedios se les llama "valores esperados" y siempre serán un número decimal entre -1.0 y 1.0).*


### Paso 3: Sustituir en las Ecuaciones de Penalización
Ahora que tu ordenador clásico tiene esos cinco números decimales, simplemente sustituyes los operadores por sus valores esperados en las ecuaciones A1. (Recuerda que la Identidad $I$ o $1$ tiene valor esperado $1$).

**1. Energía de Inicialización:**
$$ \langle H_{\text{in}} \rangle = \frac{1}{4} \Big( 1 - \langle Z_1 \rangle + \langle Z_2 \rangle - \langle Z_1 Z_2 \rangle \Big) $$

**2. Energía de Salida:**
$$ \langle H_{\text{out}} \rangle = \frac{1}{2} \Big( 1 - \langle Z_1 \rangle - \langle Z_2 \rangle + \langle Z_1 Z_2 \rangle \Big) $$

**3. Energía de Propagación:**
(Aquí usas el parámetro $\alpha$ del circuito que programaste).
$$ \langle H_{\text{prop}} \rangle = \frac{1}{2} \Big( 1 - \cos(\alpha)\langle Z_1 X_2 \rangle - \sin(\alpha)\langle X_1 X_2 \rangle \Big) $$


### Paso 4: Calcular la Energía Total

Como vimos anteriormente, en este experimento se usaron los pesos $J_{\text{in}} = 6$ y $J_{\text{prop}} = 3$ para separar correctamente el gap de energía.

La ecuación final que ejecutas en tu ordenador clásico es:
$$ E_{\text{total}} = \langle H \rangle = \langle H_{\text{out}} \rangle + 6 \langle H_{\text{in}} \rangle + 3 \langle H_{\text{prop}} \rangle $$

