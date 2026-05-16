# Classic-Quantum Verifier Dashboard

Interactive dashboard for exploring and running the **one-qubit quantum verification protocol** described in *"Towards experimental classical verification of quantum computation"* (Roman Stricker et al., *Quantum Sci. Technol.* 9, 02LT01, 2024).

The protocol lets a classical verifier confirm that a quantum device (the prover) is genuinely producing quantum states — without needing to simulate the full quantum computation. An honest quantum prover achieves an energy below the acceptance threshold; a classical prover cannot replicate the required coherence and is detected.

---

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Charts | Recharts |
| Routing | React Router v7 |
| Backend | FastAPI + Uvicorn (Python 3.11+) |
| Quantum simulation | Qiskit Aer (local) |
| QPU execution | Qiskit IBM Runtime (optional) |
| Frontend tests | Vitest + Testing Library + MSW |
| Backend tests | pytest |

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/feymery/classic-quantum-verifier-dashboard.git
cd classic-quantum-verifier-dashboard

# 2. Install Node dependencies
npm install

# 3. Install Python dependencies
python3 -m pip install -r backend/requirements.txt
```

---

## Running

### Full stack (recommended)

Starts the FastAPI backend and Vite dev server in parallel:

```bash
npm run start
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

### Individually

```bash
# Frontend only
npm run dev

# Backend only
python3 -m uvicorn backend.main:app --reload --port 8000
```

---

## Pages

| Route | Description |
| --- | --- |
| `/fundamentals` | Protocol explainer, circuit diagram, and noise / sweep plots |
| `/1Qexperiment` | Live 1-qubit experiment: run circuits, inspect energy and measurement results |
| `/traps` | Trap-state analysis (adversarial / detection panel) |

---

## IBM Quantum (optional)

IBM credentials are configured at runtime via `POST /configure/ibm` — they are never stored to disk or read from environment variables.

| Field | Description |
| --- | --- |
| `token` | IBM Cloud API token |
| `instance` | IBM Cloud CRN (`crn:v1:bluemix:public:quantum-computing:...`) |
| `backend_name` | QPU name, e.g. `ibm_strasbourg` |
| `verify` | If `true`, attempts a live connection check immediately |

Without IBM credentials all execution falls back to the local Aer simulator.

---

## Quantum Protocol

The 1-qubit circuit implements:

1. **State prep:** `H` on `q_clock` → `CRY(2α)` (ctrl = `q_clock`, tgt = `q_prover`)
2. **3 measurement bases:** Z⊗Z, Z⊗X, X⊗X
3. **Energy formula (Eq. C.1):**

$$E = 3.5\,I - 2\,Z_1 + Z_2 - Z_1Z_2 - 1.5\cos(\alpha)\,Z_1X_2 - 1.5\sin(\alpha)\,X_1X_2$$

An honest prover achieves $E < E_{\text{threshold}}$. See [docs/protocol.md](docs/protocol.md) for the full derivation.

**Parameter range:** $\alpha \in [0,\, \pi/2]$

---

## API Reference

Full endpoint docs: [docs/api.md](docs/api.md) or `http://localhost:8000/docs`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/status` | Service health and IBM connection state |
| `GET` | `/backends` | List available execution backends |
| `POST` | `/configure/ibm` | Store IBM credentials |
| `POST` | `/run` | Run experiment (Aer → sync result, IBM → job ID) |
| `GET` | `/job/{id}` | Poll job status and result |
| `GET` | `/jobs` | List all jobs |
| `DELETE` | `/jobs` | Clear job history |
| `POST` | `/sweep/alpha` | Sweep α ∈ [0, π/2] at fixed shots |
| `POST` | `/sweep/shots` | Sweep shot counts at fixed α |
| `POST` | `/sweep/noise` | Sweep depolarizing noise λ at fixed α |

---

## Testing

```bash
# Frontend unit tests
npm run test

# Frontend tests (single run)
npm run test:run

# Frontend tests with coverage
npm run test:coverage

# Backend tests
npm run test:backend

# Backend tests — warnings as errors (CI mode)
npm run test:backend:strict
```

Backend tests live in `backend/tests/` and are split by marker:

```bash
python3 -m pytest backend/tests -m contract    # API contract tests
python3 -m pytest backend/tests -m integration # Integration tests
```

---

## Project Structure

```text
├── src/                        # React frontend
│   ├── components/             # Shared UI components (charts, controls, circuit diagram)
│   ├── modules/
│   │   ├── oneQubit/           # 1-qubit physics, simulation, and components
│   │   └── traps/              # Trap-state / adversarial detection
│   ├── pages/                  # Route-level page components
│   ├── physics/                # Shared energy and noise formulas (TypeScript)
│   ├── services/               # API client and sweep API
│   ├── state/                  # App-wide React context
│   ├── types/                  # Shared TypeScript types
│   └── ui/                     # Design system primitives (Button, Card, Modal…)
├── backend/                    # FastAPI backend
│   ├── math/                   # Hamiltonian energy, measurement mapper, sweeps, verifier
│   ├── qiskit/                 # Circuit builder and Aer/IBM executor
│   ├── routers/                # FastAPI routers (run, sweep, ibm)
│   └── jobs/                   # In-memory job store and thread-pool runner
└── docs/                       # Protocol and API reference
```

---

## License

Private repository — all rights reserved.
