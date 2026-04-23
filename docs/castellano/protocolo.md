# Construcción de Feynman-Kitaev

Esta es la técnica matemática que permite convertir un circuito en un Hamiltoniano (que es la descripción de la energía estática de un sistema). 

Podemos pensar en el Hamiltoniano como un **"sistema de multas o penalizaciones"**. Diseñamos el Hamiltoniano de tal manera que si el estado cuántico obedece las reglas del circuito, su energía es cero (o muy baja); pero si rompe alguna regla, su energía sube.

### Paso 0: Preparar el escenario (Los dos registros)

Para construir el Hamiltoniano de un circuito de $n$ qubits y $T$ puertas, necesitamos definir el espacio en el que va a vivir tu estado. Lo dividimos en dos partes:
1.  **El Registro del Sistema:** Son los $n$ qubits de tu circuito original.
2.  **El Registro del Reloj (Clock):** Es un conjunto de qubits auxiliares que actúan como un contador de tiempo, desde $t=0$ hasta $t=T$. En el paper usan un "código de Gray" para codificar estos pasos usando solo $\lceil \log(T+1) \rceil$ qubits, lo que ahorra recursos. Digamos que tu circuito tiene $T=150$ compuertas. Entonces el reloj necesita $\lceil \log_2(151) \rceil = 8$ qubits extra para el reloj. 

### Paso 1: El término de Inicialización ($H_{\text{in}}$)

**El objetivo:** Asegurarnos de que el cálculo empieza limpiamente, es decir, que en el instante $t=0$, todos los $n$ qubits del sistema están en el estado $|0\rangle$.

**La ecuación (Ecuación A6 del paper):**
$$ H_{\text{in}} = \sum_{i=1}^n \frac{1}{2} (I - Z_i) \otimes |0\rangle \langle 0|_{\text{clock}} $$

**¿Qué significa en lenguaje plano?**
El operador $\frac{1}{2}(I - Z_i)$ es un detector. Si el qubit $i$ está en estado $|0\rangle$, este detector da $0$ (no hay multa). Si está en $|1\rangle$, el detector da $1$ (multa de energía). 
El término $\otimes |0\rangle \langle 0|$ actúa como un interruptor condicional: dice "aplica esta multa **SOLO** si el reloj marca $t=0$". 

### Paso 2: El término de Salida ($H_{\text{out}}$)

**El objetivo:** Comprobar si al final del circuito (en el tiempo $t=T$), el qubit que contiene la respuesta (digamos, el qubit 1) tiene el valor correcto para decir "SÍ" (que por convención suele ser el estado $|0\rangle$).

**La ecuación:**
$$ H_{\text{out}} = (T+1) \frac{1}{2} (I - Z_1) \otimes |T\rangle \langle T|_{\text{clock}} $$

**¿Qué significa en lenguaje plano?**
Igual que el anterior, $\frac{1}{2}(I - Z_1)$ penaliza al qubit de salida si termina valiendo $|1\rangle$ en lugar de $|0\rangle$. El término $\otimes |T\rangle \langle T|$ asegura que esta multa **SOLO** se aplique al final del todo, cuando el reloj marca $T$. *(Nota: El factor $(T+1)$ se añade por conveniencia matemática para normalizar energías).*

### Paso 3: El término de Propagación ($H_{\text{prop}}$) 

**El objetivo:** Esta es la parte que obliga a que el estado evolucione según las compuertas que tú hayas programado. Si en el paso $t$ toca aplicar la compuerta $U_t$, este término penaliza cualquier estado que NO cumpla que el estado en el tiempo $t$ es igual a aplicar $U_t$ al estado en el tiempo $t-1$.

**La ecuación (Ecuación A7 del paper):**
Para cada instante de tiempo $t$ (desde $1$ hasta $T$), construimos:
$$ H_{\text{prop}}(t) = \frac{1}{2} \left[ I \otimes |t\rangle\langle t| + I \otimes |t-1\rangle\langle t-1| - U_t \otimes |t\rangle\langle t-1| - U_t \otimes |t-1\rangle\langle t| \right] $$
Y luego sumamos todos los pasos: $H_{\text{prop}} = \sum_{t=1}^T H_{\text{prop}}(t)$.

*(Un detalle técnico clave: Para que esta fórmula matemática funcione y sea un Hamiltoniano válido (Hermítico), **la compuerta $U_t$ debe ser igual a su propia inversa** ($U_t = U_t^\dagger$). Por eso en el paper insisten en usar compuertas que sean "self-adjoint", como las rotaciones paramétricas o la CNOT).*

