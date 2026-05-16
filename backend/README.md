# Backend

FastAPI backend for the Quantum Verification Playground.
Executes quantum circuits via Qiskit Aer (local) and IBM Quantum Runtime (hardware/cloud).
Exposes a REST API consumed by the React frontend.

---

## Requirements

- Python 3.11+
- pip

Dependencies (from `requirements.txt`):

| Package | Purpose |
| --- | --- |
| `fastapi` | REST API framework |
| `uvicorn` | ASGI server |
| `pydantic v2` | Request/response validation |
| `qiskit` | Circuit definition and transpilation |
| `qiskit-aer` | Local quantum simulator |
| `qiskit-ibm-runtime` | IBM Quantum execution (optional) |

---

## Installation

From the project root:

```bash
python3 -m pip install -r backend/requirements.txt
```

---

## Running

```bash
python3 -m uvicorn backend.main:app --reload --port 8000
```

- API base URL: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

The `--reload` flag restarts the server on file changes (development only).

---

## IBM credentials

IBM credentials are optional. Without them all execution uses Aer.

Credentials are configured at runtime via `POST /configure/ibm` — they are never read from environment variables and are never persisted to disk.

| Field | Description |
| --- | --- |
| `token` | IBM Cloud API token |
| `instance` | IBM Cloud CRN: `crn:v1:bluemix:public:quantum-computing:<region>:a/<account>:<service>::` |
| `backend_name` | QPU name, e.g. `ibm_strasbourg` |
| `verify` | If `true`, attempts a connection check immediately and returns the result |

The singleton `IBMClient` holds the connection for the lifetime of the server process and is invalidated only when new credentials are submitted.

---

## Module overview

```text
backend/
├── main.py                  # FastAPI app, CORS, logging config
├── errors.py                # Error envelope and exception handlers
├── math/
│   ├── energy.py            # Canonical Hamiltonian energy formula (Eq. C.1)
│   ├── measurement_mapper.py# Maps raw bitstring counts to observable expectation values
│   ├── sweeps.py            # sweep_alpha, sweep_shots, sweep_noise orchestration
│   └── verifier.py          # Verifier decision thresholds
├── qiskit/
│   ├── circuit_builder.py   # Builds Qiskit circuits for all three measurement bases
│   └── executor.py          # Qiskit Aer execution (generic noise model + QPU-noise variant)
├── routers/
│   ├── ibm.py               # /status, /backends, /configure/ibm
│   ├── ibm_client.py        # IBMClient singleton — manages QiskitRuntimeService connection
│   ├── run.py               # /run, /job/{id}, /jobs, DELETE /jobs
│   └── sweep.py             # /sweep/alpha, /sweep/shots, /sweep/noise
└── jobs/
    ├── job_store.py         # SQLite-backed job store (pending → running → done/failed)
    └── job_runner.py        # ThreadPool-based async job execution (separate pools for IBM and Aer)
```

### Execution flow

**Synchronous (`backend=aer`):**

```text
POST /run {backend="aer"}
  → experiment_runner.runExperimentSync()
  → aer_executor.run_circuit()           # 3 circuits: Z, ZX, X bases
  → measurement_mapper.map_measurements()
  → energy.compute_energy()
  → response
```

**Asynchronous (`backend=ibm`):**

```text
POST /run {backend="ibm"}
  → experiment_runner.submitExperimentJob()
  → job_store.create_job()              # status: "pending"
  → IBM ThreadPool: job_runner.run_job_async()
      → ibm_executor.run_circuit() × 3  # Z, ZX, X — transpiled to QPU ISA
      → energy.compute_energy()
      → job_store.update_job()          # status: "done" or "failed"
  → GET /job/{id}                       # client polls until done
```

IBM and Aer jobs run in separate thread pools so long-running QPU jobs cannot starve fast Aer jobs.

### Quantum circuit

The 1Q circuit implements the verification protocol from Stricker et al. 2024:

- **State prep:** `H(q_clock)` → `CRY(2α)` (ctrl = `q_clock`, tgt = `q_prover`)
- **3 measurement bases:** Z⊗Z (`z`), Z⊗X (`zx`), X⊗X (`x`)
- **Energy formula (Eq. C.1):** $E = 3.5 - 2\langle Z_1\rangle + \langle Z_2\rangle - \langle Z_1Z_2\rangle - 1.5\cos(\alpha)\langle Z_1X_2\rangle - 1.5\sin(\alpha)\langle X_1X_2\rangle$

See [docs/protocol.md](../docs/protocol.md) for the full protocol analysis.

---

## API reference

See [docs/api.md](../docs/api.md) for all endpoints, request/response shapes, and error format.

Quick list:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/status` | Service health and IBM connection state |
| `GET` | `/backends` | List available execution backends |
| `POST` | `/configure/ibm` | Store IBM credentials (optionally verify connection) |
| `POST` | `/run` | Run experiment — returns result (Aer) or job ID (IBM) |
| `GET` | `/job/{id}` | Get job status and result |
| `GET` | `/jobs` | List jobs with optional filters |
| `DELETE` | `/jobs` | Clear all job history |
| `POST` | `/sweep/alpha` | Sweep α ∈ [0, π/2] at fixed shots |
| `POST` | `/sweep/shots` | Sweep shot counts at fixed α |
| `POST` | `/sweep/noise` | Sweep depolarizing noise λ at fixed α |

---

## Error format

All errors follow a consistent envelope:

```json
{
  "error": {
    "code": "job-not-found",
    "message": "Requested job does not exist.",
    "details": { "job_id": "abc123" }
  }
}
```

| HTTP status | When |
| --- | --- |
| `400` | Bad request (manually raised) |
| `404` | Resource not found (e.g. unknown `job_id`) |
| `422` | Request validation error (Pydantic) |
| `500` | Unexpected server error |

---

## Testing

Tests live in `backend/tests/` and are run with pytest (configured in `pytest.ini` at project root).

```bash
# From project root
python3 -m pytest backend/tests -q

# Verbose
python3 -m pytest backend/tests -v

# By marker
python3 -m pytest backend/tests -m contract
python3 -m pytest backend/tests -m integration

# Warnings as errors (CI)
python3 -m pytest backend/tests -q -W error
```

Or using the npm scripts:

```bash
npm run test:backend
npm run test:backend:strict
```

### Test structure

| File | Marker | What it covers |
| --- | --- | --- |
| `test_api_contract.py` | `contract` | Response shape, required fields, field types |
| `test_api_integration.py` | `integration` | Endpoint behavior, status codes, edge cases |
| `conftest.py` | — | Shared fixtures: `client`, `sample_1q_params`, etc. |

Contract tests verify the API shape the frontend depends on.
Breaking a contract test means the frontend will likely break too.
