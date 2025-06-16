import { PrismaClient } from "@prisma/client"; // Importing PrismaClient to interact with the database
import type { NextApiRequest, NextApiResponse } from "next"; // Importing types for API request and response

const prisma = new PrismaClient(); // Initializing a new instance of PrismaClient

// Default export of the API handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if the request method is not POST
  if (req.method !== "POST") {
    // Respond with 405 Method Not Allowed if the method is not POST
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body; // Extracting 'prompt' from the request body

  // Check if the prompt is missing
  if (!prompt) {
    // Respond with 400 Bad Request if the prompt is not provided
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    // Sending a POST request to the Replicate API to generate a prediction
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST", // HTTP method
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`, // Authorization header with API key
        "Content-Type": "application/json", // Content type for the request
      },
      body: JSON.stringify({
        version: "c6b5d2b7459910fec94432e9e1203c3cdce92d6db20f714f1355747990b52fa6", // Model version
        input: {
          width: 1024, // Width of the generated image
          height: 1024, // Height of the generated image
          prompt, // Prompt for the image generation
          model_variant: "1600M-1024px", // Variant of the model used
          guidance_scale: 5, // Guidance scale for the generation
          pag_guidance_scale: 2, // Additional guidance scale
          num_inference_steps: 18, // Number of inference steps
        },
      }),
    });

    const prediction = await response.json(); // Await the JSON response from the API
    // Check if the prediction response is valid
    if (!prediction || !prediction.id) {
      // Respond with 500 Internal Server Error if prediction ID is missing
      return res.status(500).json({ error: "Could not generate the image", details: prediction });
    }

    const startTime = Date.now(); // Record the start time for polling
    const maxWaitTime = 300000; // Maximum wait time for polling (5 minutes)
    const pollingInterval = 5000; // Interval for polling (5 seconds)

    let result; // Variable to hold the polling result

    // Polling to check the status of the prediction until the max wait time is reached
    while (Date.now() - startTime < maxWaitTime) {
      await new Promise((r) => setTimeout(r, pollingInterval)); // Wait for the polling interval

      // Fetch the status of the prediction from the Replicate API
      const check = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`, // Authorization header with API key
        },
      });

      result = await check.json(); // Await the JSON response from the status check

      // Check if the prediction succeeded
      if (result.status === "succeeded" && result.output) {
        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output; // Get the image URL

        // 👉 Save the generated image details in the database
        await prisma.generatedImage.create({
          data: { prompt, imageUrl }, // Save the prompt and image URL
        });

        // Respond with the image URL on success
        return res.status(200).json({ imageUrl });
      } else if (result.status === "failed") {
        // Respond with 500 Internal Server Error if the generation failed
        return res.status(500).json({ error: "Image generation failed" });
      }
    }

    // Respond with 504 Gateway Timeout if the maximum wait time is exceeded
    return res.status(504).json({ error: "Wait time exceeded" });
  } catch (error) {
    console.error("Error:", error); // Log any errors encountered
    // Respond with 500 Internal Server Error for any unexpected errors
    return res.status(500).json({ error: "Internal error" });
  }
}