**¿Qué significa en lenguaje plano?**
Imagínate que estás revisando los fotogramas de una película. Esta ecuación coge el fotograma $t-1$, le aplica el filtro $U_t$ (tu compuerta) y lo compara con el fotograma $t$. Si no coinciden perfectamente, genera energía (una multa). Si coinciden a la perfección, la suma de todos esos términos se cancela mágicamente dando $0$ de energía.

### Paso 4: Juntarlo todo (El Hamiltoniano final)

Para construir el Hamiltoniano total, simplemente sumas las tres partes. Pero, como discutimos en la respuesta anterior, para evitar que las multas de la inicialización y la propagación queden "diluidas" en circuitos muy largos, se multiplican por unos "pesos" ($J_{\text{in}}$ y $J_{\text{prop}}$):

$$ H_{\text{total}} = H_{\text{out}} + J_{\text{in}} H_{\text{in}} + J_{\text{prop}} H_{\text{prop}} $$

El cálculo matemático para encontrar estos valores se basa en mapear el reloj a un camino aleatorio cuántico (Quantum Random Walk) unidimensional.

Aquí están los pasos que sigue un teórico para calcular $J$:

**Paso A: Encontrar el *gap* (brecha) espectral del reloj limpio**
El término $H_{\text{prop}}$ solo, visto matricialmente, es equivalente al problema físico de una "partícula en una caja unidimensional" discreta de tamaño $T$. Sabemos por mecánica cuántica básica que la energía del primer estado excitado (el estado de menor energía por encima del estado base 0) de una partícula en una caja escala como $1/T^2$.
Específicamente, el "gap" mínimo de $H_{\text{prop}}$ es aproximadamente:
$$ \Delta_{\text{prop}} \approx \frac{\pi^2}{2(T+1)^2} $$
Esto significa que la multa más pequeña posible que puede pagar un probador por desobedecer ligeramente una compuerta es proporcional a $1/T^2$.

**Paso B: Aplicar el Lema Geométrico de Kitaev**
Kitaev demostró un teorema de álgebra lineal que dice: Si tienes dos reglas (subespacios) que entran en conflicto (ej. "obedece las compuertas" vs "el resultado final debe ser $|0\rangle$"), el eigenvalue más bajo del sistema perturbado está limitado por el ángulo entre esos subespacios y el gap original.
La fórmula del Lema de Kitaev nos dice que la energía del caso mentiroso ("NO") será, en el peor de los casos:
$$ \lambda_{\text{min}} \approx \frac{c}{T} \cdot \Delta_{\text{prop}} \approx \frac{c}{T^3} $$
*(donde $c$ es una constante).*

**Paso C: Despejar $J$ para forzar la separación**
Para que la energía mínima en el caso de mentira sea estrictamente mayor que un umbral (y no caiga a $0$ a medida que $T$ crece), debemos multiplicar el gap $\Delta_{\text{prop}}$ para contrarrestar esa caída.
Matemáticamente, para garantizar una diferencia distinguible (un umbral mayor a $1/2 - a$), requerimos que:
$$ J_{\text{prop}} \sim \mathcal{O}(T^3) \quad \text{y} \quad J_{\text{in}} \sim \mathcal{O}(T^3) $$
**Conclusión general:** Para cualquier circuito de $T$ compuertas, calculas teóricamente los polinomios $J = \text{poly}(T)$ para garantizar la penalización. Un límite seguro típico usado en las demostraciones originales es establecer $J_{\text{prop}}$ y $J_{\text{in}}$ proporcionales a $T^3$ o $T^4$.

### 3. ¿Cómo los calcularon EXACTAMENTE en este paper ($J_{\text{in}} = 6$, $J_{\text{prop}} = 3$)?

Si miras el **Apéndice AIII B y el final del AIII A**, verás una confesión práctica de los físicos experimentales. Ellos no usaron una fórmula polinómica gigante (porque su $T=1$). En lugar de eso, hicieron una **optimización numérica directa**.

Para su experimento concreto (donde la matriz del Hamiltoniano era pequeñita, de 4x4), querían cumplir una desigualdad matemática específica que garantizara los umbrales de 0.4 ("SÍ") y 0.5 ("NO"):
Querían garantizar que para la energía del estado base $\lambda(H)$:
$$ \lambda(H) > \langle \eta | H | \eta \rangle - \frac{2}{5} $$

