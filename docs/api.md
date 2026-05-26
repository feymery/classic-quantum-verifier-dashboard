# API Reference

Base URL (local development): `http://localhost:8000`

Interactive docs (Swagger UI): `http://localhost:8000/docs`

All request bodies are JSON. All responses are JSON.

---

## Error format

Every error response — regardless of status code — uses this envelope:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": null | object | array | string
  }
}
```

| Status | Code | When |
| --- | --- | --- |
| `404` | `job-not-found` | `job_id` does not exist in the store |
| `422` | `validation-error` | Pydantic validation failure — `details` contains field-level errors |
| `500` | `internal-error` | Unexpected server error |

---

## Endpoints

### `GET /status`

Service health and backend availability.

#### Response

```json
{
  "status": "ok",
  "execution_mode": "sync + async",
  "backends": {
    "aer": "active",
    "aer_qpu": "connected" | "disconnected",
    "ibm": "connected" | "disconnected"
  },
  "job_system": "active"
}
```

---

### `GET /backends`

List available execution backends.

#### Response

```json
[
  { "name": "aer",     "available": true },
  { "name": "aer_qpu", "available": false },
  { "name": "ibm",     "available": false }
]
```

---

### `POST /configure/ibm`

Store IBM Quantum credentials for the lifetime of the server process.
Credentials are held only in memory — never logged or persisted to disk.

Pass `verify: true` to trigger a live connection check immediately.
Omit it (or set `false`) when restoring saved credentials on startup to avoid unnecessary network calls.

#### Request

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `token` | string | ✅ | — | IBM Cloud API token |
| `instance` | string | — | `""` | IBM Cloud CRN: `crn:v1:bluemix:public:quantum-computing:<region>:a/<account>:<service>::` |
| `backend_name` | string | — | `""` | QPU name, e.g. `ibm_strasbourg` |
| `verify` | bool | — | `false` | If `true`, attempts a live connection check and returns the result |

```json
{
  "token": "<IBM_API_TOKEN>",
  "instance": "crn:v1:bluemix:public:quantum-computing:us-east:a/abc:def::",
  "backend_name": "ibm_strasbourg",
  "verify": true
}
```

#### Response

```json
{
  "configured": true,
  "connected": true,
  "reason": "Connected to ibm_strasbourg"
}
```

When `verify` is `false`:

```json
{
  "configured": true,
  "connected": false,
  "reason": "Credentials stored. Send verify=true to test the connection."
}
```

---

### `POST /run`

Run a quantum experiment.

- `backend="aer"` → synchronous Aer execution, returns full result immediately.
- `backend="ibm"` → queues an async IBM job, returns job metadata.
  Poll `GET /job/{id}` for the result.

#### Request

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `alpha` | float | ✅ | — | Protocol angle α ∈ [0, π/2] |
| `shots` | int | ✅ | — | 1 – 1,000,000 |
| `backend` | `"aer"` \| `"aer_qpu"` \| `"ibm"` | — | `"aer"` | Execution backend |

```json
{
  "alpha": 0.1571,
  "shots": 1024,
  "backend": "aer"
}
```

#### Response — synchronous (Aer)

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
  "energy": 0.024,
  "energy_error": 0.08,
  "energy_theory": 0.0246,
  "verdict": "accept",
  "counts": { "000": 510, "100": 330, "111": 184 },
  "probabilities": { "000": 0.498, "100": 0.322, "111": 0.180 },
  "backendInfo": {
    "type": "aer",
    "shots": 1024,
    "executionTime": 22.4
  }
}
```

| Field | Description |
| --- | --- |
| `observables` | Ideal (noiseless) expectation values |
| `noisyObservables` | Expectation values with applied noise model |
| `energy` | Estimated energy from the 5-term Hamiltonian |
| `energy_error` | Statistical error σ_E (quadrature sum over observables) |
| `energy_theory` | Analytic reference: `sin²(α)` |
| `verdict` | `"accept"` / `"reject"` / `"boundary"` based on energy thresholds |

#### Response — async submission (IBM)

```json
{
  "job_id": "f42f1a1c-9f20-4f8e-a2ea-7fb2b9f9f03b",
  "status": "queued"
}
```

Poll `GET /job/{job_id}` until `status` is `"done"` or `"failed"`.

---

### `GET /job/{job_id}`

Get the status and result of a queued job.

**Path parameter:** `job_id` — UUID string returned by `POST /run` with `backend=ibm`.

#### Response

