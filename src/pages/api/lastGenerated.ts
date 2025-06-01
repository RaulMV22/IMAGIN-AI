import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const images = await prisma.generatedImage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return res.status(200).json(images);
  } catch (error) {
    console.error("Error al obtener las imágenes:", error);
    return res.status(500).json({ error: "Error al cargar las imágenes" });
  }
}
    