¿Por qué eligieron $J_{\text{in}} = 6$ y $J_{\text{prop}} = 3$ y no, digamos, $J = 1000$? Aquí entra la física de los láseres y los iones atrapados:

1.  **El problema del ruido experimental (Trace impact):** En el mundo real, cada medida tiene ruido (decoherencia, imperfecciones del láser). Ese ruido se modela matemáticamente usando la *traza* de la matriz del Hamiltoniano. Si pones coeficientes enormes (ej. $J_{\text{in}} = 100$), las multas son gigantes, el límite teórico se cumple sobradamente, **PERO** cualquier ínfimo error de los láseres en el laboratorio se multiplicaría por 100, haciendo imposible ver si la energía está en 0.4 o en 0.5.
2.  **La búsqueda de valores (Min-Max):**
    Lo que hicieron fue meter su matriz genérica en un ordenador clásico con $J_{\text{in}}$ y $J_{\text{prop}}$ como variables libres, y le pidieron al ordenador (probablemente usando Python/SciPy):
    *   *Objetivo:* Minimiza el tamaño de los números $J_{\text{in}}$ y $J_{\text{prop}}$.
    *   *Restricción:* Asegúrate de que la diagonalización de la matriz siempre respete la desigualdad $\lambda(H) > E_{\text{ideal}} - 0.4$.
    *   *Resultado del optimizador:* Los valores enteros más pequeños y robustos que cumplían esto, manteniendo el Hamiltoniano "pequeño" (traza baja para mitigar errores experimentales, como mencionan explícitamente en el texto justo antes de A.B.), fueron **6 y 3**.


--- 

### El Diccionario de Traducción (De estados a Paulis)

El puente entre la teoría de la información y la física se hace con estas reglas para traducir "detectores de estados" a compuertas de Pauli:
1.  **Detector de estar en $|0\rangle$:** El proyector $|0\rangle\langle 0| = \frac{1 + Z}{2}$
2.  **Detector de estar en $|1\rangle$:** El proyector $|1\rangle\langle 1| = \frac{1 - Z}{2}$
3.  **Transición de tiempo ($|0\rangle \leftrightarrow |1\rangle$):** El operador $|0\rangle\langle 1| + |1\rangle\langle 0| = X$
4.  **Estar en cualquier parte (Identidad):** $|0\rangle\langle 0| + |1\rangle\langle 1| = I$ (o 1).

Ahora, vamos a deducir las 3 fórmulas de la Ecuación A1 paso a paso.

### 1. Derivación de $H_{\text{in}}$ (La multa de inicio)

**La regla lógica:** "Si el reloj marca el tiempo $t=0$ y el Qubit 1 NO está en el estado inicial $|0\rangle$, pon una multa."
Matemáticamente, esto es el producto de dos detectores: penaliza si el Qubit 1 está en $|1\rangle$ **Y** el Qubit 2 está en $|0\rangle$.
$$ H_{\text{in}} = \underbrace{|1\rangle\langle 1|_1}_{\text{Qubit 1 está en } |1\rangle} \otimes \underbrace{|0\rangle\langle 0|_2}_{\text{Reloj en } t=0} $$

Aplicamos nuestro "diccionario":
$$ H_{\text{in}} = \left( \frac{1 - Z_1}{2} \right) \left( \frac{1 + Z_2}{2} \right) $$

Multiplicamos los paréntesis (recordando que $Z_1$ y $Z_2$ actúan en qubits distintos, así que simplemente se agrupan como $Z_1Z_2$):
$$ H_{\text{in}} = \frac{1}{4} \left( 1 \cdot 1 + 1 \cdot Z_2 - Z_1 \cdot 1 - Z_1 \cdot Z_2 \right) $$
$$ H_{\text{in}} = \frac{1}{4} \left( 1 - Z_1 + Z_2 - Z_1Z_2 \right) $$
**¡Y ahí tienes exactamente la segunda fórmula de A1!**

### 2. Derivación de $H_{\text{out}}$ (La multa de salida)

**La regla lógica:** "Si el reloj marca el final ($t=1$) y el Qubit 1 no arroja el resultado correcto (penalizamos si es $|1\rangle$), pon una multa".
El paper además multiplica este término por un peso de $(T+1)$ por conveniencia de diseño matemático (en este caso $T=1$, así que el peso es $2$).