```json
{
  "job_id": "f42f1a1c-9f20-4f8e-a2ea-7fb2b9f9f03b",
  "status": "done",
  "result": { "alpha": 0.9273, "energy": 0.63, "..." : "..." },
  "backend": "ibm",
  "metadata": {
    "created_at": "2026-04-13T10:00:00.000000+00:00",
    "updated_at": "2026-04-13T10:00:02.300000+00:00",
    "error": null
  }
}
```

#### Job lifecycle

```text
pending → running → done
                 ↘ failed
```

| Status | Meaning |
| --- | --- |
| `pending` | Queued, not yet picked up by the thread pool |
| `running` | IBM job submitted and being executed |
| `done` | Result available in `result` field |
| `failed` | Execution error — check `metadata.error` |

Returns `404` if `job_id` is not found.

---

### `GET /jobs`

List jobs with optional filters.

#### Query parameters

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `limit` | int | `20` | 1 – 100 |
| `offset` | int | `0` | Pagination offset |
| `status` | string | — | Filter: `pending` \| `running` \| `done` \| `failed` |
| `backend` | string | — | Filter: `aer` \| `ibm` |

#### Response

```json
{
  "items": [
    {
      "job_id": "...",
      "status": "done",
      "backend": "aer",
      "alpha": 0.1571,
      "shots": 1024,
      "created_at": "2026-04-13T10:00:00.000000+00:00",
      "updated_at": "2026-04-13T10:00:01.000000+00:00",
      "energy_estimate": 0.024,
      "decision": "accept",
      "resolved_backend": null,
      "execution_source": null,
      "error": null
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "returned": 1,
    "total": 42,
    "has_more": true,
    "next_offset": 20
  },
  "filters": {
    "status": null,
    "backend": null
  }
}
```

---

### `DELETE /jobs`

Delete all job records (user-triggered history clear).

#### Response

```json
{ "deleted": 7 }
```

---

### `POST /sweep/alpha`

Run `n_points` experiments at evenly spaced α ∈ [0, π/2].
Reproduces Figure 2(b) of Stricker et al.: E_est ± σ_E vs α.

Only supports `backend="aer"` (synchronous).

#### Request

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `shots` | int | `1024` | 1 – 1,000,000 |
| `n_points` | int | `30` | 2 – 100 |
| `backend` | `"aer"` | `"aer"` | Fixed |

```json
{ "shots": 1024, "n_points": 30 }
```

#### Response

```json
{
  "points": [
    {
      "alpha": 0.0,
      "energy": 0.001,
      "energy_error": 0.03,
      "energy_theory": 0.0,
      "verdict": "accept"
    }
  ],
  "shots": 1024,
  "n_points": 30
}
```

---

### `POST /sweep/shots`

Run the same α at increasing shot counts to show energy convergence.

Only supports `backend="aer"`.

#### Request

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `alpha` | float | ✅ | — |
| `shots_list` | int[] | — | `[64, 128, 256, 512, 1024, 2048, 4096, 8192]` |
| `backend` | `"aer"` | — | `"aer"` |

```json
{ "alpha": 0.7854, "shots_list": [128, 512, 2048] }
```

#### Response

```json
{
  "points": [
    { "shots": 128, "energy": 0.48, "energy_error": 0.12 },
    { "shots": 512, "energy": 0.50, "energy_error": 0.06 }
  ],
  "alpha": 0.7854
}
```

---

### `POST /sweep/noise`

Sweep depolarizing noise λ at fixed α using `AerSimulator + NoiseModel`.
Shows how energy degrades as λ increases.

#### Request

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `alpha` | float | ✅ | — |
| `shots` | int | — | `1024` |
| `lambda_list` | float[] | — | `[0.0, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]` |

```json
{ "alpha": 0.1571, "shots": 1024, "lambda_list": [0.0, 0.05, 0.1, 0.2] }
```

#### Response

```json
{
  "points": [
    { "lambda": 0.0,  "energy": 0.025, "energy_error": 0.04 },
    { "lambda": 0.05, "energy": 0.18,  "energy_error": 0.05 },
    { "lambda": 0.1,  "energy": 0.35,  "energy_error": 0.06 }
  ],
  "alpha": 0.1571,
  "shots": 1024
}
```

---

## Notes

- Numeric constraints on `alpha`: `0.0 ≤ alpha ≤ π/2` (≈ 1.5707963).
  Values outside this range return `422`.
- The job store (`backend/jobs/job_store.sqlite`) persists across restarts.
  Use `DELETE /jobs` to clear all history, or delete the file to reset.
- IBM credentials must be configured at runtime via `POST /configure/ibm`.
  They are never read from environment variables and are never persisted to disk.
