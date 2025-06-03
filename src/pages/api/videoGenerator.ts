import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import Replicate from "replicate";

const prisma = new PrismaClient();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Falta un prompt válido" });
  }

  try {
    const input = {
      style: "None",
      effect: "None",
      prompt,
      quality: "1080p",
      duration: 5,
      motion_mode: "normal",
      aspect_ratio: "16:9",
      negative_prompt: ""
    };

    const output = await replicate.run("pixverse/pixverse-v4", { input });

    const videoUrl = typeof output === "string" ? output : Array.isArray(output) ? output[0] : null;

    if (!videoUrl || !videoUrl.startsWith("http")) {
      return res.status(500).json({ error: "No se pudo obtener el video generado" });
    }

    // Guardar en la base de datos
    await prisma.generatedVideo.create({
      data: {
        prompt,
        videoUrl
      }
    });

    return res.status(200).json({ videoUrl });
  } catch (error) {
    console.error("Error al generar video:", error);
    return res.status(500).json({ error: "Error interno al generar el video" });
  }
}
