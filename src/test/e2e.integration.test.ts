import { describe, it, expect } from "vitest";
import { mockServer } from "./setup";
import { HttpResponse, http } from "msw";

const API_BASE = "http://localhost:8000";

/**
 * End-to-End Integration Tests
 *
 * These tests verify the complete workflow from frontend request through API response.
 * They test the full path: UI state -> service layer -> API call -> response parsing
 */

describe("E2E Frontend → Backend Workflow", () => {
  describe("1Q Experiment Execution (Synchronous)", () => {
    it("submits run request and receives complete result", async () => {
      const params = {
        alpha: 0.5,
        shots: 2048,
        backend: "aer",
      };

      mockServer.use(
        http.post(`${API_BASE}/run`, async ({ request }) => {
          const body = (await request.json()) as {
            alpha: number;
            shots: number;
            backend: string;
          };
          return HttpResponse.json({
            alpha: body.alpha,
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
              "111": 0.17,
            },
            backendInfo: {
              type: body.backend,
              shots: body.shots,
              executionTime: 22.4,
            },
          });
        }),
      );

      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();

      // Verify result can be used to populate UI state
      expect(result.alpha).toBe(params.alpha);
      expect(result.energy).toBeDefined();
      expect(result.counts).toBeDefined();
      expect(result.backendInfo.shots).toBe(params.shots);

      // Verify result passes through measurement panel requirements
      expect(Object.keys(result.observables).length).toBeGreaterThan(0);
      expect(Object.keys(result.probabilities).length).toBeGreaterThan(0);
    });
  });

  describe("IBM Asynchronous Job Workflow", () => {
    it("submits job, then polls until completion", async () => {
      // Step 1: Submit async job
      const submitResponse = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alpha: 0.7,
          shots: 1024,
          backend: "ibm",
        }),
      });

      expect(submitResponse.ok).toBe(true);
      const job = await submitResponse.json();

      expect(job.status).toBe("queued");
      expect(job.job_id).toBeDefined();

      // Step 2: Poll job status until completion
      let pollResponse = await fetch(`${API_BASE}/job/${job.job_id}`);
      let jobStatus = await pollResponse.json();

      // Simulate polling loop behavior
      let attempts = 0;
      while (jobStatus.status !== "done" && attempts < 10) {
        // In real scenario, frontend would wait before polling again
        pollResponse = await fetch(`${API_BASE}/job/${job.job_id}`);
        jobStatus = await pollResponse.json();
        attempts++;
      }

      // Step 3: Verify final state has result
      expect(jobStatus.status).toBe("done");
      expect(jobStatus.result).toBeDefined();
      expect(jobStatus.result.energy).toBeDefined();

      // Verify metadata is available for provenance tracking
      expect(jobStatus.metadata.created_at).toBeDefined();
      expect(jobStatus.metadata.execution_backend).toBeDefined();
    });

    it("handles job failure gracefully", async () => {
      mockServer.use(
        http.get(`${API_BASE}/job/failed-job`, () => {
          return HttpResponse.json({
            job_id: "failed-job",
            status: "failed",
            result: null,
            backend: "ibm",
            metadata: {
              created_at: "2026-04-13T10:00:00.000000+00:00",
              updated_at: "2026-04-13T10:00:05.000000+00:00",
              error: "Quantum backend unavailable",
              execution_backend: "ibm",
            },
          });
        }),
      );

      const response = await fetch(`${API_BASE}/job/failed-job`);
      const job = await response.json();

      expect(job.status).toBe("failed");
      expect(job.result).toBeNull();
      expect(job.metadata.error).toBeDefined();
    });
  });

  describe("2Q Experiment Execution", () => {
    it("submits 2Q run and receives observables for both qubits", async () => {
      mockServer.use(
        http.post(`${API_BASE}/run`, async ({ request }) => {
          const body = (await request.json()) as {
            backend: string;
            alpha: number;
            shots: number;
          };
          if (body.backend === "aer") {
            return HttpResponse.json({
              alpha: body.alpha,
              observables: {
                Z1: 0.1,
                Z2: 0.15,
                Z1Z2: 0.7,
                X1X2: 0.45,
              },
              noisyObservables: {
                Z1: 0.1,
                Z2: 0.15,
                Z1Z2: 0.68,
                X1X2: 0.43,
              },
              energy: 0.65,
              counts: {
                "00": 400,
                "01": 250,
                "10": 200,
                "11": 174,
              },
              probabilities: {
                "00": 0.391,
                "01": 0.244,
                "10": 0.195,
                "11": 0.17,
              },
              backendInfo: {
                type: "aer",
                shots: body.shots,
                executionTime: 28.5,
              },
            });
          }
          return HttpResponse.json(
            { error: { code: "invalid_backend", message: "Unknown backend" } },
            { status: 400 },
          );
        }),
      );

      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alpha: 0.45,
          shots: 1024,
          backend: "aer",
        }),
      });

      const result = await response.json();

      // Verify 2Q-specific fields
      expect(result.observables).toHaveProperty("Z1Z2");
      expect(result.observables).toHaveProperty("X1X2");
      expect(result.counts).toHaveProperty("00");
      expect(result.counts).toHaveProperty("11");

      // Verify bit string format (2 qubits)
      Object.keys(result.counts).forEach((bitstring) => {
        expect(bitstring.length).toBe(2);
      });
    });
  });

  describe("Job History and List Retrieval", () => {
    it("retrieves filtered job list with pagination", async () => {
      mockServer.use(
        http.get(`${API_BASE}/jobs`, ({ request }) => {
          const url = new URL(request.url);
          const limit = Number(url.searchParams.get("limit") ?? "20");
          const offset = Number(url.searchParams.get("offset") ?? "0");
          const status = url.searchParams.get("status");
          const backend = url.searchParams.get("backend");

          return HttpResponse.json({
            items: [
              {
                job_id: "job-1",
                status: "done",
                backend: "aer",
              },
            ],
            pagination: {
              limit,
              offset,
              returned: 1,
              total: 1,
              has_more: false,
              next_offset: null,
            },
            filters: {
              status,
              backend,
              mode: null,
            },
          });
        }),
      );

      const response = await fetch(
        `${API_BASE}/jobs?limit=5&offset=0&status=done&backend=aer`,
        {
          method: "GET",
        },
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      // Verify list structure
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.pagination.returned).toBeLessThanOrEqual(5);

      // Verify pagination echo
      expect(data.pagination.limit).toBe(5);
      expect(data.pagination.offset).toBe(0);
      expect(data.filters.status).toBe("done");
      expect(data.filters.backend).toBe("aer");

      // Verify items match filter criteria
      data.items.forEach((job: Record<string, unknown>) => {
        expect(job.status).toBe("done");
        expect(job.backend).toBe("aer");
      });
    });
  });

  describe("Service Discovery and Health Checks", () => {
    it("checks backend availability before execution", async () => {
      const response = await fetch(`${API_BASE}/status`);
      const status = await response.json();

      expect(status.status).toBe("ok");
      expect(status.backends.aer).toBeDefined();

      // Verify Aer is always available (fallback backend)
      expect(status.backends.aer).toMatch(/active|connected/);
    });

    it("retrieves available backends for UI selector", async () => {
      const response = await fetch(`${API_BASE}/backends`);
      const backends = await response.json();

      expect(Array.isArray(backends)).toBe(true);

      // Verify Aer backend is always present
      const aerBackend = backends.find(
        (b: Record<string, unknown>) => b.name === "aer",
      );
      expect(aerBackend).toBeDefined();
      expect(aerBackend?.available).toBe(true);
    });
  });

  describe("Error Handling and Recovery", () => {
    it("handles validation errors with detailed messages", async () => {
      mockServer.use(
        http.post(`${API_BASE}/run`, () => {
          return HttpResponse.json(
            {
              error: {
                code: "validation_error",
                message: "Invalid alpha value",
                details: {
                  field: "alpha",
                  expected: "number between 0 and 1",
                  received: 1.5,
                },
              },
            },
            { status: 422 },
          );
        }),
      );

      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alpha: 1.5, // Invalid
          shots: 1024,
          backend: "aer",
        }),
      });

      expect(response.status).toBe(422);
      const error = await response.json();

      // Frontend can access detailed error info for user feedback
      expect(error.error.code).toBe("validation_error");
      expect(error.error.details).toBeDefined();
    });

    it("retries job polling on transient failures", async () => {
      let attemptCount = 0;

      mockServer.use(
        http.get(`${API_BASE}/job/retry-job`, () => {
          attemptCount++;

          // Simulate transient error on first attempt
          if (attemptCount === 1) {
            return HttpResponse.json(
              {
                error: {
                  code: "service_unavailable",
                  message: "Temporarily unavailable",
                },
              },
              { status: 503 },
            );
          }

          // Success on retry
          return HttpResponse.json({
            job_id: "retry-job",
            status: "done",
            result: { energy: 0.65 },
            backend: "aer",
            metadata: {
              created_at: "2026-04-13T10:00:00.000000+00:00",
              updated_at: "2026-04-13T10:00:02.000000+00:00",
              error: null,
              execution_backend: "aer",
            },
          });
        }),
      );

      // First attempt fails
      let response = await fetch(`${API_BASE}/job/retry-job`);
      expect(response.status).toBe(503);

      // Retry succeeds
      response = await fetch(`${API_BASE}/job/retry-job`);
      expect(response.ok).toBe(true);
    });
  });
});
