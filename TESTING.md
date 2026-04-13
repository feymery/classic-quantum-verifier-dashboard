# Testing Strategy

This document outlines the testing infrastructure, quality gates, and CI pipeline for the Quantum Verification Playground.

## Overview

The project uses a three-tier testing strategy:

1. **Contract Tests** - Verify API payload compatibility between frontend expectations and backend responses
2. **Integration Tests** - Test complete workflows from frontend requests through backend processing
3. **Unit Tests** - Test individual functions and components (planned)

## Frontend Testing (Vitest)

Frontend tests use **Vitest** with React Testing Library and Mock Service Worker (MSW) for API mocking.

### Setup

```bash
npm install  # Already includes test dependencies
```

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Files

```
src/test/
├── setup.ts                    # Global test setup and MSW server
├── mocks/
│   └── handlers.ts             # API contract definitions (Mock Service Worker)
├── api.contract.test.ts        # API contract tests
└── e2e.integration.test.ts     # End-to-end workflow tests
```

### Test Categories

#### Contract Tests (`api.contract.test.ts`)

Verify that **API response shapes match frontend expectations**. These tests define the API contract:

- ✅ `POST /run` returns complete result with observables, energy, counts, probabilities
- ✅ `POST /run` (IBM) returns job metadata with job_id and status
- ✅ `GET /job/:id` returns job status and result in normalized format
- ✅ `GET /jobs` returns list with pagination metadata and filter echo
- ✅ `GET /status` returns service health with backend availability
- ✅ `GET /backends` returns array of backend objects with availability
- ✅ Error responses use normalized `{error: {code, message, details}}` envelope

**Purpose**: Catch incompatibilities between frontend assumptions and backend responses before they reach production.

#### Integration Tests (`e2e.integration.test.ts`)

Verify **complete workflows** from UI to API response:

- ✅ 1Q synchronous execution (submit → get result)
- ✅ IBM asynchronous workflow (submit → poll → get result)
- ✅ 2Q experiment with multi-qubit observables
- ✅ Job history retrieval with filters and pagination
- ✅ Service discovery (status, backends)
- ✅ Error handling and recovery (retry, transient failures)

**Purpose**: Ensure real-world scenarios work end-to-end.

## Backend Testing (pytest)

Backend tests use **pytest** with FastAPI TestClient for synchronous API testing.

### Setup

```bash
pip install pytest pytest-asyncio httpx
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest backend/tests/test_api_contract.py

# Run with markers
pytest -m contract              # Only contract tests
pytest -m integration           # Only integration tests

# Verbose output
pytest -v

# With coverage
pytest --cov=backend backend/tests/
```

### Test Files

```
backend/tests/
├── conftest.py                 # Pytest fixtures and test utilities
├── test_api_contract.py        # API contract tests (payload shape verification)
└── test_api_integration.py     # API integration tests (full endpoint workflows)
```

### Test Categories

#### Contract Tests (`test_api_contract.py`)

Verify **response structure, types, and required fields** for each endpoint:

- ✅ Sync execution (Aer) returns correct result shape with all nested fields
- ✅ Observable keys match circuit (Z1, Z2, Z1Z2, X1X2)
- ✅ Counts format with bitstring keys and values summing to shots
- ✅ Probabilities format and sum to 1.0
- ✅ Backend info metadata correct
- ✅ Async job responses have job_id and status
- ✅ Error responses use normalized envelope with code/message/details
- ✅ Job status endpoint returns correct shape with result and metadata
- ✅ Jobs list includes pagination and filter echo
- ✅ Status and backends endpoints return expected structure

**Markers**: `@pytest.mark.contract`

#### Integration Tests (`test_api_integration.py`)

Verify **complete endpoint workflows and edge cases**:

