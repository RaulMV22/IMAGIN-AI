import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const images = await prisma.generatedImage.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const videos = await prisma.generatedVideo.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const all = [
      ...images.map((i) => ({ ...i, type: "image", url: i.imageUrl })),
      ...videos.map((v) => ({ ...v, type: "video", url: v.videoUrl })),
    ];

    const sorted = all.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json(sorted.slice(0, 25));
  } catch (error) {
    console.error("Error al obtener medios:", error);
    return res.status(500).json({ error: "Error al cargar medios" });
  }
}
