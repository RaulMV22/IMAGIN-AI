// Import the image generator handler from the specified API route
import handler from "@/pages/api/imageGenerator";
// Import a utility to create mock HTTP requests and responses
import { createMocks } from "node-mocks-http";

// Mocking the Prisma client to avoid real database interactions during tests
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    generatedImage: {
      create: jest.fn(), // Mock the create method of generatedImage
    },
  })),
}));

// Mocking the global fetch function to simulate API calls during tests
global.fetch = jest.fn();

// Describe a test suite for the API route /api/imageGenerator
describe("API /api/imageGenerator", () => {
  // Clear mock calls after each test to ensure clean state
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case to check response when the HTTP method is not POST
  it("responds 405 if the method is not POST", async () => {
    const { req, res } = createMocks({ method: "GET" }); // Create a mock request with GET method
    await handler(req, res); // Call the handler with the mock request and response
    expect(res._getStatusCode()).toBe(405); // Expect a 405 Method Not Allowed response
  });

  // Test case to check response when the prompt is missing in the request body
  it("responds 400 if the prompt is missing", async () => {
    const { req, res } = createMocks({ method: "POST", body: {} }); // Mock POST request without body
    await handler(req, res); // Call the handler
    expect(res._getStatusCode()).toBe(400); // Expect a 400 Bad Request response
  });

  // Test case to check successful image generation
  it("responds 200 if generation is successful", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { prompt: "a happy robot" }, // Mock POST request with a valid prompt
    });

    let callCount = 0; // Initialize a counter to track fetch calls
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      // Mock the fetch implementation based on the URL called
      if (url.includes("predictions")) {
        if (callCount++ === 0) {
          // First fetch call returns a mock prediction ID
          return { json: async () => ({ id: "test-id" }) };
        }
        // Second fetch call simulates a successful generation response
        return {
          json: async () => ({
            status: "succeeded",
            output: ["https://example.com/image.png"], // Mocking the output image URL
          }),
        };
      }
      return { json: async () => ({}) }; // Default empty response for other URLs
    });

    await handler(req, res); // Call the handler
    const result = JSON.parse(res._getData()); // Parse the response data
    expect(res._getStatusCode()).toBe(200); // Expect a 200 OK response
    expect(result.imageUrl).toBe("https://example.com/image.png"); // Validate the image URL in the response
  }, 10000); // Extend timeout for this test case

  // Test case to check response when prediction fails
  it("responds 500 if the prediction fails", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { prompt: "broken" }, // Mock POST request with a prompt that will cause failure
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => ({ id: "123" }) }) // Mock first fetch call to return an ID
      .mockResolvedValueOnce({ json: async () => ({ status: "failed" }) }); // Mock second fetch call to indicate failure

    await handler(req, res); // Call the handler
    expect(res._getStatusCode()).toBe(500); // Expect a 500 Internal Server Error response
  }, 10000); // Extend timeout for this test case

  // Test case to check response when an unexpected error occurs
  it("responds 500 if an unexpected error occurs", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { prompt: "error case" }, // Mock POST request with a prompt that simulates an error
    });

    (global.fetch as jest.Mock).mockImplementation(() => {
      throw new Error("Simulated fetch error"); // Throw an error to simulate a fetch failure
    });

    await handler(req, res); // Call the handler
    expect(res._getStatusCode()).toBe(500); // Expect a 500 Internal Server Error response
  });
});
