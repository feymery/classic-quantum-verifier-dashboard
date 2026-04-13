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
  "alpha": 0.9273,
  "shots": 1024,
  "backend": "aer"
}
```

Synchronous response example (Aer):

```json
{
  "alpha": 0.9273,
  "observables": {
    "Z1": 0.09,
    "Z2": 0.08,
    "Z1Z2": 0.65,
    "X1X2": 0.41
  },
  "noisyObservables": {
    "Z1": 0.09,
    "Z2": 0.08,
    "Z1Z2": 0.65,
    "X1X2": 0.41
  },
  "energy": 0.63,
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
