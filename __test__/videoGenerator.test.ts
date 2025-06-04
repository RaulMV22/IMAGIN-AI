/**
 * Test suite for the /api/videoGenerator API endpoint
 */
import handler from "@/pages/api/videoGenerator"; // Import the API handler
import { createMocks } from "node-mocks-http"; // Import mock creation utility
import { jest } from "@jest/globals"; // Import jest for testing

// Suppress console error messages during test execution
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Mock Prisma Client to avoid real database interactions
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    generatedVideo: {
      create: jest.fn(), // Mock create method
    },
  })),
}));

describe("API /api/videoGenerator", () => {
  // Reset modules after each test to prevent mock interference
  afterEach(() => {
    jest.resetModules();
  });

  // Test case for non-POST requests
  it("responde 405 si no es POST", async () => {
    const { req, res } = createMocks({ method: "GET" }); // Create mock request/response
    const handler = (await import("@/pages/api/videoGenerator")).default; // Import handler
    await handler(req, res); // Execute handler
    expect(res._getStatusCode()).toBe(405); // Assert status code is 405
  });

  // Test case for missing prompt in POST request
  it("responde 400 si no hay prompt", async () => {
    const { req, res } = createMocks({ method: "POST", body: {} }); // Empty body
    const handler = (await import("@/pages/api/videoGenerator")).default; // Import handler
    await handler(req, res); // Execute handler
    expect(res._getStatusCode()).toBe(400); // Assert status code is 400
  });

  // Test case for successful video generation
  it("responde 200 si el video es generado correctamente", async () => {
    jest.mock("replicate", () => {
      return jest.fn().mockImplementation(() => ({
        run: jest.fn().mockResolvedValue(["https://fakevideo.com/output.mp4"]), // Mock successful response
      }));
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { prompt: "robot surfing on a wave" }, // Valid prompt
    });

    const handler = (await import("@/pages/api/videoGenerator")).default; // Import handler
    await handler(req, res); // Execute handler
    const data = JSON.parse(res._getData()); // Parse response data

    expect(res._getStatusCode()).toBe(200); // Assert status code is 200
    expect(data.videoUrl).toBe("https://fakevideo.com/output.mp4"); // Assert video URL
  });

  // Test case for invalid response from Replicate
  it("responde 500 si el resultado de Replicate es inválido", async () => {
    jest.mock("replicate", () => {
      return jest.fn().mockImplementation(() => ({
        run: jest.fn().mockResolvedValue(null), // Invalid response
      }));
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { prompt: "invalid response test" }, // Valid prompt
    });

    const handler = (await import("@/pages/api/videoGenerator")).default; // Import handler
    await handler(req, res); // Execute handler
    expect(res._getStatusCode()).toBe(500); // Assert status code is 500
  });

  // Test case for execution error
  it("responde 500 si ocurre un error en la ejecución", async () => {
    jest.mock("replicate", () => {
      return jest.fn().mockImplementation(() => ({
        run: jest.fn().mockRejectedValue(new Error("Simulated Replicate error")), // Simulate error
      }));
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { prompt: "error test" }, // Valid prompt
    });

    const handler = (await import("@/pages/api/videoGenerator")).default; // Import handler
    await handler(req, res); // Execute handler
    expect(res._getStatusCode()).toBe(500); // Assert status code is 500
  });

  // Test case for successful video generation with JSON response
  it("devuelve un JSON con videoUrl si se genera", async () => {
    jest.mock("replicate", () => {
      return jest.fn().mockImplementation(() => ({
        run: jest.fn().mockResolvedValue(["https://another-fake.com/video.mp4"]), // Mock successful response
      }));
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { prompt: "test video" }, // Valid prompt
    });

    const handler = (await import("@/pages/api/videoGenerator")).default; // Import handler
    await handler(req, res); // Execute handler
    const json = res._getJSONData(); // Get JSON data from response
    expect(json).toHaveProperty("videoUrl"); // Assert that videoUrl property exists
  });
});
