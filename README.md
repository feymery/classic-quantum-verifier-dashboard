# Quantum Verification Playground

Interactive platform for quantum protocol simulation, verification, and adversarial analysis.

**Stack:** React 19 + TypeScript + Tailwind v4 — FastAPI + Qiskit Aer + IBM Runtime

---

## Documentation

| Document | Contents |
| --- | --- |
| This file | Project overview, quick start, frontend scripts, structure |
| [backend/README.md](backend/README.md) | Backend installation, execution, Qiskit paths, testing |
| [docs/api.md](docs/api.md) | Full API reference — all endpoints, shapes, errors |
| [docs/protocol.md](docs/protocol.md) | Protocol alignment analysis (Stricker et al. 2024) |

---

## Quick Start

**Prerequisites:** Node.js 20+, npm 10+, Python 3.11+

```bash
# Terminal 1 — frontend
npm install
npm run dev
```

```bash
# Terminal 2 — backend
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.main:app --reload --port 8000
```

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:8000>
- Interactive API docs (Swagger): <http://localhost:8000/docs>

---

## Stack at a glance

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend UI | React 19 + TypeScript + Tailwind v4 | Modular pages, production build verified |
| Charts | Recharts | Energy, histogram, sweep, adversarial plots |
| Backend API | FastAPI + Pydantic v2 | 9 endpoints, full OpenAPI schema at `/docs` |
| Quantum execution | Qiskit Aer + IBM Runtime | Aer stable; IBM optional via async job queue |
| Job system | ThreadPool + SQLite | Persistent job metadata with status transitions |

---

## Project Structure

``` text
.
├── src/                     # React frontend
│   ├── components/          # Shared and feature components (charts, panels)
│   ├── modules/             # Domain modules
│   │   ├── oneQubit/        # 1Q physics, services, components, pages
│   │   ├── twoQubit/        # 2Q physics, services, components, pages
│   │   ├── adversarial/     # Adversarial analysis module
│   │   └── traps/           # Trap-based verification module
│   ├── pages/               # Routed page components
│   ├── physics/             # Shared physics: energy, noise
│   ├── services/            # API client, sweep API
│   ├── state/               # App-wide context and hooks
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Design-system primitives (Button, Card, Badge…)
│   └── utils/               # Constants, alpha utils, RNG
├── backend/                 # FastAPI backend — see backend/README.md
├── docs/                    # Supplementary documentation
├── public/                  # Static assets
├── index.html
├── vite.config.ts
└── package.json
```

---

## Frontend

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server (<http://localhost:5173>) |
| `npm run build` | TypeScript check + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once (CI) |
| `npm run test:coverage` | Coverage report |
| `npm run lint` | ESLint check |

### Environment and proxy

In development, the Vite server proxies `/api/*` → `http://localhost:8000` (configured in `vite.config.ts`).
No `.env` file is required for local development.

For production deployments, configure your reverse proxy or hosting platform to route `/api/*` to the backend.

### Pages

| Route | Description |
| --- | --- |
| `/dashboard` | High-level overview and entry points |
| `/1Qexperiment` | Experiment 1Q — parameters, execution, measurement output |
| `/visualization` | Chart surface — energy curves, histograms, sweep plots |
| `/2Qcircuit` | 2Q Circuit — circuit/physics view and 2Q observables |
| `/adversarial` | Fake prover controls, attack curves, detection analysis |
| `/traps` | Trap-based verification module |

### Design system

UI primitives live in `src/ui/`.
All colors, fonts, shadows, and spacing are defined as CSS custom properties in `src/index.css` under `@theme`.
To retheme the app, edit that block — Tailwind generates utilities from it automatically.

---

## How the experiment runs (end-to-end)

``` text
User clicks Run Experiment
        │
        ▼
useExperimentRunner (hook)
        │
  mode = 1Q ──────────────────► local TypeScript simulator
        │                        (src/modules/oneQubit/services/)
        │ backend available
        ▼
POST /api/run  {alpha, shots, backend, mode}
        │
  backend=aer ──► sync execution → full result
  backend=ibm ──► job queued  → poll GET /api/job/{id}
        │
        ▼
App state updated → all panels and charts re-render
```

---

## Testing

```bash
# Frontend (Vitest)
npm run test:run

# Backend (pytest)
npm run test:backend

# Backend — warnings as errors
npm run test:backend:strict
```

Backend tests are split into three markers: `unit`, `integration`, `contract`.
See [backend/README.md](backend/README.md#testing) for details.

---

## Roadmap

- improve IBM async handling (timeouts, retries, cancellation policies)
- add error mitigation and calibration-aware execution options
- add configurable random seeds in UI for deterministic replay
- add richer protocol presets and comparative experiment templates

## Known limitations

- IBM Runtime latency is highly variable and provider-dependent.
- Job cancellation is not yet exposed by the backend (UI supports retry/dismiss only).
- Physics model is intentionally simplified for interactive exploration.
- No authentication or multi-user isolation — single-user local/dev model.

## Protocol alignment

This implementation is based on:

> **"Towards experimental classical verification of quantum computation"**
> Stricker et al., *Quantum Sci. Technol.* 9, 02LT01, 2024

Full alignment analysis, U(α) decomposition, fix history, and paper-vs-implementation table are in [docs/protocol.md](docs/protocol.md).

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
