# Quantum Verification Playground

Interactive full-stack platform for quantum protocol simulation, verification, and adversarial analysis (React + FastAPI + Qiskit).

## Quick Start (60s)

```bash
# Terminal 1 (frontend)
npm install
npm run dev

# Terminal 2 (backend)
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.main:app --reload --port 8000
```

Open:

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

First run path:

1. Go to `/experiment`
2. Choose mode (`1Q` or `2Q`)
3. Click `Run Experiment`
4. Inspect outputs in `/visualization`, `/circuit`, and `/adversarial`

## Project At A Glance

| Area | Stack | Current Status |
| --- | --- | --- |
| Frontend UI | React 19 + TypeScript + Tailwind 4 | Modular pages/components, production build working |
| Charting | Recharts | Energy/histogram/comparison/adversarial plots active |
| Backend API | FastAPI + Pydantic v2 | `/run`, `/job/{id}`, `/status`, `/backends` available |
| Quantum execution | Qiskit Aer + IBM Runtime | Aer stable; IBM optional with async job queue |
| Job system | ThreadPool + SQLite store | Async flow implemented with persistent job metadata |
| Security/Auth | N/A | Not implemented (single-user local/dev model) |

## Overview

Quantum Verification Playground is a developer-facing and research-oriented environment for exploring verifier-style quantum workflows.

The platform combines:

- a modular React dashboard for experiment control and visualization
- a FastAPI backend with Qiskit execution paths (Aer and IBM Runtime)
- an adversarial module to model fake prover behavior and detection probability
- an async job system for queued backend execution

### Why this project exists

Most quantum protocol demos are either:

- mathematically rich but hard to run end-to-end, or
- easy to run but shallow in verification depth

This project closes that gap by providing one place to:

- set protocol parameters
- execute experiments
- inspect observables and energies
- compare nominal vs adversarial behavior
- reason about detectability under noise and finite shots

## Features

- 1Q simulation workflow (state prep, observables, energy estimation)
- 2Q extension with entanglement-aware measurements and comparative complexity view
- measurement subsystem for sampled expectation values and basis counts
- visualization stack with Recharts:
  - energy curves
  - shot histograms
  - alpha-comparison overlays
  - noise sweep and attack curves
- adversarial module:
  - fake prover strategies
  - manipulated alpha trajectory
  - detection probability and shot requirements
- backend execution modes:
  - synchronous Aer execution
  - asynchronous IBM job submission and polling
  - Aer fallback when IBM is unavailable
- persistent async job system (SQLite) with status transitions and metadata
- modular UI architecture with shared design-system primitives (`ui/`)

## Architecture

### Frontend (React + TypeScript + Tailwind)

Main responsibilities:

- routing and page composition: `src/router`, `src/pages`
- shared app state/context: `src/state`, `src/hooks`
- domain logic and simulators: `src/physics`, `src/services`, `src/adversarial`
- UI primitives and feature components: `src/ui`, `src/components`

Current routed pages:

- `/dashboard` — high-level overview and entry points
- `/experiment` — primary run workflow (mode selection + run trigger + 1Q outputs)
- `/visualization` — grouped charting surface
- `/circuit` — circuit/physics and 2Q observables
- `/adversarial` — fake prover controls, attack curves, detection panel

### Backend (FastAPI + Qiskit)

Main responsibilities:

- REST API and request validation: `backend/main.py`
- execution orchestration and backend fallback: `backend/executor.py`
- Aer execution path: `backend/aer_executor.py`
- IBM Runtime execution path: `backend/ibm_executor.py`, `backend/ibm_client.py`
- measurement mapping and estimator prep: `backend/measurement_mapper.py`
- async jobs and SQLite store: `backend/jobs/job_executor.py`, `backend/jobs/job_store.py`

### End-to-end flow (high level)

