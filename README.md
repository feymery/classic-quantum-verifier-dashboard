# Quantum Verification Dashboard

Interactive companion to the one-qubit classical verification protocol from:

> **"Towards experimental classical verification of quantum computation"**
> Roman Stricker et al., *Quantum Sci. Technol.* 9, 02LT01, 2024

The dashboard lets you prepare a parameterised clock state, measure its Hamiltonian energy,
and observe in real time whether the verifier accepts or rejects the prover.

**Stack:** React 19 + TypeScript + Tailwind v4 — FastAPI + Qiskit Aer + IBM Quantum Runtime

---

## Documentation

| Document | Contents |
|---|---|
| This file | Project overview, quick start, scripts, structure |
| [backend/README.md](backend/README.md) | Backend installation, Qiskit details, testing |
| [docs/api.md](docs/api.md) | Full API reference — all endpoints, shapes, errors |
| [docs/protocol.md](docs/protocol.md) | Protocol alignment with Stricker et al. 2024 |

---

## Quick Start

**Prerequisites:** Node.js 20+, npm 10+, Python 3.11+

### Option A — unified (frontend + backend together)

```bash
npm install
python3 -m pip install -r backend/requirements.txt
npm start
```

`npm start` uses `concurrently` to run both servers in one terminal.

### Option B — separate terminals

```bash
# Terminal 1 — backend
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.main:app --reload --port 8000

# Terminal 2 — frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | <http://localhost:5173> |
| Backend API | <http://localhost:8000> |
| Swagger UI | <http://localhost:8000/docs> |

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend UI | React 19 + TypeScript + Tailwind v4 | Lazy-loaded routes, Suspense fallbacks |
| Charts | Recharts 3 | Energy, histogram, alpha sweep, noise plots |
| Backend API | FastAPI + Pydantic v2 | OpenAPI schema at `/docs` |
| Quantum execution | Qiskit Aer + IBM Runtime | Aer local; IBM via async job queue |
| Job system | ThreadPoolExecutor + in-memory store | Separate pools for Aer and IBM |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/fundamentals` | Fundamentals | Protocol guide, noise model panel |
| `/1Qexperiment` | Experiment | α / shots controls, energy readout, measurement panel |
| `/visualization` | Visualization | Energy plot, alpha sweep chart |
| `/traps` | Traps | Dishonest-prover trap scenarios |

---

## Scripts

### Frontend

| Script | Command | Description |
|---|---|---|
| `npm start` | `concurrently uvicorn vite` | Run backend + frontend together |
| `npm run dev` | `vite` | Frontend dev server only |
| `npm run build` | `tsc -b && vite build` | Production build |
| `npm run preview` | `vite preview` | Preview production build locally |
| `npm run lint` | `eslint .` | Lint all TypeScript files |
| `npm test` | `vitest` | Frontend tests (watch mode) |
| `npm run test:run` | `vitest run` | Frontend tests (single run) |
| `npm run test:coverage` | `vitest run --coverage` | Coverage report |

### Backend

| Script | Command | Description |
|---|---|---|
| `npm run test:backend` | `pytest backend/tests -q` | Backend tests |
| `npm run test:backend:strict` | `pytest backend/tests -q -W error` | Backend tests, warnings as errors |

---

## Project Structure

```text
.
├── src/                        # React frontend
│   ├── components/             # Shared feature components (charts, panels, header)
│   ├── modules/
│   │   ├── oneQubit/           # 1Q physics, services, components, pages
│   │   └── traps/              # Trap-based verification scenarios
│   ├── pages/                  # Routed page components
│   │   ├── FundamentalsPage.tsx
│   │   ├── ExperimentPage.tsx
│   │   ├── VisualizationPage.tsx
│   │   └── TrapsPage.tsx
│   ├── physics/                # Shared physics: energy.ts, noise.ts
│   ├── router/                 # React Router config + lazy page imports
│   ├── services/               # API client, sweep API
│   ├── state/                  # App-wide context (AppStateContext)
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Design-system primitives (Button, Card, Badge…)
│   └── utils/                  # Constants, alpha utils, physics helpers, RNG
├── backend/                    # FastAPI backend — see backend/README.md
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── math/                   # Energy, measurement mapper, sweeps, verifier
│   ├── qiskit/                 # Circuit builder, Aer executor
│   ├── routers/                # /run, /sweep, /ibm endpoints
│   └── jobs/                   # Async job store and runner
├── docs/
│   ├── api.md                  # API reference
│   └── protocol.md             # Protocol alignment analysis
├── src/test/                   # Frontend tests (Vitest + MSW)
│   ├── api.contract.test.ts    # API contract tests
│   └── e2e.integration.test.ts # End-to-end workflow tests
├── index.html
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

---

## Backend API — Quick Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/status` | Service health and IBM connection state |
| `GET` | `/backends` | List available execution backends |
| `POST` | `/configure/ibm` | Store IBM credentials |
| `POST` | `/run` | Run experiment (Aer: sync; IBM: async job) |
| `GET` | `/job/{id}` | Poll job status and result |
| `GET` | `/jobs` | List jobs with optional filters |
| `DELETE` | `/jobs` | Clear all job history |
| `POST` | `/sweep/alpha` | Sweep α ∈ [0, π/2] at fixed shots |
| `POST` | `/sweep/shots` | Sweep shot counts at fixed α |
| `POST` | `/sweep/noise` | Sweep depolarizing noise λ at fixed α |

Full details including request/response shapes and error format: [docs/api.md](docs/api.md).

---

## Protocol — Key Facts

The prover builds the two-qubit **clock state** $|\eta(\alpha)\rangle$ via `H(q_clock) → CRY(2α)`.
The verifier estimates the Hamiltonian energy:

$$
E = 3.5 - 2\langle Z_1\rangle + \langle Z_2\rangle - \langle Z_1 Z_2\rangle
    - 1.5\cos\alpha\;\langle Z_1 X_2\rangle - 1.5\sin\alpha\;\langle X_1 X_2\rangle
$$

Theoretical minimum: $E_\text{theory} = \sin^2\alpha$.

| Verdict | Condition |
|---|---|
| **accept** | $E < 0.4$ |
| **boundary** | $0.4 \leq E < 0.5$ |
| **reject** | $E \geq 0.5$ |

Full protocol specification: [docs/protocol.md](docs/protocol.md).

---

## IBM Quantum (optional)

IBM credentials are configured at runtime via `POST /configure/ibm` — never via environment
variables, never persisted to disk. Without credentials all execution uses local Aer simulation.

```json
{
  "token": "<IBM Cloud API token>",
  "instance": "crn:v1:bluemix:public:quantum-computing:<region>:a/<account>:<service>::",
  "backend_name": "ibm_strasbourg"
}
```

IBM jobs are queued asynchronously. Poll `GET /job/{id}` until `status` is `"done"` or `"failed"`.