- ✅ 1Q Aer workflow produces valid energy values
- ✅ Different shot counts affect result variance
- ✅ Different alpha values produce different results
- ✅ Boundary conditions (alpha=0, alpha=1, etc.)
- ✅ Missing fields validation
- ✅ Invalid backend returns error
- ✅ Job not found returns 404 with error envelope
- ✅ Jobs list respects limit, offset, and filters
- ✅ Service health is ok
- ✅ Backends list includes Aer and matches status
- ✅ Invalid JSON and wrong content type handled
- ✅ Multiple concurrent requests handled

**Markers**: `@pytest.mark.integration`

## CI Quality Gates

### Quality Gate Matrix

The CI pipeline enforces a matrix of quality gates:

| Gate | Command | Purpose | Pass Criteria |
|------|---------|---------|---------------|
| **Type Check** | `npx tsc --noEmit` | TypeScript compilation | No TS errors |
| **Lint** | `npm run lint` | Code style | No eslint violations |
| **Frontend Test** | `npm run test:run` | Vitest suite | All tests pass |
| **Backend Test** | `pytest` | pytest suite | All tests pass |
| **Frontend Build** | `npm run build` | Production bundle | No warnings, < 2MB total |
| **Backend Check** | `python3 -m py_compile` | Python syntax | No syntax errors |

### Implementing CI (GitHub Actions)

Example `.github/workflows/quality-gates.yml`:

```yaml
name: Quality Gates

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt pytest pytest-asyncio httpx
      - run: python3 -m py_compile backend/*.py backend/**/*.py
      - run: pytest backend/tests/ -v
```

### Running Quality Gates Locally

Run the complete quality gate suite:

```bash
# Frontend gates
npx tsc --noEmit              # Type check
npm run lint                  # Lint
npm run test:run              # Tests
npm run build                 # Build

# Backend gates
pip install -r backend/requirements.txt pytest pytest-asyncio httpx
python3 -m py_compile backend/*.py backend/jobs/*.py
pytest backend/tests/ -v
```

### Breakage Scenarios

If a quality gate fails:

1. **Type errors** → Fix TypeScript issues or import types from correct modules
2. **Lint errors** → Run `npm run lint` to see violations, fix automatically where possible
3. **Test failures (Frontend)** → Run `npm test` to see failures, inspect test output
4. **Test failures (Backend)** → Run `pytest -v` to see which tests failed
5. **Build warnings** → Check chunk sizes in dist/ output, use lazy loading for large components
6. **Python syntax** → Run `python3 -m py_compile script.py` to find issues

## Test Coverage Goals

### Frontend

- **Contract tests**: 100% API endpoint shape coverage
- **Integration tests**: All major workflows (1Q sync, 2Q sync, IBM async)
- **Component unit tests**: Planned for Phase 2

### Backend

- **Contract tests**: All endpoint response shapes
- **Integration tests**: Workflows, edge cases, error conditions
- **Unit tests**: Executor functions, measurement mappers

Current coverage: **API contract and integration workflows covered**. Component-level unit tests planned.

## API Contract Reference

See [src/test/mocks/handlers.ts](../src/test/mocks/handlers.ts) for the authoritative API contract definitions used in frontend tests.

See [backend/tests/test_api_contract.py](../backend/tests/test_api_contract.py) for the authoritative API contract tests in the backend.

## Troubleshooting

### Vitest Issues

```bash
# Clear cache
rm -rf node_modules/.vitest

# Reinstall
npm install
```

### pytest Issues

```bash
# Clear cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name '*.pyc' -delete

# Reinstall dependencies
pip install --upgrade pytest pytest-asyncio httpx
```

### Build Warnings

Check `npm run build` output for:

- Chunk size warnings (>500 kB)
- TypeScript errors (red text)
- Lint violations

## Next Steps

1. Add component unit tests with React Testing Library
2. Add performance benchmarks for critical paths
3. Add visual regression tests for charting components
4. Add E2E tests with Playwright or Cypress for full browser testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Mock Service Worker (MSW)](https://mswjs.io/)
- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
