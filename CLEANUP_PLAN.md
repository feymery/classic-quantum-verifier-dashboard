# Cleanup & Refactor Plan — Sesión actual

> **Objetivo:** Eliminar las implementaciones de 2Q y adversarial del proyecto.
>
> - El análisis 2Q pasa a ser **puramente teórico/conceptual** (sin simulación ni ejecución).
> - El módulo adversarial se **rehace desde cero** en una sesión posterior.

---

## Estado actual (antes del cleanup)

| Área | Qué existe hoy |
| --- | --- |
| `src/modules/twoQubit/` | physics, services, components, barrel export |
| `src/pages/Circuit2QPage.tsx` | página interactiva con run 2Q |
| `src/components/CircuitDiagram2Q/` | componente SVG del circuito 3-qubit |
| `src/hooks/useExperimentRunner.ts` | lógica `runForMode("twoQ")`, `twoQResult`, IBM 2Q polling |
| `src/types/experiment.ts` | `ExperimentConfig2Q`, `ExperimentResult2Q` |
| `src/types/runner.ts` | `"local-2q"` en `ExecutionSource`, `mode: "1q" \| "2q"` |
| `src/router/` | ruta `/2Qcircuit`, lazy `CircuitPage` |
| `src/components/AppNavigation.tsx` | tab "2Q Circuit" |
| `src/components/ResultProvenance.tsx` | case `"local-2q"` |
| `src/components/RunHistoryPanel.tsx` | display `"2Q"` para mode `"2q"` |
| `src/test/e2e.integration.test.ts` | suite "2Q Experiment Execution" |
| `backend/circuit_builder.py` | `build_circuit_2q`, `build_measurement_circuit_2q` |
| `backend/measurement_mapper.py` | `map_measurements_2q`, `_expectations_2q_from_z_counts` |
| `backend/experiment_runner.py` | `_run_with_aer_2q`, `_run_with_ibm_2q`, `_compute_energy_2q`, `run_adversarial_circuit` |
| `backend/main.py` | endpoint `POST /adversarial/circuit`, `AdversarialCircuitRequest` |
| `backend/tests/` | fixtures 2Q en `conftest.py`, tests 2Q en `test_api_contract.py` / `test_api_integration.py` |

> **Nota:** No existe ningún módulo adversarial en el frontend actualmente — fue eliminado en refactors anteriores. Solo quedan referencias de color en `AttackCurvePlot.tsx` (usadas en Traps, se mantienen).

---

## Pasos del cleanup

### FASE 1 — Frontend: eliminar módulo 2Q

- [x] **1.1** Borrar directorio `src/modules/twoQubit/` completo.
- [x] **1.2** Borrar `src/pages/Circuit2QPage.tsx`.
- [x] **1.3** Borrar directorio `src/components/CircuitDiagram2Q/`.
- [x] **1.4** `src/components/AppNavigation.tsx` — eliminar entrada `{ to: "/2Qcircuit", label: "2Q Circuit" }`.
- [x] **1.5** `src/router/routes.tsx` — eliminar ruta `{ path: "2Qcircuit", ... }` e import de `CircuitPage`.
- [x] **1.6** `src/router/lazyPages.ts` — eliminar export `CircuitPage`.

### FASE 2 — Frontend: limpiar tipos y estado

- [x] **2.1** `src/types/experiment.ts` — eliminar `ExperimentConfig2Q`, `ExperimentResult2Q` y el import de `measurements2Q`.
- [x] **2.2** `src/types/runner.ts` — eliminar `"local-2q"` de `ExecutionSource`; simplificar `mode` a solo `"1q"`.
- [x] **2.3** `src/hooks/useExperimentRunner.ts` — eliminar:
  - imports de `twoQubit/services/*`
  - `twoQResult` del estado del runner
  - helpers `Commit2QMeta` / `commit2QResult`
  - callback `runIbm2Q`
  - branch `runForMode("twoQ")`
- [x] **2.4** `src/state/AppStateContextDef.ts` — quitar cualquier referencia a `twoQ` / `twoQResult`.
- [x] **2.5** `src/components/ResultProvenance.tsx` — eliminar el case `"local-2q"`.
- [x] **2.6** `src/components/RunHistoryPanel.tsx` — eliminar la rama `"2q"` del display de mode.

### FASE 3 — Frontend: limpiar tests

- [x] **3.1** `src/test/e2e.integration.test.ts` — eliminar el bloque `describe("2Q Experiment Execution", ...)`.
- [x] **3.2** `src/test/api.contract.test.ts` — eliminar contratos del endpoint `/run2q` si existen.

### FASE 4 — Backend: eliminar implementación 2Q

- [x] **4.1** `backend/circuit_builder.py` — eliminar `build_circuit_2q` y `build_measurement_circuit_2q`.
- [x] **4.2** `backend/measurement_mapper.py` — eliminar `_expectations_2q_from_z_counts` y `map_measurements_2q`.
- [x] **4.3** `backend/experiment_runner.py` — eliminar `_run_with_aer_2q`, `_run_with_ibm_2q`, `_compute_energy_2q`, y el branch `run_mode == "2q"` en `runExperimentSync`.
- [x] **4.4** `backend/main.py` — simplificar el campo `mode` en los modelos de request de `"1q" | "2q"` a solo `"1q"`; ajustar imports.

### FASE 5 — Backend: eliminar implementación adversarial

- [x] **5.1** `backend/experiment_runner.py` — eliminar función `run_adversarial_circuit`.
- [x] **5.2** `backend/main.py` — eliminar `AdversarialCircuitRequest`, endpoint `POST /adversarial/circuit` y el import de `run_adversarial_circuit`.

### FASE 6 — Backend: limpiar tests

