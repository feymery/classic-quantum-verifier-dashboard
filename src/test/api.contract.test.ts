import { describe, it, expect } from "vitest";
import { mockServer } from "./setup";
import { HttpResponse, http } from "msw";

const API_BASE = "http://localhost:8000";

/**
 * Contract Tests for API Payload Compatibility
 *
 * These tests verify that:
 * 1. Frontend expectations match API response shapes
 * 2. All required fields are present
 * 3. Data types are correct (string vs number, array vs object, etc.)
 * 4. Error envelopes are normalized
 */

describe("API Contract Tests", () => {
  describe("POST /run - Synchronous execution (Aer)", () => {
    it("returns result with required fields for 1Q mode", async () => {
      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alpha: 0.9273,
          shots: 1024,
          backend: "aer",
        }),
      });

      const data = await response.json();

      // Contract: Result shape
      expect(data).toHaveProperty("alpha");
      expect(data).toHaveProperty("observables");
      expect(data).toHaveProperty("noisyObservables");
      expect(data).toHaveProperty("energy");
      expect(data).toHaveProperty("counts");
      expect(data).toHaveProperty("probabilities");
      expect(data).toHaveProperty("backendInfo");

      // Contract: Type checks
      expect(typeof data.alpha).toBe("number");
      expect(typeof data.energy).toBe("number");
      expect(typeof data.observables).toBe("object");
      expect(typeof data.counts).toBe("object");
      expect(typeof data.probabilities).toBe("object");

      // Contract: Backend info
      expect(data.backendInfo).toHaveProperty("type");
      expect(data.backendInfo).toHaveProperty("shots");
      expect(data.backendInfo).toHaveProperty("executionTime");
      expect(data.backendInfo.type).toBe("aer");
      expect(data.backendInfo.shots).toBe(1024);
    });

    it("contains expected observables for Bell state", async () => {
      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alpha: 0.9273,
          shots: 1024,
          backend: "aer",
        }),
      });

      const data = await response.json();

      // Contract: Observable keys
      expect(data.observables).toHaveProperty("Z1");
      expect(data.observables).toHaveProperty("Z2");
      expect(data.observables).toHaveProperty("Z1Z2");
      expect(data.observables).toHaveProperty("X1X2");

      // Each observable should be a number
      Object.values(data.observables).forEach((val) => {
        expect(typeof val).toBe("number");
      });
    });
  });

  describe("POST /run - Asynchronous submission (IBM)", () => {
    it("returns job metadata for IBM backend", async () => {
      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alpha: 0.9273,
          shots: 1024,
          backend: "ibm",
        }),
      });

      const data = await response.json();

      // Contract: Job submission shape
      expect(data).toHaveProperty("job_id");
      expect(data).toHaveProperty("status");

      // Contract: Types and values
      expect(typeof data.job_id).toBe("string");
      expect(data.status).toBe("queued");
    });
  });

  describe("GET /job/:id - Job status polling", () => {
    it("returns completed job with result", async () => {
      const response = await fetch(`${API_BASE}/job/test-job-123`);
      const data = await response.json();

      // Contract: Job shape
      expect(data).toHaveProperty("job_id");
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("result");
      expect(data).toHaveProperty("backend");
      expect(data).toHaveProperty("metadata");

      // Contract: Status value
      expect(data.status).toBe("done");

      // Contract: Metadata shape
      expect(data.metadata).toHaveProperty("created_at");
      expect(data.metadata).toHaveProperty("updated_at");
      expect(data.metadata).toHaveProperty("error");
      expect(data.metadata).toHaveProperty("execution_backend");
    });

    it("returns 404 for unknown job", async () => {
      mockServer.use(
        http.get(`${API_BASE}/job/:id`, () => {
          return HttpResponse.json(
            {
              error: {
                code: "not_found",
                message: "Job not found",
                details: null,
              },
            },
            { status: 404 },
          );
        }),
      );

      const response = await fetch(`${API_BASE}/job/nonexistent`);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error.code).toBe("not_found");
    });
  });

  describe("GET /jobs - Job listing with pagination", () => {
    it("returns jobs list with pagination metadata", async () => {
      const response = await fetch(`${API_BASE}/jobs?limit=10&offset=0`);
      const data = await response.json();

      // Contract: List shape
      expect(data).toHaveProperty("items");
      expect(data).toHaveProperty("pagination");
      expect(data).toHaveProperty("filters");

      // Contract: Items is array
      expect(Array.isArray(data.items)).toBe(true);

      // Contract: Pagination metadata
      expect(data.pagination).toHaveProperty("limit");
      expect(data.pagination).toHaveProperty("offset");
      expect(data.pagination).toHaveProperty("returned");
      expect(data.pagination).toHaveProperty("total");
      expect(data.pagination).toHaveProperty("has_more");
      expect(data.pagination).toHaveProperty("next_offset");

      // Contract: Filter echo
      expect(data.filters).toHaveProperty("status");
      expect(data.filters).toHaveProperty("backend");
      expect(data.filters).toHaveProperty("mode");
    });
  });

  describe("GET /status - Service health", () => {
    it("returns status with backend availability", async () => {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();

      // Contract: Status shape
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("execution_mode");
      expect(data).toHaveProperty("backends");
      expect(data).toHaveProperty("job_system");

      // Contract: Backends object
      expect(data.backends).toHaveProperty("aer");
      expect(data.backends).toHaveProperty("ibm");
    });
  });

  describe("GET /backends - Available backends", () => {
    it("returns array of backend options", async () => {
      const response = await fetch(`${API_BASE}/backends`);
      const data = await response.json();

      // Contract: Array of objects
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Contract: Each backend has required fields
      data.forEach((backend: Record<string, unknown>) => {
        expect(backend).toHaveProperty("name");
        expect(backend).toHaveProperty("available");
        expect(typeof backend.name).toBe("string");
        expect(typeof backend.available).toBe("boolean");
      });
    });
  });

  describe("Error responses - Normalized error envelope", () => {
    it("returns error with normalized shape for validation errors", async () => {
      mockServer.use(
        http.post(`${API_BASE}/run`, () => {
          return HttpResponse.json(
            {
              error: {
                code: "validation_error",
                message: "Invalid request parameters",
                details: {
                  field: "alpha",
                  reason: "must be between 0 and 1",
                },
              },
            },
            { status: 400 },
          );
        }),
      );

      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backend: "aer" }), // missing required fields
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      // Contract: Error envelope
      expect(data).toHaveProperty("error");
      expect(data.error).toHaveProperty("code");
      expect(data.error).toHaveProperty("message");
      expect(data.error).toHaveProperty("details");

      expect(typeof data.error.code).toBe("string");
      expect(typeof data.error.message).toBe("string");
    });

    it("returns server error with consistent envelope", async () => {
      mockServer.use(
        http.post(`${API_BASE}/run`, () => {
          return HttpResponse.json(
            {
              error: {
                code: "internal_error",
                message: "Internal server error",
                details: null,
              },
            },
            { status: 500 },
          );
        }),
      );

      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alpha: 0.5,
          shots: 1024,
          backend: "aer",
        }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data.error.code).toBe("internal_error");
      expect(data.error).toHaveProperty("message");
    });
  });
});
