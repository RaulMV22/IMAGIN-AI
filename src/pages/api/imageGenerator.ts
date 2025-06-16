import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

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
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "c6b5d2b7459910fec94432e9e1203c3cdce92d6db20f714f1355747990b52fa6",
        input: {
          width: 1024,
          height: 1024,
          prompt,
          model_variant: "1600M-1024px",
          guidance_scale: 5,
          pag_guidance_scale: 2,
          num_inference_steps: 18,
        },
      }),
    });

    const prediction = await response.json();
    if (!prediction || !prediction.id) {
      return res.status(500).json({ error: "No se pudo generar la imagen", details: prediction });
    }

    const startTime = Date.now();
    const maxWaitTime = 300000;
    const pollingInterval = 5000;

    let result;

    while (Date.now() - startTime < maxWaitTime) {
      await new Promise((r) => setTimeout(r, pollingInterval));

      const check = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        },
      });

      result = await check.json();

      if (result.status === "succeeded" && result.output) {
        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

        // 👉 Guardar en base de datos
        await prisma.generatedImage.create({
          data: { prompt, imageUrl },
        });

        return res.status(200).json({ imageUrl });
      } else if (result.status === "failed") {
        return res.status(500).json({ error: "Falló la generación de la imagen" });
      }
    }

    return res.status(504).json({ error: "Tiempo de espera agotado" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
