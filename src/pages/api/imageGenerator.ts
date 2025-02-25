import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Falta el prompt" });
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "c6b5d2b7459910fec94432e9e1203c3cdce92d6db20f714f1355747990b52fa6",
        input: {
          width: 1024,
          height: 1024,
          prompt: prompt,
          model_variant: "1600M-1024px",
          guidance_scale: 5,
          negative_prompt: "",
          pag_guidance_scale: 2,
          num_inference_steps: 18,
        },
      }),
    });

    const prediction = await response.json();
    console.log("Respuesta inicial de la API de Replicate:", prediction);

    if (!prediction || !prediction.id) {
      return res.status(500).json({ error: "No se pudo generar la imagen en Replicate", details: prediction });
    }

    const startTime = Date.now();
    const pollingInterval = 5000;
    const maxWaitTime = 300000;

    let result;

    while (Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));

      const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      result = await checkResponse.json();
      console.log("Estado actual de la imagen:", result);

      if (result.status === "succeeded" && result.output) {
        if (typeof result.output === "string") {
          return res.status(200).json({ imageUrl: result.output });
        } else if (Array.isArray(result.output) && result.output.length > 0) {
          return res.status(200).json({ imageUrl: result.output[0] });
        }
      } else if (result.status === "failed") {
        return res.status(500).json({ error: "Falló la generación de la imagen", details: result });
      }
    }

    return res.status(504).json({ error: "Tiempo de espera agotado en la API de Replicate" });
  } catch (error) {
    console.error("Error en la API de Replicate:", error);
    return res.status(500).json({ error: "Error en la generación de la imagen" });
  }
}