- [x] **6.1** `backend/tests/conftest.py` — eliminar fixture `sample_2q_params` y cualquier otro fixture exclusivo de 2Q.
- [x] **6.2** `backend/tests/test_api_contract.py` — eliminar tests de contratos 2Q y adversarial.
- [x] **6.3** `backend/tests/test_api_integration.py` — eliminar tests de integración 2Q y adversarial.

### FASE 7 — Traps: alinear con física 1Q

> El módulo Traps se **mantiene** pero su física interna tiene inconsistencias que hay que corregir.

**Contexto:** `ClassicalStateTrap.tsx` y `FinalStateTrap.tsx` tienen cada uno una función `honestCounts2Q` local con fórmulas distintas entre sí y distintas de `honestCounts` en `traps.ts`. Además, el nombre "2Q" en Traps es confuso: se refiere al circuito de 2 qubits del protocolo estándar (prover + clock), **no** al módulo de extensión de 3 qubits que eliminamos. No existe ni existirá ninguna llamada backend para Traps; es simulación local pura en frontend.

- [x] **7.1** Mover las funciones `honestCounts2Q` de ambos componentes a `traps.ts` (unificadas, con una sola implementación) y que los componentes las importen desde ahí.
- [x] **7.2** Verificar que las fórmulas de counts en los componentes son coherentes con el modelo 1Q: las probabilidades del estado de clock `|η(α)⟩` deben derivar de los mismos parámetros que usa `oneQubit/physics/measurements.ts`.
- [x] **7.3** Renombrar `TrapCircuitDiagram2Q` → `TrapCircuitDiagram1Q` (o simplemente `TrapCircuitDiagram`) dentro de `traps/components/TrapCircuitDiagram.tsx`, para que el nombre refleje que es el circuito 1Q (prover+clock). Actualizar los dos imports en `ClassicalStateTrap.tsx` y `FinalStateTrap.tsx`.
- [x] **7.4** Renombrar la tarjeta de "Trap 2 — 2Q" → "Trap 2 — Final State Only" (el id que ya tiene `TrapCard`) para evitar que el usuario lea "2Q" como algo relacionado con el módulo de extensión.

> **Nota de seguridad:** `TrapCircuitDiagram2Q` vive en `src/modules/traps/components/TrapCircuitDiagram.tsx`, NO en `src/components/CircuitDiagram2Q/`. Borrar `CircuitDiagram2Q/` en la Fase 1 es completamente seguro.

### FASE 8 — Verificación final

- [x] **8.1** `tsc --noEmit` sin errores.
- [x] **8.2** `pytest backend/tests/` — todos los tests restantes en verde.
- [x] **8.3** La app arranca (`npm run dev`) y navega sin errores en consola.
- [x] **8.4** Pestaña "Traps" funciona con ambos traps activos y el slider de α.

---

## Qué NO se toca

| Elemento | Motivo |
| --- | --- |
| `src/modules/traps/` | Se mantiene; se limpia internamente en Fase 7 |
| `src/components/charts/AttackCurvePlot.tsx` | Los colores `adversarialClaim`/`adversarialActual` son para Traps, no para un módulo adversarial separado |
| `src/components/charts/chartTheme.ts` | Mismo motivo |
| `src/modules/oneQubit/` | Núcleo del proyecto, sin cambios |
| Todos los componentes de UI compartidos | Sin cambios |

## Aclaraciones importantes sobre Traps

| Concepto | Aclaración |
| --- | --- |
| `TrapCircuitDiagram2Q` | Vive en `traps/components/` — es el circuito estándar 1Q (prover+clock). El "2Q" es un nombre heredado que se elimina en Fase 7 |
| Traps y backend | Las traps son **100% frontend**, sin llamadas a `/adversarial/circuit` ni a ningún otro endpoint. No existe ni existirá backend adversarial para Traps |
| `honestCounts2Q` duplicada | La misma función existe en `ClassicalStateTrap.tsx` y `FinalStateTrap.tsx` con fórmulas distintas — se unifica en `traps.ts` (Fase 7) |
| El módulo `twoQubit/` | Traps **no importa nada** de `twoQubit/`. Borrar ese módulo no afecta a Traps en absoluto |

---

## Diseño futuro del módulo adversarial (borrador conceptual)

> Este módulo se implementará en una sesión posterior, desde cero, con la siguiente visión:

### Objetivo

Demostrar que un prover clásico que intenta falsificar el protocolo con `α_fake ≠ α` es **detectable** por el verifier mediante análisis estadístico de los bitstrings medidos.

### Interfaz prevista

```text
src/modules/adversarial/
├── physics/
│   ├── adversarialModel.ts   # Modelo del prover deshonesto (qué fórmulas usa para simular α_fake)
│   └── detection.ts          # Score de detección: TVD, KL-divergence, o test χ²
├── services/
│   └── adversarialApi.ts     # POST /adversarial/analyze — nueva ruta a diseñar
├── components/
│   ├── AdversarialControlPanel/  # Slider α_fake, selector de nshots
│   ├── DetectionScore/           # Indicador visual del score de detección
│   └── AttackSweepChart/         # Sweep de α_fake vs. detección
└── pages/
    └── AdversarialPage.tsx
```

### Endpoints backend nuevos (a diseñar)

```text
POST /adversarial/analyze
  body: { alpha: float, alpha_fake: float, shots: int }
  returns: { tvd: float, kl: float, chi2: float, detectable: bool, ... }
```

### Criterio de diseño

- El módulo **no reutiliza nada** del código 2Q ni del antiguo `run_adversarial_circuit`.
- La detección se basa exclusivamente en **observables 1Q** para mantener coherencia con el módulo principal.
- El frontend calcula el score localmente primero (sin backend) y solo llama al backend para validación con ruido real de Aer.

---

Última actualización: 30 de abril de 2026*
