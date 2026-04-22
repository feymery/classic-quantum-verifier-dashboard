# Construcción de Feynman-Kitaev

Esta es la técnica matemática que permite convertir un circuito en un Hamiltoniano (que es la descripción de la energía estática de un sistema). 

Podemos pensar en el Hamiltoniano como un **"sistema de multas o penalizaciones"**. Diseñamos el Hamiltoniano de tal manera que si el estado cuántico obedece las reglas del circuito, su energía es cero (o muy baja); pero si rompe alguna regla, su energía sube.

### Paso 0: Preparar el escenario (Los dos registros)

Para construir el Hamiltoniano de un circuito de $n$ qubits y $T$ puertas, necesitamos definir el espacio en el que va a vivir tu estado. Lo dividimos en dos partes:
1.  **El Registro del Sistema:** Son los $n$ qubits de tu circuito original.
2.  **El Registro del Reloj (Clock):** Es un conjunto de qubits auxiliares que actúan como un contador de tiempo, desde $t=0$ hasta $t=T$. En el paper usan un "código de Gray" para codificar estos pasos usando solo $\lceil \log(T+1) \rceil$ qubits, lo que ahorra recursos. 

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

### Resumen: ¿Cómo construyo esto para CUALQUIER circuito que yo me invente?

Si mañana me traes un circuito cuántico que diseñaste (por ejemplo, de 5 qubits y 100 compuertas) y me pides su Hamiltoniano, yo seguiría esta "receta de cocina":

1.  **Recompilar el circuito:** Traduzco todas tus compuertas a un set universal donde todas las compuertas sean "self-adjoint" (hermíticas), como la $X$, $Z$, Hadamard o CNOT. Ahora digamos que tu circuito tiene $T=150$ compuertas.
2.  **Añadir el reloj:** Como $T=150$, necesito un reloj que cuente hasta 150. Usando código de Gray, necesito $\lceil \log_2(151) \rceil = 8$ qubits extra para el reloj.
3.  **Construir las matrices (o los términos de Pauli):**
    *   Escribo $H_{\text{in}}$ poniendo la multa en $t=0$.
    *   Escribo $H_{\text{out}}$ poniendo la multa en $t=150$ para el qubit de respuesta.
    *   Hago un bucle `for t = 1 to 150:` y aplico la fórmula de $H_{\text{prop}}(t)$ usando la compuerta $U_t$ correspondiente a ese paso exacto.
4.  **Elegir los pesos:** Calculo $J_{\text{in}}$ y $J_{\text{prop}}$ en función de $T$ (para asegurar matemáticamente el *gap* espectral).

¡Y listo! Al sumar todo eso, obtienes un polinomio de operadores $X$, $Y$ y $Z$. Acabas de transformar un algoritmo (código en el tiempo) en una molécula/sistema físico abstracto (energía en el espacio). El estado de mínima energía de ese sistema codifica toda la historia de tu ejecución, fotograma a fotograma. 