# Backend

FastAPI backend for the Quantum Verification Playground.
Provides quantum circuit execution via Qiskit Aer and IBM Quantum Runtime, an async job system.
REST API consumed by the React frontend.

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
| `qiskit` | Circuit definition |
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

## Environment variables

All variables are optional. The backend runs fully without them using Aer.

| Variable | Description |
| --- | --- |
| `IBM_QUANTUM_TOKEN` | IBM Quantum API token — required for `backend=ibm` execution |
| `IBM_QUANTUM_INSTANCE` | IBM Quantum instance (e.g. `ibm-q/open/main`) — optional |

Without IBM credentials, all `/run` requests with `backend=ibm` are queued and will fail at execution time.
Aer execution is unaffected.

---

## Module overview

``` text
backend/
├── main.py               # FastAPI app, all route definitions
├── executor.py           # Orchestration: runExperiment, sweep_*, run_adversarial_circuit
├── aer_executor.py       # Qiskit Aer execution paths (sync + noisy)
├── ibm_executor.py       # IBM Runtime submission and result polling
├── ibm_client.py         # IBMClient connection wrapper
├── circuit_builder.py    # Builds Qiskit circuits for 1Q/2Q and all measurement bases
├── measurement_mapper.py # Maps raw bitstring counts to observable expectation values
└── jobs/
    ├── job_store.py      # SQLite-backed persistent job store
    └── job_executor.py   # ThreadPool-based async job execution
```

### Execution flow

**Synchronous (Aer):**

``` text
POST /run {backend="aer"}
  → executor.runExperiment()
  → aer_executor.run_circuit()          # 3 circuits (zz, zx, xx bases)
  → measurement_mapper.map_measurements()
  → _compute_energy() + _compute_energy_error() + _verdict()
  → response
```

**Asynchronous (IBM):**

``` text
POST /run {backend="ibm"}
  → executor.submitExperimentJob()
  → job_store.create_job()             # status: "pending"
  → ThreadPool: ibm_executor.run()     # status: "running" → "done"/"failed"
  → GET /job/{id}                      # poll until done
```

### Quantum circuit

The 1Q circuit implements the verification protocol from Stricker et al. 2024:

- **State prep:** `H(q_clock)` → `CU(α)` via `RY(α/2) · CZ · RY(-α/2)` on `q_prover`
- **3 measurement bases:** ZZ (basis `zz`), Z₁X₂ (basis `zx`), X₁X₂ (basis `xx`)
- **Energy formula:** `E = 3.5 − 2⟨Z₁⟩ + ⟨Z₂⟩ − ⟨Z₁Z₂⟩ − 1.5cos(α)⟨Z₁X₂⟩ − 1.5sin(α)⟨X₁X₂⟩`

See [docs/protocol.md](../docs/protocol.md) for the full protocol analysis.

---

## API reference

See [docs/api.md](../docs/api.md) for all endpoints, request/response shapes, and error format.

Quick list:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/status` | Service health and backend availability |
| `GET` | `/backends` | List available execution backends |
| `POST` | `/run` | Run experiment (sync Aer or async IBM) |
| `GET` | `/job/{id}` | Get job status and result |
| `GET` | `/jobs` | List jobs with optional filters |
| `POST` | `/sweep/alpha` | Sweep α ∈ [0, π/2] at fixed shots |
| `POST` | `/sweep/shots` | Sweep shot counts at fixed α |
| `POST` | `/sweep/noise` | Sweep depolarizing noise λ at fixed α |
| `POST` | `/adversarial/circuit` | Compare honest vs adversarial circuit distributions |

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
python3 -m pytest backend/tests -m unit

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

Contract tests verify the API shape that the frontend depends on.
Break a contract test = the frontend will likely break too.