$$ H_{\text{out}} = 2 \times \underbrace{|1\rangle\langle 1|_1}_{\text{Qubit 1 falla}} \otimes \underbrace{|1\rangle\langle 1|_2}_{\text{Reloj en } t=1} $$

Aplicamos el diccionario:
$$ H_{\text{out}} = 2 \times \left( \frac{1 - Z_1}{2} \right) \left( \frac{1 - Z_2}{2} \right) $$

Multiplicamos:
$$ H_{\text{out}} = 2 \times \frac{1}{4} \left( 1 - Z_1 - Z_2 + Z_1Z_2 \right) $$
$$ H_{\text{out}} = \frac{1}{2} \left( 1 - Z_1 - Z_2 + Z_1Z_2 \right) $$
**¡Ahí tienes la primera fórmula de A1!**

### 3. Derivación de $H_{\text{prop}}$ (La multa de propagación)

Esta es la más elegante. 
**La regla lógica:** Este término compara el estado en $t=0$ con el estado en $t=1$ usando el circuito $U(\alpha) = \cos(\alpha)Z_1 + \sin(\alpha)X_1$.
Según la ecuación general de Kitaev (Eq. A7), para un solo paso de tiempo, la propagación es:
$$ H_{\text{prop}} = \frac{1}{2} \Big( I_1 \otimes |1\rangle\langle 1|_2 + I_1 \otimes |0\rangle\langle 0|_2 - U \otimes |1\rangle\langle 0|_2 - U^{\dagger} \otimes |0\rangle\langle 1|_2 \Big) $$

Vamos a simplificar esto:
1.  **La primera parte (los estados en los que puedes estar):**
    $|1\rangle\langle 1|_2 + |0\rangle\langle 0|_2$ es simplemente la matriz Identidad $I_2$ (o el número 1). Así que esos dos primeros términos se reducen a **$\frac{1}{2}(1)$**.
2.  **La segunda parte (la transición):**
    Como nuestra compuerta $U$ es igual a su inversa ($U = U^{\dagger}$), podemos sacar factor común a $U$:
    $$- U \otimes (|1\rangle\langle 0|_2 + |0\rangle\langle 1|_2)$$
    ¡Pero espera! Según nuestro diccionario, $|1\rangle\langle 0| + |0\rangle\langle 1|$ es exactamente la compuerta $X_2$.
    Así que la transición se simplifica a **$- U_1 \otimes X_2$**.

Reconstruimos $H_{\text{prop}}$:
$$ H_{\text{prop}} = \frac{1}{2} \Big( 1 - U_1 \otimes X_2 \Big) $$

Ahora sustituimos $U_1$ por la fórmula matemática de la compuerta del experimento ($U = \cos\alpha Z_1 + \sin\alpha X_1$):
$$ H_{\text{prop}} = \frac{1}{2} \Big[ 1 - (\cos\alpha Z_1 + \sin\alpha X_1) X_2 \Big] $$

Distribuimos la $X_2$:
$$ H_{\text{prop}} = \frac{1}{2} \Big( 1 - \cos\alpha Z_1 X_2 - \sin\alpha X_1 X_2 \Big) $$
**¡Y hemos deducido la tercera fórmula de A1!**

### Conclusión: ¿Por qué resultaron ser EXACTAMENTE esos operadores?

Fíjate en la profunda belleza física de lo que acaba de pasar:

1.  **Las multas $H_{\text{in}}$ y $H_{\text{out}}$** solo se dedican a *leer* información ("¿estás en 0 o estás en 1?"). Como la compuerta $Z$ es la que distingue entre $|0\rangle$ y $|1\rangle$ (tiene valor propio +1 para $|0\rangle$ y -1 para $|1\rangle$), es natural que solo estén hechas de $Z_1, Z_2$ y el producto $Z_1Z_2$.
2.  **La multa $H_{\text{prop}}$** necesita *sincronizar el paso del tiempo*. Para hacer que el reloj pase de $0$ a $1$, necesita una fuerza de "salto" o "flip". Ese salto lo provee la compuerta $X_2$. Por lo tanto, este término queda acoplado usando $X_2$ multiplicado por lo que sea que estuviera haciendo tu circuito cuántico ($Z_1$ y $X_1$).

Y así es como un abstracto problema de complejidad computacional acaba transformado en un sistema físico de dipolos magnéticos interactuando con las compuertas $X$ y $Z$.