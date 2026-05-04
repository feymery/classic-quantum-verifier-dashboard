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



# Caso practico


### Paso 1: Identificar quién es quién (El Mapeo)
Fíjate en el texto clave que aparece en la parte inferior de tu imagen:
`q0=clock (left) · q1=work (right)`

Siguiendo la nomenclatura del paper que venimos usando:
*   **Qubit 1 ($Z_1$):** Es el qubit del sistema/trabajo (`work`). Corresponde al **bit derecho**.
*   **Qubit 2 ($Z_2$):** Es el qubit del reloj (`clock`). Corresponde al **bit izquierdo**.

Por lo tanto, los estados que ves en la gráfica se leen como $|Z_2 \, Z_1\rangle$.
Recuerda la regla de oro: **estado `0` vale $+1$** y **estado `1` vale $-1$**.

### Paso 2: Extraer las probabilidades
Podemos usar los porcentajes directamente o los conteos exactos. Para ser 100% rigurosos, usaremos los conteos exactos divididos por el total (1,024):
*   $P(00) = 531 / 1024 \approx 0.5185$  *(Izquierda 0, Derecha 0)*
*   $P(01) = 0 / 1024 = 0.0000$ *(Izquierda 0, Derecha 1)*
*   $P(10) = 285 / 1024 \approx 0.2783$ *(Izquierda 1, Derecha 0)*
*   $P(11) = 208 / 1024 \approx 0.2031$ *(Izquierda 1, Derecha 1)*

---

### Paso 3: Calcular $\langle Z_1 Z_2 \rangle$ (La correlación de ambos)
Para calcular el valor esperado conjunto, multiplicamos el valor de $Z_1$ por el valor de $Z_2$ para cada estado, y lo sumamos todo:
*   Para `00`: $(+1) \times (+1) = +1$
*   Para `01`: $(+1) \times (-1) = -1$
*   Para `10`: $(-1) \times (+1) = -1$
*   Para `11`: $(-1) \times (-1) = +1$

La fórmula queda agrupando los que dan $+1$ (bits iguales) y restando los que dan $-1$ (bits diferentes):
$$ \langle Z_1 Z_2 \rangle = P(00) + P(11) - P(01) - P(10) $$
$$ \langle Z_1 Z_2 \rangle = \frac{531 + 208 - 0 - 285}{1024} = \frac{454}{1024} $$
**$\langle Z_1 Z_2 \rangle = 0.4433$**

---

### Paso 4: Calcular $\langle Z_2 \rangle$ (Solo el Reloj - Bit Izquierdo)
Aquí ignoramos por completo lo que le pase al bit derecho. Solo miramos el bit de la izquierda.
*   Da $+1$ si empieza por `0` (es decir, los estados `00` y `01`).
*   Da $-1$ si empieza por `1` (es decir, los estados `10` y `11`).

Fórmula:
$$ \langle Z_2 \rangle = P(00) + P(01) - P(10) - P(11) $$
$$ \langle Z_2 \rangle = \frac{531 + 0 - 285 - 208}{1024} = \frac{38}{1024} $$
**$\langle Z_2 \rangle = 0.0371$**

*(Como ves, está muy cerca de cero, lo que físicamente significa que el qubit del reloj está casi en un estado de superposición perfecta donde hay un 50% de probabilidad de medir 0 y un 50% de medir 1).*

---

### Paso 5: Calcular $\langle Z_1 \rangle$ (Solo el Sistema - Bit Derecho)
Ahora ignoramos el bit izquierdo y solo miramos en qué termina la cadena.
*   Da $+1$ si termina en `0` (es decir, los estados `00` y `10`).
*   Da $-1$ si termina en `1` (es decir, los estados `01` y `11`).

Fórmula:
$$ \langle Z_1 \rangle = P(00) + P(10) - P(01) - P(11) $$
$$ \langle Z_1 \rangle = \frac{531 + 285 - 0 - 208}{1024} = \frac{608}{1024} $$
**$\langle Z_1 \rangle = 0.5937$**

---

### Resumen para meter en tu código clásico:
De esta sola gráfica (que es la "Ronda A" de medidas en la base ZZ), acabas de obtener 3 de los 5 valores necesarios para evaluar el Hamiltoniano:
*   $\langle Z_1 Z_2 \rangle = 0.4433$
*   $\langle Z_1 \rangle = 0.5937$
*   $\langle Z_2 \rangle = 0.0371$

Si ahora introduces estos números, por ejemplo, en la fórmula de la penalización de salida que vimos antes:
$$ \langle H_{\text{out}} \rangle = \frac{1}{2} \Big( 1 - \langle Z_1 \rangle - \langle Z_2 \rangle + \langle Z_1 Z_2 \rangle \Big) $$
$$ \langle H_{\text{out}} \rangle = \frac{1}{2} \Big( 1 - 0.5937 - 0.0371 + 0.4433 \Big) = \frac{1}{2} (0.8125) = \mathbf{0.4062} $$