```text
Frontend UI (pages/components)
        |
        | run mode + params (alpha, shots, backend)
        v
Frontend runner hooks/services
        |
  | local + backend-aware execution routing
        v
FastAPI /run
  |                \
  | backend=aer     \ backend=ibm
  v                  v
Sync execute      Queue async job
  |                  |
  v                  v
Immediate result   /job/{id} polling
        \          /
         \        /
          v      v
      UI state + charts + panels
```

## How To Run

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+
- pip

## 1) Frontend

From project root:

```bash
npm install
npm run dev
```

Vite dev server starts (default `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## 2) Backend

From project root:

```bash
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.main:app --reload --port 8000
```

Backend URL: `http://localhost:8000`

## 3) Optional environment variables (IBM)

Set these only if you want IBM Runtime execution:

```bash
export IBM_QUANTUM_TOKEN="your_token"
export IBM_QUANTUM_INSTANCE="optional_instance"
```

Notes:

- If IBM is unavailable or misconfigured, backend can fall back to Aer depending on endpoint path.
- The frontend supports both local simulation and FastAPI-backed execution through a unified routing layer.

## Usage

## Typical workflow

1. Open `/experiment`.
2. Choose execution mode (`1Q` or `2Q`).
3. Set alpha and shots.
4. Click `Run Experiment` (single trigger).
5. Observe result propagation:
   - 1Q results -> measurement and energy panels in `/experiment`
   - 1Q chart views -> `/visualization`
   - 2Q outputs -> `/circuit`

## What Run Experiment does

At the frontend state layer:

- updates runner status to `running`
- dispatches to 1Q or 2Q simulation path
- stores latest job id/backend metadata in state
- updates derived pages using shared context

## Adversarial mode

In `/adversarial`:

- configure adversarial strategy and epsilon bias
- compare honest vs manipulated energy trajectories
- inspect detectability metrics:
  - minimum shots required
  - detection probability
  - risk level classification

## API

Base URL (local): `http://localhost:8000`

## `POST /run`

Behavior:

- `backend="aer"` -> synchronous execution, returns full result immediately
- `backend="ibm"` -> asynchronous submission, returns queued job metadata

Request body:

```json
{
  "alpha": 0.1571,
  "shots": 1024,
  "backend": "aer"
}
```

Synchronous response example (Aer):

```json
{
  "alpha": 0.1571,
  "observables": {
    "Z1": -0.96,
    "Z2": 0.85,
    "Z1Z2": -0.82,
    "Z1X2": -0.14,
    "X1X2": 0.02
  },
  "noisyObservables": {
    "Z1": -0.96,
    "Z2": 0.85,
    "Z1Z2": -0.82,
    "Z1X2": -0.14,
    "X1X2": 0.02
  },
  "energy": 0.02,
  "energy_error": 0.08,
  "energy_theory": 0.0246,
  "verdict": "accept",
  "counts": {
    "000": 510,
    "100": 330,
    "111": 184
  },
  "probabilities": {
    "000": 0.498,
    "100": 0.322,
    "111": 0.180
  },
  "backendInfo": {
    "type": "aer",
    "shots": 1024,
    "executionTime": 22.4
  }
}
```

Asynchronous submission response example (IBM):

```json
{
  "job_id": "f42f1a1c-9f20-4f8e-a2ea-7fb2b9f9f03b",
  "status": "queued"
}
```

## `GET /job/{id}`

Returns job status and final result when available.

Response example:

```json
{
  "job_id": "f42f1a1c-9f20-4f8e-a2ea-7fb2b9f9f03b",
  "status": "done",
  "result": {
    "alpha": 0.9273,
    "energy": 0.63
  },
  "backend": "ibm",
  "metadata": {
    "created_at": "2026-04-13T10:00:00.000000+00:00",
    "updated_at": "2026-04-13T10:00:02.300000+00:00",
    "error": null,
    "execution_backend": "ibm"
  }
}
```

## `GET /status`

Service health and backend availability summary.

Response example:

```json
{
  "status": "ok",
  "execution_mode": "sync + async",
  "backends": {
    "aer": "active",
    "ibm": "connected"
  },
  "job_system": "active"
}
```

## `GET /backends`

Lists executable backend options and availability.

Response example:

```json
[
  { "name": "aer", "available": true },
  { "name": "ibm", "available": false }
]
```

## Protocol Alignment Analysis (Stricker et al. 2024)

This section documents the gap analysis between the implementation and the reference paper:
**"Towards experimental classical verification of quantum computation"** (Stricker et al., *Quantum Sci. Technol.* 9, 02LT01, 2024).

### What the paper implements

**Circuit (Fig. 1b, Appendix B):** 8-qubit circuit — `q_prover` (1), `q_clock` (1), `aux_prover` (3), `aux_clock` (3).

**Clock state (Step 2, Eq. 2):**
```
|η⟩ = (1/√2)[|0⟩_clk|0⟩_prov + |1⟩_clk · U(α)|0⟩_prov]
     = (1/√2)[|00⟩ + cos(α)|10⟩ + sin(α)|11⟩]
```
where `U(α) = cos(α)Z + sin(α)X`.

Prepared via: `H(q_clock)` → `CU(α)` decomposed as `RY(α/2) · CZ · RY(-α/2)` on `q_prover`.

**Hamiltonian (Eq. C.1):**

```
H = H_out + 6·H_in + 3·H_prop
  = 3.5·I − 2·Z₁ + Z₂ − Z₁Z₂ − 1.5cos(α)·Z₁X₂ − 1.5sin(α)·X₁X₂
```

**Three measurement circuits — (k₁,k₂):**

| Config | Observable extracted | Basis change |
|--------|---------------------|--------------|
| (0,0) | Z₁, Z₂, Z₁Z₂ | None (Z on all) |
| (0,1) | **Z₁X₂** | H on q_clock only |
| (1,1) | X₁X₂ | H on q_prover and q_clock |

Note: (1,0) is deliberately excluded — X₁Z₂ does not appear in H.

**Energy formula:**
```
E_est = 3.5 − 2⟨Z₁⟩ + ⟨Z₂⟩ − ⟨Z₁Z₂⟩ − 1.5cos(α)⟨Z₁X₂⟩ − 1.5sin(α)⟨X₁X₂⟩
```

**Acceptance criterion (Eq. D.7):**
```
E + σ_E < 0.4  → ACCEPTED  (honest quantum prover)
E − σ_E ≥ 0.5  → REJECTED
otherwise       → MARGINAL
```
**Low energy = honest prover = ACCEPTED.** High energy = REJECTED.

**Theoretical reference:** `⟨η|H|η⟩ = sin²(α)` — verified for all α in [0, π/2].

---

### U(α) Implementation: How the Rotation Works

#### What U(α) is — and what it is not

`U(α) = cos(α)·Z + sin(α)·X` is **not** a standard rotation gate. It is a linear combination of two Pauli operators, which evaluates to the matrix:

```
U(α) = [ cos α   sin α ]
       [ sin α  -cos α ]
```

- At α = 0 → pure Z (phase flip, no bit flip)
- At α = π/2 → pure X (bit flip, no phase flip)
- At intermediate angles → a continuously interpolated mix of both

This is physically different from `RY(α)` (= e^{−iαY/2}), which only rotates around the Y axis. `qc.cu(alpha, 0, 0, 0)` produces `U3(alpha,0,0) = RY(alpha)`, giving energy `sin²(α/2)` instead of the required `sin²(α)`.

#### Frontend — `hamiltonian.ts`

The matrix is computed directly as an analytic sum of Pauli matrices (no exponentials, no approximations):

```ts
// src/modules/oneQubit/physics/hamiltonian.ts
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

`buildClockState` then builds the 2-qubit entangled state:

```
|ψ⟩ = (1/√2)(|00⟩ + cos(α)|10⟩ + sin(α)|11⟩)
```

This is the clock state of Eq. 2 in Stricker et al. 2024.

#### Backend — `circuit_builder.py`

Qiskit has no native gate for `U(α) = cos(α)Z + sin(α)X`. The circuit uses the decomposition from Appendix B of the paper:

```
CU(α) = RY(+α/2) · CZ · RY(−α/2)   [on q_prover, controlled by q_clock]
```

```python
qc.ry(theta / 2, 0)   # RY(+α/2) on q_prover
qc.cz(1, 0)            # CZ: control=q_clock, target=q_prover
qc.ry(-theta / 2, 0)  # RY(-α/2) on q_prover
```

**Why this decomposition is correct:**

When the control qubit (q_clock) is |0⟩, CZ acts as identity → the two RY gates cancel → q_prover stays in |0⟩.

When the control is |1⟩, CZ applies Z to q_prover → the sequence becomes:

```
RY(+α/2) · Z · RY(−α/2) = cos(α)·Z + sin(α)·X = U(α)
```

This follows from the Lie algebra identity `e^{+iθY} Z e^{−iθY}` evaluated at θ = α/2, which rotates the Z axis toward X by angle 2θ = α in the ZX plane.

#### Frontend ↔ Backend consistency

Both implementations produce the same quantum state — one algebraically (TypeScript simulation) and one physically (Qiskit circuit on Aer or IBM hardware):

| Layer | Method | State on `q_prover` when clock = `|1⟩` |
|-------|--------|----------------------------------------|
| TS `buildU` | Direct matrix sum `c·Z + s·X` | `cos(α)|0⟩ + sin(α)|1⟩` |
| Python `build_circuit` | `RY(α/2) · CZ · RY(-α/2)` | `cos(α)|0⟩ + sin(α)|1⟩` |

The ideal energy of the resulting clock state is `⟨H⟩ = sin²(α)`, confirmed analytically and verified by both the local simulator and the Aer backend.

---



All six correctness bugs identified in the gap analysis have been fixed.

#### ~~B1~~ — ✅ CU(α) gate corrected [`backend/circuit_builder.py`]

`qc.cu(alpha, 0, 0, 0)` (= RY(α), wrong) replaced with the correct decomposition:
```python
qc.ry(alpha / 2, 0)   # RY(α/2) on q_prover
qc.cz(1, 0)           # CZ: control=q_clock, target=q_prover
qc.ry(-alpha / 2, 0)  # RY(-α/2) on q_prover
```
This produces `U(α) = cos(α)Z + sin(α)X` and the correct clock state `|η⟩`.

#### ~~B2~~ — ✅ Observable Z₁X₂ added across the full stack

Third measurement circuit `(k₁=0, k₂=1)` implemented end-to-end:
- `circuit_builder.py`: `basis="zx"` — H on q_clock only
- `measurement_mapper.py`: `_expectation_z1x2_from_zx_counts`; `map_measurements` accepts 3 count dicts
- `executor.py`: `_run_with_aer` / `_run_with_ibm` run all 3 circuits; response includes `Z1X2`
- `measurements.ts`: `OBS_Z1X2 = Z⊗X`; field in `ExactExpectations` / `SampledExpectations`
- `backendExperiment1Q.ts`: `BackendRunResult` and `SampledExpectations` carry `Z1X2`

#### ~~B3~~ — ✅ Hamiltonian corrected to 5-term formula (backend + frontend)

`backend/executor.py` (`_compute_energy`) and `src/physics/energy.ts` (`estimateEnergy`) now use:
```
E = 3.5 − 2·Z₁ + Z₂ − Z₁Z₂ − 1.5cos(α)·Z₁X₂ − 1.5sin(α)·X₁X₂
```

#### ~~B4~~ — ✅ Acceptance criterion corrected [`src/physics/energy.ts`]

`verifierDecision` now correctly maps `energy < 0.4 → "accept"`, `energy ≥ 0.5 → "reject"`.

#### ~~B5~~ — ✅ Reference α★ corrected [`src/utils/constants.ts`]

α★ changed from `0.9273` to `0.1 * (Math.PI / 2)` ≈ 0.1571 rad, where sin²(α★) ≈ 0.024 << 0.4 (reliably accepted).

#### ~~B6~~ — ✅ Statistical error propagation implemented

`backend/executor.py` adds `_compute_energy_error` (quadrature sum of per-observable shot noise) and `_verdict` (Eq. D.7 criterion). The `/run` response now includes `energy_error`, `energy_theory`, and `verdict`.

---

### Alignment status

| Paper concept | Python reference (`classical-quantum-verifier/`) | Dashboard backend | Dashboard frontend |
|---|---|---|---|
| U(α) = cos(α)Z + sin(α)X | ✅ RY(α/2)·CZ·RY(-α/2) | ✅ RY(α/2)·CZ·RY(-α/2) | — |
| `\|η⟩` clock state | ✅ | ✅ Correct state | ✅ `buildClockState` |
| 3 measurement circuits | ✅ | ✅ z, zx, x | — |
| Observable Z₁X₂ | ✅ | ✅ `Z1X2` in response | ✅ `OBS_Z1X2`, `Z1X2` field |
| Full 5-term Hamiltonian | ✅ | ✅ 5-term formula | ✅ 5-term formula |
| σ_E error propagation | ✅ quadrature sum | ✅ `energy_error` field | ⚠️ Not displayed in UI yet |
| E < 0.4 → ACCEPTED | ✅ | ✅ `verdict` field | ✅ `verifierDecision` fixed |
| α★ = 0.1·π/2 | ✅ | — | ✅ Corrected preset |
| λ_min(H) displayed | ✅ CLI | ❌ Missing | ❌ Missing |
| Alpha sweep | ✅ CLI `sweep.py` | ❌ No endpoint | ❌ No visualization |

---

### Fix roadmap

#### Phase 1 — Correctness ✅ DONE (April 2026)

| # | Fix | File(s) | Status |
|---|---|---|---|
| F1 | Correct CU(α): `RY(α/2)·CZ·RY(-α/2)` + add `zx` basis | `backend/circuit_builder.py` | ✅ |
| F2 | Add `_expectation_z1x2_from_zx_counts`, update `map_measurements` to 3 circuits | `backend/measurement_mapper.py` | ✅ |
| F3 | Correct `_compute_energy` (5 terms), add `_compute_energy_error`, `_verdict` | `backend/executor.py` | ✅ |
| F4 | Extend API response with `Z1X2`, `energy_error`, `energy_theory`, `verdict` | `backend/executor.py` | ✅ |
| F5 | Add `OBS_Z1X2`, field `Z1X2` to `ExactExpectations` / `SampledExpectations` | `src/physics/measurements.ts` | ✅ |
| F6 | Correct `estimateEnergy` (5 terms), correct `verifierDecision` (inverted) | `src/physics/energy.ts` | ✅ |
| F7 | Correct α★ preset, fix KeyAlpha insight text | `src/utils/constants.ts` | ✅ |
| F8 | Accept `Z1X2` in `BackendRunResult`, pass to `expectationValues` | `src/services/backendExperiment1Q.ts` | ✅ |

#### Phase 2 — Completeness (features present in the paper)

- `POST /sweep/alpha` — reproduce Figure 2(b): E_est ± σ vs α, 30 points
- `POST /sweep/shots` — convergence analysis
- `lambda_min` included in every `/run` response
- Alpha sweep chart in UI with error bars and threshold lines
- Error bar display in EnergyPanel

#### Phase 3 — Extensions ✅ DONE (April 2026)

- Real depolarizing noise via `AerSimulator + NoiseModel` (matching `classical-quantum-verifier/sweep.py`)
- Adversarial analysis at circuit level (run circuit with `alpha_fake`, compare bitstring distributions)
- Lambda sweep endpoint and visualization

| # | Fix | File(s) | Status |
|---|---|---|---|
| P3-1 | `run_circuit_noisy(circuit, shots, noise_p)` using `NoiseModel + depolarizing_error` | `backend/aer_executor.py` | ✅ |
| P3-2 | `sweep_noise(alpha, shots, lambda_list)` — sweeps λ with real Aer NoiseModel | `backend/executor.py` | ✅ |
| P3-3 | `run_adversarial_circuit(alpha, alpha_fake, shots)` — TVD, KL, ΔE between distributions | `backend/executor.py` | ✅ |
| P3-4 | `POST /sweep/noise` endpoint | `backend/main.py` | ✅ |
| P3-5 | `POST /adversarial/circuit` endpoint | `backend/main.py` | ✅ |
| P3-6 | `runNoiseSweep()` + `NoiseSweepBackendResult` types | `src/services/sweepApi.ts` | ✅ |
| P3-7 | `runAdversarialCircuit()` + `AdversarialCircuitResult` types | `src/services/adversarialApi.ts` | ✅ |
| P3-8 | `NoiseSweepBackendPanel` — real Aer noise sweep chart with error bars | `src/components/NoiseSweepBackendPanel/` | ✅ |
| P3-9 | `AdversarialCircuitPanel` — grouped bar chart + TVD / KL / ΔE metrics | `src/components/AdversarialCircuitPanel/` | ✅ |
| P3-10 | Integrate Phase 3 panels into `/adversarial` page | `src/pages/AdversarialPage.tsx` | ✅ |

---

## Roadmap

- improve IBM async handling (timeouts, retries, cancellation policies)
- add error mitigation and calibration-aware execution options
- add configurable random seeds in UI for deterministic replay
- add richer protocol presets and comparative experiment templates

## Known Limitations

- IBM Runtime latency is highly variable and provider-dependent.
- Job cancellation endpoint is not yet exposed by backend (UI supports retry/dismiss only).
- Physics model is intentionally simplified for interactive exploration.
- No authentication/authorization layer is implemented.
- No multi-user isolation model for jobs/results.

## Delivery Summary

The previous GAP ANALYSIS workstream has been completed. Key delivered improvements:

- Unified execution routing across local simulation and FastAPI backends.
- Backend/frontend backend-name normalization through shared mapping helpers.
- Persistent run timeline with restore and clear-history actions.
- Explicit data provenance indicators across result surfaces.
- Non-blocking IBM async workflow with submit, background polling, retry, and dismiss controls.
- SQLite-backed durable job store with configurable DB path.
- `/jobs` pagination plus server-side filtering (`status`, `backend`, `mode`).
- Normalized API error envelope (`code`, `message`, `details`) consumed by a shared frontend client.
- Route-level lazy loading and vendor chunk splitting for improved bundle behavior.
- Frontend/backend contract and integration test suites with documented quality gates.

## Testing

The project includes a comprehensive testing suite with contract and integration tests.

**Quick start:**

```bash
# Frontend tests (Vitest)
npm install              # Includes test dependencies
npm test                 # Run in watch mode
npm run test:run         # Run once (CI)

# Backend tests (pytest)
pip install pytest pytest-asyncio httpx
pytest                   # Run all tests
pytest -v                # Verbose
pytest -m contract       # Only contract tests
pytest -m integration    # Only integration tests
```

**Quality gates** (must pass before merging):

```bash
npx tsc --noEmit         # Type check
npm run lint             # Lint
npm run test:run         # Frontend tests
npm run test:backend     # Backend tests
npm run test:backend:strict  # Backend tests with warnings-as-errors
npm run build            # Production build (no warnings)
```

See [TESTING.md](TESTING.md) for detailed testing documentation, test categories, troubleshooting, and CI workflow.

## Contributing

Contributions are welcome.

Recommended process:

1. Open an issue describing the change.
2. Fork and create a feature branch.
3. Keep PRs scoped (UI, backend, or docs).
4. Run local checks before opening PR:

```bash
npm run lint
npm run build
npm run test:run
npm run test:backend
npm run test:backend:strict
```

For backend changes, also run FastAPI locally and validate endpoint behavior.

## License

No license file is currently present in the repository.

If you plan to publish or accept external contributions, add an explicit license (for example MIT, Apache-2.0, or GPL-3.0).
