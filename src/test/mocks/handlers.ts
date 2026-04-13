import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:8000";

/**
 * API Contract Definitions
 *
 * These handlers define the expected API response shapes and status codes.
 * They serve as contract tests - if frontend code violates these shapes,
 * tests will fail before reaching the actual backend.
 */

// Contract: Successful 1Q run with Aer backend
const successfulAerRun = {
  alpha: 0.9273,
  observables: {
    Z1: 0.09,
    Z2: 0.08,
    Z1Z2: 0.65,
    X1X2: 0.41,
  },
  noisyObservables: {
    Z1: 0.09,
    Z2: 0.08,
    Z1Z2: 0.65,
    X1X2: 0.41,
  },
  energy: 0.63,
  counts: {
    "000": 510,
    "100": 330,
    "111": 184,
  },
  probabilities: {
    "000": 0.498,
    "100": 0.322,
    "111": 0.18,
  },
  backendInfo: {
    type: "aer",
    shots: 1024,
    executionTime: 22.4,
  },
};

// Contract: Job submission (async IBM)
const pendingJobSubmission = {
  job_id: "test-job-123",
  status: "queued",
};

// Contract: Job status response
const completedJobStatus = {
  job_id: "test-job-123",
  status: "done",
  result: successfulAerRun,
  backend: "aer",
  metadata: {
    created_at: "2026-04-13T10:00:00.000000+00:00",
    updated_at: "2026-04-13T10:00:02.300000+00:00",
    error: null,
    execution_backend: "aer",
  },
};

// Contract: Jobs list with filtering
const jobsList = {
  items: [completedJobStatus],
  pagination: {
    limit: 10,
    offset: 0,
    returned: 1,
    total: 1,
    has_more: false,
    next_offset: null,
  },
  filters: {
    status: null,
    backend: null,
    mode: null,
  },
};

// Contract: Service status
const serviceStatus = {
  status: "ok",
  execution_mode: "sync + async",
  backends: {
    aer: "active",
    ibm: "connected",
  },
  job_system: "active",
};

// Contract: Backend availability
const backendsAvailable = [
  { name: "aer", available: true },
  { name: "ibm", available: false },
];

// Contract: Error response (normalized)
const errorResponse = (code: string, message: string) => ({
  error: {
    code,
    message,
    details: null,
  },
});

export const handlers = [
  /**
   * POST /run
   * Synchronous execution (Aer) returns immediate result
   * Asynchronous execution (IBM) returns job metadata
   */
  http.post(`${API_BASE}/run`, async ({ request }) => {
    const body = (await request.json()) as { backend: string };
    const { backend } = body;

    if (backend === "aer") {
      return HttpResponse.json(successfulAerRun);
    } else if (backend === "ibm") {
      return HttpResponse.json(pendingJobSubmission);
    }

    return HttpResponse.json(
      errorResponse("invalid_backend", "Unknown backend"),
      { status: 400 },
    );
  }),

  /**
   * GET /job/:id
   * Poll for async job status and result
   */
  http.get(`${API_BASE}/job/:id`, ({ params }) => {
    const { id } = params;

    if (id === "test-job-123") {
      return HttpResponse.json(completedJobStatus);
    }

    return HttpResponse.json(errorResponse("not_found", "Job not found"), {
      status: 404,
    });
  }),

  /**
   * GET /jobs
   * List jobs with optional filtering and pagination
   */
  http.get(`${API_BASE}/jobs`, () => {
    return HttpResponse.json(jobsList);
  }),

  /**
   * GET /status
   * Service health and backend availability
   */
  http.get(`${API_BASE}/status`, () => {
    return HttpResponse.json(serviceStatus);
  }),

  /**
   * GET /backends
   * List available backends
   */
  http.get(`${API_BASE}/backends`, () => {
    return HttpResponse.json(backendsAvailable);
  }),
];
